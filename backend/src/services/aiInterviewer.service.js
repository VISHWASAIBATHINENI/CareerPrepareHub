/**
 * aiInterviewer.service.js
 *
 * All AI interaction for the mock interview system using Google Gemini API (gemini-3.5-flash).
 * - Lazy-initialises the GoogleGenerativeAI client so the server starts without an API key.
 * - generateNextQuestion: called per answer; evaluates answer + picks next question.
 * - generateInterviewReport: called at end of session to produce the full report.
 *
 * Resume-based and project-based interviews are driven entirely from
 * structured resume context — the AI is explicitly instructed not to invent
 * information not present in the resume.
 *
 * Communication is evaluated as "AI Communication Assessment" based on
 * written text quality (clarity, structure, vocabulary, completeness).
 * We NEVER claim to measure voice, tone, or spoken confidence.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import logger from '../logger/index.js';
import { ApiError } from '../middleware/error.middleware.js';

/* ─────────────────────────────────────────────────
   Lazy-initialise the Gemini client so the server
   starts even without an API key configured yet.
───────────────────────────────────────────────── */
let _genAI = null;

const getGenAI = () => {
  const apiKey = (process.env.GEMINI_API_KEY || env.geminiApiKey || process.env.OPENAI_API_KEY || env.openaiApiKey || '').trim();
  if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'your_gemini_api_key_here') {
    throw new ApiError(
      'Gemini API key is not configured. Please add GEMINI_API_KEY to backend/.env',
      503,
      'GEMINI_NOT_CONFIGURED',
    );
  }
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
};

