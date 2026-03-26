import asyncHandler from '../middleware/asyncHandler.middleware.js';
import * as questionService from '../services/question.service.js';
import { sendPaginated, sendSuccess } from '../utils/apiResponse.js';

export const getAptitudeQuestions = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await questionService.getAptitudeList(req.query);
  return sendPaginated(res, {
    message: 'Aptitude questions fetched successfully',
    data: items,
    total,
    page,
    limit,
  });
});

export const getAptitudeQuestionById = asyncHandler(async (req, res) => {
  const data = await questionService.getAptitudeById({ id: req.params.id, user: req.user });
  return sendSuccess(res, {
    message: 'Aptitude question fetched successfully',
    data,
  });
});

export const getHardAptitudeQuestions = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await questionService.getHardAptitudeForPaidUsers(req.query);
  return sendPaginated(res, {
    message: 'Hard aptitude questions fetched successfully',
    data: items,
    total,
    page,
    limit,
  });
});

export const getCodingQuestions = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await questionService.getCodingList({
    ...req.query,
    user: req.user,
  });
  return sendPaginated(res, {
    message: 'Coding questions fetched successfully',
    data: items,
    total,
    page,
    limit,
  });
});

export const getCodingQuestionById = asyncHandler(async (req, res) => {
  const data = await questionService.getCodingById({ id: req.params.id, user: req.user });
  return sendSuccess(res, {
    message: 'Coding question fetched successfully',
    data,
  });
});
