import mongoose from 'mongoose';

import { ApiError } from '../middleware/error.middleware.js';
import { Roadmap, RoadmapStage, RoadmapTopic, UserRoadmapProgress } from '../models/roadmap.model.js';

/* ─────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────── */

const toObjectId = (id, label = 'ID') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(`Invalid ${label}: ${id}`, 400, 'INVALID_ID');
  }
  return new mongoose.Types.ObjectId(id);
};

/* ─────────────────────────────────────────────────
   Public — list all published roadmaps
───────────────────────────────────────────────── */
export const listRoadmaps = async () => {
  const roadmaps = await Roadmap.find({ isPublished: true }).sort({ createdAt: 1 }).lean();

  // Attach totalStages + totalTopics counts
  const roadmapIds = roadmaps.map((r) => r._id);

  const [stageCounts, topicCounts] = await Promise.all([
    RoadmapStage.aggregate([
      { $match: { roadmapId: { $in: roadmapIds } } },
      { $group: { _id: '$roadmapId', count: { $sum: 1 } } },
    ]),
    RoadmapTopic.aggregate([
      { $match: { roadmapId: { $in: roadmapIds } } },
      { $group: { _id: '$roadmapId', count: { $sum: 1 } } },
    ]),
  ]);

  const stageMap = Object.fromEntries(stageCounts.map((s) => [String(s._id), s.count]));
  const topicMap = Object.fromEntries(topicCounts.map((t) => [String(t._id), t.count]));

  return roadmaps.map((r) => ({
    ...r,
    totalStages: stageMap[String(r._id)] || 0,
    totalTopics: topicMap[String(r._id)] || 0,
  }));
};

/* ─────────────────────────────────────────────────
   Public — get single roadmap by slug
───────────────────────────────────────────────── */
export const getRoadmapBySlug = async (slug) => {
  const roadmap = await Roadmap.findOne({ slug, isPublished: true }).lean();
  if (!roadmap) throw new ApiError('Roadmap not found', 404, 'ROADMAP_NOT_FOUND');

  const [stages, topicCounts] = await Promise.all([
    RoadmapStage.find({ roadmapId: roadmap._id }).sort({ order: 1 }).lean(),
    RoadmapTopic.aggregate([
      { $match: { roadmapId: roadmap._id } },
      { $group: { _id: '$stageId', count: { $sum: 1 } } },
    ]),
  ]);

  const topicCountMap = Object.fromEntries(topicCounts.map((t) => [String(t._id), t.count]));

  return {
    ...roadmap,
    stages: stages.map((s) => ({
      ...s,
      topicCount: topicCountMap[String(s._id)] || 0,
    })),
    totalStages: stages.length,
  };
};

/* ─────────────────────────────────────────────────
   Public — get all topics for a roadmap (with stage info)
───────────────────────────────────────────────── */
export const getRoadmapTopics = async (roadmapId) => {
  const oid = toObjectId(roadmapId, 'roadmapId');

  const roadmap = await Roadmap.findById(oid).lean();
  if (!roadmap) throw new ApiError('Roadmap not found', 404, 'ROADMAP_NOT_FOUND');

  const [stages, topics] = await Promise.all([
    RoadmapStage.find({ roadmapId: oid }).sort({ order: 1 }).lean(),
    RoadmapTopic.find({ roadmapId: oid }).sort({ order: 1 }).lean(),
  ]);

  // Group topics by stageId
  const topicsByStage = {};
  for (const topic of topics) {
    const sid = String(topic.stageId);
    if (!topicsByStage[sid]) topicsByStage[sid] = [];
    topicsByStage[sid].push(topic);
  }

  return stages.map((stage) => ({
    ...stage,
    topics: topicsByStage[String(stage._id)] || [],
  }));
};

/* ─────────────────────────────────────────────────
   Public — get a single topic by ID
───────────────────────────────────────────────── */
export const getTopicById = async (roadmapId, topicId) => {
  const roadmapOid = toObjectId(roadmapId, 'roadmapId');
  const topicOid = toObjectId(topicId, 'topicId');

  const [roadmap, topic] = await Promise.all([
    Roadmap.findById(roadmapOid).lean(),
    RoadmapTopic.findOne({ _id: topicOid, roadmapId: roadmapOid }).lean(),
  ]);

  if (!roadmap) throw new ApiError('Roadmap not found', 404, 'ROADMAP_NOT_FOUND');
  if (!topic) throw new ApiError('Topic not found', 404, 'TOPIC_NOT_FOUND');

  return topic;
};