/* ─────────────────────────────────────────────────
   Build the system prompt — all interview context
   goes here so the conversation history stays lean.
───────────────────────────────────────────────── */
const buildSystemPrompt = ({
  interviewType,
  selectedTopics,
  difficulty,
  questionLimit,
  currentQuestionNumber,
  resumeContext,
  previousQuestions,
}) => {
  const topicList = selectedTopics.length > 0
    ? selectedTopics.join(', ')
    : 'General';

  const resumeSection = resumeContext
    ? `\nCANDIDATE RESUME / BACKGROUND CONTEXT:\n${resumeContext}\n`
    : '\n(No resume provided — generate questions based on selected topics only)\n';

  const prevQList = previousQuestions.length > 0
    ? previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    : 'None yet.';

  // Determine topic constraint wording based on interview type
  let topicConstraint;
  if (interviewType === 'HR') {
    topicConstraint = `Ask behavioral and HR-focused questions about:
- Work ethic, teamwork, conflict resolution, leadership
- Strengths and weaknesses
- Career goals and motivation
- Communication style and collaboration
- Situational/behavioral scenarios
If resume is provided, reference the candidate's actual experience naturally.
Do NOT ask technical coding or system design questions in an HR interview.`;
  } else if (interviewType === 'Resume Based') {
    topicConstraint = `IMPORTANT — Resume-Based Interview Rules:
1. Ask questions EXCLUSIVELY based on the resume context provided above.
2. Ask about specific PROJECTS mentioned in the resume — their architecture, technology choices, challenges, and design decisions.
3. Ask about specific SKILLS and TECHNOLOGIES listed in the resume — go deeper, ask WHY they chose those technologies.
4. Ask about EXPERIENCE, INTERNSHIPS, and EDUCATION mentioned.
5. Do NOT invent information not present in the resume.
6. Ask project follow-ups: "You mentioned X in your CareerPrepHub project — why did you choose MongoDB instead of SQL?"
7. Probe deeper based on candidate's answers about their own projects.`;
  } else if (interviewType === 'Resume + Technical') {
    topicConstraint = `IMPORTANT — Resume + Technical Interview Rules:
1. Mix resume-based questions AND technical topic questions.
2. PRIORITY ORDER:
   a) Resume/project-specific questions (ask about actual projects and tech stack from resume)
   b) Selected technical topic questions: ${topicList}
   c) Follow-up questions based on candidate's answers
3. Ask about specific PROJECTS in the resume with technical depth.
4. Probe WHY technology choices were made in their projects.
5. Also ask conceptual/theoretical questions on selected topics.
6. Cross-reference: if resume mentions Java and Java is a selected topic, ask Java questions in the context of their project.`;
  } else {
    // Technical or Technical + HR
    const hrNote = interviewType === 'Technical + HR'
      ? '\nAfter covering technical topics, include 2-3 HR/behavioral questions towards the end.'
      : '';
    topicConstraint = `Ask questions STRICTLY within these topics: ${topicList}. Do NOT ask about unrelated technologies unless they appear in the resume.${hrNote}
Focus on: conceptual understanding, practical application, problem-solving, and depth of knowledge.`;
  }

  return `You are a senior technical interviewer conducting a structured mock interview. You are NOT a tutor — do not explain answers, give hints, or reveal correct answers during the interview.

INTERVIEW CONFIGURATION:
- Interview Type: ${interviewType}
- Selected Topics: ${topicList}
- Difficulty Level: ${difficulty}
- Question Number: ${currentQuestionNumber + 1}
${resumeSection}
INTERVIEW RULES:
1. Ask EXACTLY ONE question per response. Never ask multiple questions at once.
2. Do NOT reveal answers, give hints, or teach during the interview.
3. Evaluate the candidate's answer internally — use it to decide the next question.
4. ${topicConstraint}
5. DIFFICULTY ADAPTATION:
   - Strong, complete answer → increase difficulty or ask a deeper follow-up
   - Incomplete/partial answer → ask a clarifying follow-up or simpler related question
   - Incorrect answer → ask a fundamental question to test basic understanding
   - Demonstrates deep knowledge → ask advanced, edge-case, or architectural questions
6. Avoid repeating previously asked questions (see list below).
7. Reference the candidate's resume/projects naturally when relevant.
8. Keep a professional, neutral interview tone — not excessively encouraging or harsh.
9. Do not act like a chatbot — maintain strict interview format.
10. For project-based questions, ask WHY they made specific decisions, not just WHAT.

PREVIOUSLY ASKED QUESTIONS (do NOT repeat or closely paraphrase):
${prevQList}

COMMUNICATION EVALUATION CRITERIA (for candidate answers):
Since this is a text-based interview, evaluate "AI Communication Assessment" from the written answer:
- clarity: How clear and easy to understand is the answer?
- structure: Is the answer organized logically? (intro, explanation, conclusion)
- conciseness: Does the answer stay focused without unnecessary padding?
- technicalVocabulary: Does the candidate use correct technical terminology?
- completeness: Does the answer fully address the question?
Note: We do NOT evaluate voice, tone, pronunciation, or spoken confidence — this is text-only.

RESPONSE FORMAT (respond ONLY with valid JSON, no markdown fences, no extra text):
{
  "nextQuestion": "The exact question text to ask",
  "questionType": "technical|behavioral|resume-based|project-based",
  "topic": "The specific topic of this question (e.g. Java, MongoDB, CareerPrepHub project, HR, etc.)",
  "difficulty": "easy|medium|hard",
  "evaluation": {
    "score": 0,
    "correctness": 0,
    "completeness": 0,
    "communication": {
      "clarity": 0,
      "structure": 0,
      "conciseness": 0,
      "technicalVocabulary": 0,
      "completeness": 0
    },
    "strengths": [],
    "weaknesses": []
  },
  "shouldFollowUp": false,
  "isComplete": false
}

NOTE: For the very FIRST question (when there is no candidate answer yet), set all evaluation scores to 0 and empty arrays. For subsequent questions, evaluate the candidate's answer fully in the "evaluation" field before forming the next question.`;
};

