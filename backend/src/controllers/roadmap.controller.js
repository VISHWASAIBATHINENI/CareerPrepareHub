import asyncHandler from '../middleware/asyncHandler.middleware.js';
import * as roadmapService from '../services/roadmap.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

/* ─────────────────────────────────────────────────
   Public endpoints
───────────────────────────────────────────────── */

export const getRoadmaps = asyncHandler(async (_req, res) => {
  const data = await roadmapService.listRoadmaps();
  return sendSuccess(res, { message: 'Roadmaps fetched successfully', data });
});

export const getRoadmapBySlug = asyncHandler(async (req, res) => {
  const data = await roadmapService.getRoadmapBySlug(req.params.slug);
  return sendSuccess(res, { message: 'Roadmap fetched successfully', data });
});

export const getRoadmapTopics = asyncHandler(async (req, res) => {
  const data = await roadmapService.getRoadmapTopics(req.params.roadmapId);
  return sendSuccess(res, { message: 'Roadmap topics fetched successfully', data });
});

export const getTopicById = asyncHandler(async (req, res) => {
  const { roadmapId, topicId } = req.params;
  const data = await roadmapService.getTopicById(roadmapId, topicId);
  return sendSuccess(res, { message: 'Topic fetched successfully', data });
});

/* ─────────────────────────────────────────────────
   Authenticated — user progress endpoints
───────────────────────────────────────────────── */

export const getUserProgress = asyncHandler(async (req, res) => {
  const data = await roadmapService.getUserProgress(req.user.id, req.params.roadmapId);
  return sendSuccess(res, { message: 'Progress fetched successfully', data });
});

export const startRoadmap = asyncHandler(async (req, res) => {
  const data = await roadmapService.startRoadmap(req.user.id, req.params.roadmapId);
  return sendSuccess(res, { statusCode: 201, message: 'Roadmap started', data });
});

export const markTopicComplete = asyncHandler(async (req, res) => {
  const { roadmapId, topicId } = req.params;
  const data = await roadmapService.markTopicComplete(req.user.id, roadmapId, topicId);
  return sendSuccess(res, { message: 'Topic marked as complete', data });
});

export const markTopicIncomplete = asyncHandler(async (req, res) => {
  const { roadmapId, topicId } = req.params;
  const data = await roadmapService.markTopicIncomplete(req.user.id, roadmapId, topicId);
  return sendSuccess(res, { message: 'Topic marked as incomplete', data });
});

export const getUserAllProgress = asyncHandler(async (req, res) => {
  const data = await roadmapService.getUserAllProgress(req.user.id);
  return sendSuccess(res, { message: 'All progress fetched successfully', data });
});