/* ─────────────────────────────────────────────────
   User progress — get or create a progress document
───────────────────────────────────────────────── */
export const getUserProgress = async (userId, roadmapId) => {
  const roadmapOid = toObjectId(roadmapId, 'roadmapId');
  const userOid = toObjectId(userId, 'userId');

  const roadmap = await Roadmap.findById(roadmapOid).lean();
  if (!roadmap) throw new ApiError('Roadmap not found', 404, 'ROADMAP_NOT_FOUND');

  const totalTopics = await RoadmapTopic.countDocuments({ roadmapId: roadmapOid });

  const progress = await UserRoadmapProgress.findOne({ userId: userOid, roadmapId: roadmapOid }).lean();

  if (!progress) {
    return {
      roadmapId,
      completedTopics: [],
      currentTopicId: null,
      completedCount: 0,
      totalTopics,
      percentage: 0,
      startedAt: null,
      lastAccessedAt: null,
      completedAt: null,
    };
  }

  const completedCount = progress.completedTopics.length;
  const percentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  return {
    roadmapId,
    completedTopics: progress.completedTopics.map(String),
    currentTopicId: progress.currentTopicId ? String(progress.currentTopicId) : null,
    completedCount,
    totalTopics,
    percentage,
    startedAt: progress.startedAt,
    lastAccessedAt: progress.lastAccessedAt,
    completedAt: progress.completedAt,
  };
};

/* ─────────────────────────────────────────────────
   User progress — start/enrol in a roadmap
───────────────────────────────────────────────── */
export const startRoadmap = async (userId, roadmapId) => {
  const roadmapOid = toObjectId(roadmapId, 'roadmapId');
  const userOid = toObjectId(userId, 'userId');

  const roadmap = await Roadmap.findById(roadmapOid).lean();
  if (!roadmap) throw new ApiError('Roadmap not found', 404, 'ROADMAP_NOT_FOUND');

  // Find the first topic in this roadmap (lowest order in the first stage)
  const firstTopic = await RoadmapTopic.findOne({ roadmapId: roadmapOid }).sort({ order: 1 }).lean();

  const now = new Date();
  const progress = await UserRoadmapProgress.findOneAndUpdate(
    { userId: userOid, roadmapId: roadmapOid },
    {
      $setOnInsert: {
        completedTopics: [],
        currentTopicId: firstTopic?._id ?? null,
        startedAt: now,
        completedAt: null,
      },
      $set: { lastAccessedAt: now },
    },
    { upsert: true, new: true }
  ).lean();

  return { message: 'Roadmap started', progressId: progress._id };
};

/* ─────────────────────────────────────────────────
   User progress — mark a topic complete
───────────────────────────────────────────────── */
export const markTopicComplete = async (userId, roadmapId, topicId) => {
  const roadmapOid = toObjectId(roadmapId, 'roadmapId');
  const topicOid = toObjectId(topicId, 'topicId');
  const userOid = toObjectId(userId, 'userId');

  // Verify topic belongs to this roadmap
  const topic = await RoadmapTopic.findOne({ _id: topicOid, roadmapId: roadmapOid }).lean();
  if (!topic) throw new ApiError('Topic not found in this roadmap', 404, 'TOPIC_NOT_FOUND');

  const now = new Date();

  // Find the NEXT uncompleted topic (by stage order then topic order)
  const allTopics = await RoadmapTopic.find({ roadmapId: roadmapOid }).sort({ order: 1 }).lean();
  const stages = await RoadmapStage.find({ roadmapId: roadmapOid }).sort({ order: 1 }).lean();
  const stageOrderMap = Object.fromEntries(stages.map((s) => [String(s._id), s.order]));

  // Sort all topics by stage.order then topic.order
  const sortedTopics = allTopics.sort((a, b) => {
    const stageA = stageOrderMap[String(a.stageId)] ?? 0;
    const stageB = stageOrderMap[String(b.stageId)] ?? 0;
    if (stageA !== stageB) return stageA - stageB;
    return (a.order ?? 0) - (b.order ?? 0);
  });

  // Get or create the progress document first (to know completedTopics)
  let progress = await UserRoadmapProgress.findOne({ userId: userOid, roadmapId: roadmapOid });
  if (!progress) {
    progress = await UserRoadmapProgress.create({
      userId: userOid,
      roadmapId: roadmapOid,
      completedTopics: [],
      currentTopicId: sortedTopics[0]?._id ?? null,
      startedAt: now,
      lastAccessedAt: now,
    });
  }

  // Add topic to completed if not already there
  const alreadyCompleted = progress.completedTopics.some((t) => String(t) === String(topicOid));
  if (!alreadyCompleted) {
    progress.completedTopics.push(topicOid);
  }

  // Determine the next topic (first sorted topic that is not in completedTopics)
  const completedSet = new Set(progress.completedTopics.map(String));
  const nextTopic = sortedTopics.find((t) => !completedSet.has(String(t._id)));

  progress.currentTopicId = nextTopic?._id ?? null;
  progress.lastAccessedAt = now;

  // If all topics completed, mark roadmap as completed
  if (!nextTopic) {
    progress.completedAt = now;
  }

  await progress.save();

  const totalTopics = allTopics.length;
  const completedCount = progress.completedTopics.length;
  const percentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  return {
    topicId,
    completed: true,
    completedCount,
    totalTopics,
    percentage,
    nextTopicId: nextTopic ? String(nextTopic._id) : null,
    roadmapCompleted: !nextTopic,
  };
};

