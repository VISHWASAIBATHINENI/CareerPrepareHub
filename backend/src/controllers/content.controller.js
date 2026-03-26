import asyncHandler from '../middleware/asyncHandler.middleware.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getContentByKey } from '../services/content.service.js';

export const getContent = asyncHandler(async (req, res) => {
  const data = await getContentByKey(req.params.key);
  return sendSuccess(res, {
    message: 'Content fetched successfully',
    data,
  });
});
