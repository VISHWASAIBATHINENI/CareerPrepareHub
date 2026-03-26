import Content from '../models/content.model.js';
import { ApiError } from '../middleware/error.middleware.js';

export const getContentByKey = async (key) => {
  const normalizedKey = String(key || '').trim();
  if (!normalizedKey) throw new ApiError('Content key is required', 400);

  const content = await Content.findOne({ key: normalizedKey });
  if (!content) throw new ApiError(`Content not found for key: ${normalizedKey}`, 404);

  return content.data;
};

export const upsertContentByKey = async ({ key, data }) => Content.findOneAndUpdate(
  { key },
  { key, data },
  { upsert: true, new: true, setDefaultsOnInsert: true },
);