/* ─────────────────────────────────────────────────
   User progress — mark a topic incomplete (undo)
───────────────────────────────────────────────── */
export const markTopicIncomplete = async (userId, roadmapId, topicId) => {
  const roadmapOid = toObjectId(roadmapId, 'roadmapId');
  const topicOid = toObjectId(topicId, 'topicId');
  const userOid = toObjectId(userId, 'userId');

  const topic = await RoadmapTopic.findOne({ _id: topicOid, roadmapId: roadmapOid }).lean();
  if (!topic) throw new ApiError('Topic not found in this roadmap', 404, 'TOPIC_NOT_FOUND');

  const totalTopics = await RoadmapTopic.countDocuments({ roadmapId: roadmapOid });

  const progress = await UserRoadmapProgress.findOneAndUpdate(
    { userId: userOid, roadmapId: roadmapOid },
    {
      $pull: { completedTopics: topicOid },
      $set: { completedAt: null, lastAccessedAt: new Date() },
    },
    { new: true }
  ).lean();

  if (!progress) {
    return { topicId, completed: false, completedCount: 0, totalTopics, percentage: 0 };
  }

  const completedCount = progress.completedTopics.length;
  const percentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  return { topicId, completed: false, completedCount, totalTopics, percentage };
};

/* ─────────────────────────────────────────────────
   User progress — get all user roadmap summaries
───────────────────────────────────────────────── */
export const getUserAllProgress = async (userId) => {
  const userOid = toObjectId(userId, 'userId');
  const progressList = await UserRoadmapProgress.find({ userId: userOid }).lean();

  if (!progressList.length) return [];

  const roadmapIds = progressList.map((p) => p.roadmapId);
  const [roadmaps, topicCounts] = await Promise.all([
    Roadmap.find({ _id: { $in: roadmapIds } }).lean(),
    RoadmapTopic.aggregate([
      { $match: { roadmapId: { $in: roadmapIds } } },
      { $group: { _id: '$roadmapId', count: { $sum: 1 } } },
    ]),
  ]);

  const roadmapMap = Object.fromEntries(roadmaps.map((r) => [String(r._id), r]));
  const topicCountMap = Object.fromEntries(topicCounts.map((t) => [String(t._id), t.count]));

  return progressList.map((p) => {
    const roadmap = roadmapMap[String(p.roadmapId)] || {};
    const totalTopics = topicCountMap[String(p.roadmapId)] || 0;
    const completedCount = p.completedTopics.length;
    const percentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    return {
      roadmapId: String(p.roadmapId),
      roadmapTitle: roadmap.title || '',
      roadmapSlug: roadmap.slug || '',
      completedCount,
      totalTopics,
      percentage,
      currentTopicId: p.currentTopicId ? String(p.currentTopicId) : null,
      startedAt: p.startedAt,
      lastAccessedAt: p.lastAccessedAt,
      completedAt: p.completedAt,
    };
  });
};
