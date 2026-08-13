import express from 'express';

import {
  getRoadmaps,
  getRoadmapBySlug,
  getRoadmapTopics,
  getTopicById,
  getUserProgress,
  startRoadmap,
  markTopicComplete,
  markTopicIncomplete,
  getUserAllProgress,
} from '../controllers/roadmap.controller.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

/* ──────────────────────────────────────────────────
   Public / optional-auth routes
────────────────────────────────────────────────── */

// GET /api/roadmaps            — list all published roadmaps
router.get('/', optionalAuth, getRoadmaps);

// GET /api/roadmaps/my-progress — get all progress for logged-in user  (must be before :slug)
router.get('/my-progress', protect, getUserAllProgress);

// GET /api/roadmaps/:slug       — get a single roadmap (with stages) by slug
router.get('/:slug', optionalAuth, getRoadmapBySlug);

// GET /api/roadmaps/:roadmapId/topics — get all topics grouped by stage
router.get('/:roadmapId/topics', optionalAuth, getRoadmapTopics);

// GET /api/roadmaps/:roadmapId/topics/:topicId — get a single topic
router.get('/:roadmapId/topics/:topicId', optionalAuth, getTopicById);

/* ──────────────────────────────────────────────────
   Protected — user progress routes
────────────────────────────────────────────────── */

// GET  /api/roadmaps/:roadmapId/progress           — get user's progress for one roadmap
router.get('/:roadmapId/progress', protect, getUserProgress);

// POST /api/roadmaps/:roadmapId/progress           — start/enrol in a roadmap
router.post('/:roadmapId/progress', protect, startRoadmap);

// PUT  /api/roadmaps/:roadmapId/topics/:topicId/complete   — mark topic complete
router.put('/:roadmapId/topics/:topicId/complete', protect, markTopicComplete);

// PUT  /api/roadmaps/:roadmapId/topics/:topicId/uncomplete — mark topic incomplete
router.put('/:roadmapId/topics/:topicId/uncomplete', protect, markTopicIncomplete);

export default router;
