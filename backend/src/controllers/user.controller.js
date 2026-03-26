import asyncHandler from '../middleware/asyncHandler.middleware.js';
import { findUserById } from '../services/user.service.js';
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
      isPaid: user.isPaid,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});