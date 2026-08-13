import asyncHandler from '../middleware/asyncHandler.middleware.js';
import { findUserById, getUserResume, updateUserResume } from '../services/user.service.js';
import { ApiError } from '../middleware/error.middleware.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) throw new ApiError('User not found', 404, 'USER_NOT_FOUND');

  return sendSuccess(res, {
    message: 'User profile fetched successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});

export const getResume = asyncHandler(async (req, res) => {
  const resumeData = await getUserResume(req.user.id);
  return sendSuccess(res, {
    message: 'Resume fetched successfully',
    data: { resumeData },
  });
});

export const updateResume = asyncHandler(async (req, res) => {
  const { resumeData } = req.body;
  if (typeof resumeData !== 'string') {
    throw new ApiError('resumeData must be a string', 400, 'INVALID_RESUME_DATA');
  }
  await updateUserResume(req.user.id, resumeData);
  return sendSuccess(res, {
    message: 'Resume updated successfully',
    data: { resumeData: resumeData.trim().slice(0, 8000) },
  });
});