/* ─────────────────────────────────────────────────
   Generate the next interview question.
   Called on session start and after each answer.
───────────────────────────────────────────────── */
export const generateNextQuestion = async ({
  interviewType,
  selectedTopics,
  difficulty,
  questionLimit,
  currentQuestionNumber,
  resumeContext,
  previousQuestions,
  conversationHistory,
  candidateAnswer,
}) => {
  const genAI = getGenAI();

  const systemPrompt = buildSystemPrompt({
    interviewType,
    selectedTopics,
    difficulty,
    questionLimit,
    currentQuestionNumber,
    resumeContext,
    previousQuestions,
  });

  const MAX_HISTORY = 12;
  const recentHistory = conversationHistory.slice(-MAX_HISTORY);

  let fullPrompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n`;
  recentHistory.forEach((turn) => {
    const roleName = turn.role === 'system' ? 'System' : (turn.role === 'assistant' ? 'Interviewer' : 'Candidate');
    fullPrompt += `${roleName}: ${turn.content}\n`;
  });

  if (candidateAnswer && candidateAnswer.trim()) {
    fullPrompt += `Candidate: My answer: ${candidateAnswer.trim()}\n`;
  } else {
    fullPrompt += `Candidate: Please begin the interview with your first question.\n`;
  }

  fullPrompt += `\nREMINDER: Respond ONLY with a valid JSON object matching the required structure.`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(fullPrompt);
    const rawContent = result.response.text() || '{}';
    let parsed;

    try {
      parsed = JSON.parse(rawContent);
    } catch {
      logger.error(`AI interview: failed to parse Gemini JSON response: ${rawContent}`);
      throw new ApiError(
        'We had trouble generating the next interview question. Please try again.',
        502,
        'AI_PARSE_ERROR',
      );
    }

    if (!parsed.nextQuestion || typeof parsed.nextQuestion !== 'string') {
      throw new ApiError(
        'We had trouble generating the next interview question. Please try again.',
        502,
        'AI_INVALID_RESPONSE',
      );
    }

    return {
      nextQuestion: parsed.nextQuestion.trim(),
      questionType: parsed.questionType || 'technical',
      topic: parsed.topic || (selectedTopics[0] || 'General'),
      difficulty: parsed.difficulty || 'medium',
      evaluation: parsed.evaluation || null,
      shouldFollowUp: Boolean(parsed.shouldFollowUp),
      isComplete: Boolean(parsed.isComplete),
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;

    logger.error(`AI interview: Gemini API error: ${err.message}`);

    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key')) {
      throw new ApiError(
        'Invalid Gemini API key. Please verify GEMINI_API_KEY in backend/.env',
        401,
        'GEMINI_INVALID_KEY',
      );
    }

    if (err.status === 429 || err.message?.includes('quota') || err.message?.includes('ResourceHasExhausted')) {
      throw new ApiError(
        'Gemini API quota exceeded. Please check your Gemini API key usage.',
        429,
        'GEMINI_QUOTA_EXHAUSTED',
      );
    }

    throw new ApiError(
      `Gemini Error: ${err.message || 'We had trouble generating the next interview question.'}`,
      502,
      'GEMINI_API_ERROR',
    );
  }
};

/* ─────────────────────────────────────────────────
   Generate the final interview report after all
   questions are answered.
───────────────────────────────────────────────── */
export const generateInterviewReport = async ({
  interviewType,
  selectedTopics,
  difficulty,
  messages,
  resumeContext,
}) => {
  const genAI = getGenAI();

  // Summarise evaluations for topic performance
  const evaluationSummary = messages
    .filter((m) => m.role === 'candidate' && m.evaluation)
    .map((m) => ({
      questionNumber: m.questionNumber,
      topic: m.topic || 'General',
      evaluation: m.evaluation,
    }));

  const questionList = messages
    .filter((m) => m.role === 'interviewer')
    .map((m, i) => `Q${i + 1} [${m.topic || 'General'}]: ${m.content}`)
    .join('\n');

  const answerList = messages
    .filter((m) => m.role === 'candidate')
    .map((m, i) => `A${i + 1}: ${m.content}`)
    .join('\n---\n');

  const isHR = interviewType === 'HR';
  const hasResume = Boolean(resumeContext && resumeContext.length > 50);
  const isResumeBased = interviewType === 'Resume Based' || interviewType === 'Resume + Technical';

  const systemPrompt = `You are an expert interviewer generating a comprehensive performance report for a mock interview session.

Interview Details:
- Type: ${interviewType}
- Topics: ${selectedTopics.join(', ') || 'General'}
- Difficulty: ${difficulty}
- Has Resume Context: ${hasResume}

Questions asked and answers given:
${questionList}

---

${answerList}

${hasResume ? `\nCandidate Resume Context:\n${resumeContext}\n` : ''}

Evaluation data collected per answer during interview:
${JSON.stringify(evaluationSummary, null, 2)}

INSTRUCTIONS FOR REPORT GENERATION:
1. Base ALL scores on the actual answers given — do NOT generate arbitrary or fixed scores.
2. Technical scores should reflect accuracy, depth, and correctness of technical answers.
3. Communication scores are an "AI Communication Assessment" based on WRITTEN text quality:
   - clarity: How clear and understandable is the writing?
   - structure: Is the answer organized? (has logical flow)
   - conciseness: Stays focused, not padded
   - technicalVocabulary: Correct use of technical terms
   - completeness: Fully answers the question
4. Project performance: If the interview included resume/project questions, evaluate how well the candidate explained and understood their own projects.
5. Strengths: Concrete, specific strengths based on actual answers.
6. Weaknesses: Specific topic gaps or misconceptions observed in answers.
7. Recommended topics: Only topics where the candidate showed weakness or gaps.
8. Communication improvements: Specific writing/explanation improvements.
9. ${isHR ? 'HR interview: weight communication, behavioral reasoning, and self-awareness more heavily.' : ''}
10. ${isResumeBased ? 'Resume-based interview: include a projectPerformance section.' : ''}

Respond ONLY with valid JSON (no markdown fences, no extra text):
{
  "overallScore": 75,
  "technicalScore": 80,
  "communicationScore": 70,
  "dimensions": {
    "technicalAccuracy": 80,
    "completeness": 70,
    "problemSolving": 72,
    "projectUnderstanding": 85,
    "behavioralReasoning": 0
  },
  "communicationDimensions": {
    "clarity": 75,
    "structure": 70,
    "conciseness": 68,
    "technicalVocabulary": 80,
    "completeness": 72
  },
  "topicPerformance": [
    { "topic": "Java", "score": 85, "questionCount": 3 }
  ],
  "projectPerformance": [
    { "project": "CareerPrepHub", "score": 90, "notes": "Good understanding of architecture" }
  ],
  "strengths": ["Specific strength based on actual answers"],
  "weaknesses": ["Specific weakness or gap observed"],
  "communicationImprovements": ["Specific text communication improvement"],
  "recommendedTopics": ["Topic to practice"],
  "summary": "2-3 sentence overall assessment based on actual performance"
}`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(systemPrompt);
    const rawContent = result.response.text() || '{}';
    const parsed = JSON.parse(rawContent);

    return {
      overallScore: Number(parsed.overallScore) || 0,
      technicalScore: Number(parsed.technicalScore) || 0,
      communicationScore: Number(parsed.communicationScore) || 0,
      dimensions: parsed.dimensions || {},
      communicationDimensions: parsed.communicationDimensions || {},
      topicPerformance: parsed.topicPerformance || [],
      projectPerformance: parsed.projectPerformance || [],
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      communicationImprovements: parsed.communicationImprovements || [],
      recommendedTopics: parsed.recommendedTopics || [],
      summary: parsed.summary || '',
    };
  } catch (err) {
    logger.error(`AI interview: report generation error: ${err.message}`);
    return {
      overallScore: 0,
      technicalScore: 0,
      communicationScore: 0,
      dimensions: {},
      communicationDimensions: {},
      topicPerformance: [],
      projectPerformance: [],
      strengths: [],
      weaknesses: [],
      communicationImprovements: [],
      recommendedTopics: selectedTopics,
      summary: 'Report generation encountered an error. Please review your conversation above.',
    };
  }
};
