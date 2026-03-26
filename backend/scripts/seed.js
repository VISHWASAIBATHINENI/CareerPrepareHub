import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from '../src/config/db.js';
import { env } from '../src/config/env.js';
import logger from '../src/logger/index.js';
import AptitudeQuestion from '../src/models/aptitudeQuestion.model.js';
import CodingQuestion from '../src/models/codingQuestion.model.js';
import Content from '../src/models/content.model.js';
import { coreSubjectsVideos, domainVideos, programmingLanguagesVideos } from '../src/config/staticContent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');

const normalizeDifficulty = (value = 'easy') => {
  const normalized = String(value).trim().toLowerCase();
  return ['easy', 'medium', 'hard'].includes(normalized) ? normalized : 'easy';
};

const toTitleCase = (value = '') =>
  String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

async function loadJson(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function seedAptitude() {
  const data = await loadJson('aptitude-questions.json');
  const documents = [];

  for (const [topicKey, questions] of Object.entries(data || {})) {
    for (const item of questions || []) {
      documents.push({
        question: item.question || '',
        options: Array.isArray(item.options) ? item.options : [],
        answer: item.answer || '',
        explanation: item.explanation || '',
        difficulty: normalizeDifficulty(item.difficulty),
        topic: item.topic || toTitleCase(topicKey),
        isPremium: normalizeDifficulty(item.difficulty) === 'hard',
      });
    }
  }

  await AptitudeQuestion.deleteMany({});
  if (documents.length) await AptitudeQuestion.insertMany(documents);
  return documents.length;
}

async function seedCoding() {
  const data = await loadJson('questions.json');
  const documents = (Array.isArray(data) ? data : []).map((item) => ({
    sourceId: Number.isFinite(item.id) ? item.id : undefined,
    company: item.company || 'General',
    topic: item.topic || 'General',
    category: item.category || item.topic || 'General',
    title: item.title || item.question || 'Untitled Coding Question',
    description: item.description || item.question || item.title || 'No description provided.',
    constraints: item.constraints || '',
    sampleInput: item.sampleInput || '',
    sampleOutput: item.sampleOutput || '',
    explanation: item.explanation || '',
    hints: Array.isArray(item.hints) ? item.hints : [],
    difficulty: normalizeDifficulty(item.difficulty),
    testCases: [
      {
        input: item.sampleInput || 'sample input',
        output: item.sampleOutput || 'sample output',
      },
    ],
    isPremium: normalizeDifficulty(item.difficulty) === 'hard',
  }));

  await CodingQuestion.deleteMany({});
  if (documents.length) await CodingQuestion.insertMany(documents);
  return documents.length;
}

async function seedContent() {
  const topicsLinks = await loadJson('aptitude-topics-links.json');
  const projectExplorer = await loadJson('generate_doc.json');

  const payloads = [
    { key: 'aptitude-topics-links', data: topicsLinks || {} },
    { key: 'project-explorer', data: Array.isArray(projectExplorer) ? projectExplorer : [] },
    { key: 'programming-languages-videos', data: programmingLanguagesVideos },
    { key: 'domain-videos', data: domainVideos },
    { key: 'core-subject-videos', data: coreSubjectsVideos },
  ];

  await Promise.all(
    payloads.map((item) => Content.findOneAndUpdate(
      { key: item.key },
      item,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )),
  );

  return payloads.length;
}

async function run() {
  try {
    logger.info(`Starting seed in ${env.nodeEnv} mode`);
    await connectDB();

    const aptitudeCount = await seedAptitude();
    const codingCount = await seedCoding();
    const contentCount = await seedContent();

    logger.info(`Seed completed: ${aptitudeCount} aptitude + ${codingCount} coding + ${contentCount} content datasets inserted.`);
    process.exit(0);
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
}

run();
