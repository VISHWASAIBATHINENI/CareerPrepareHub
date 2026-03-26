import AptitudeQuestion from '../models/aptitudeQuestion.model.js';
import CodingQuestion from '../models/codingQuestion.model.js';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../config/constants.js';
import { ApiError } from '../middleware/error.middleware.js';
import { escapeRegex } from '../utils/regex.js';

const normalize = (value = '') => String(value).trim().toLowerCase();
const toInt = (v, fallback) => {
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
};

const hasPremiumAccess = (user) => Boolean(user && (user.isPaid || user.role === 'admin'));

const getPagination = ({ page, limit }) => {
  const parsedPage = Math.max(toInt(page, DEFAULT_PAGE), 1);
  const parsedLimit = Math.min(Math.max(toInt(limit, DEFAULT_LIMIT), 1), MAX_LIMIT);
  return { page: parsedPage, limit: parsedLimit, skip: (parsedPage - 1) * parsedLimit };
};

export const getAptitudeList = async (query = {}) => {
  const { topic, difficulty } = query;
  const { page, limit, skip } = getPagination(query);

  const filters = { isPremium: false };
  if (topic) {
    const safeTopic = escapeRegex(String(topic).trim());
    filters.topic = { $regex: new RegExp(`^${safeTopic}$`, 'i') };
  }
  if (difficulty) filters.difficulty = normalize(difficulty);

  const [items, total] = await Promise.all([
    AptitudeQuestion.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AptitudeQuestion.countDocuments(filters),
  ]);

  return { items, total, page, limit };
};

export const getAptitudeById = async ({ id, user }) => {
  const question = await AptitudeQuestion.findById(id).lean();
  if (!question) throw new ApiError('Aptitude question not found', 404, 'APTITUDE_NOT_FOUND');

  if (question.isPremium && !hasPremiumAccess(user)) {
    throw new ApiError('Paid plan required to access this resource', 403, 'PAID_PLAN_REQUIRED');
  }

  return question;
};

export const getHardAptitudeForPaidUsers = async (query = {}) => {
  const { page, limit, skip } = getPagination(query);
  const filters = { difficulty: 'hard', isPremium: true };

  const [items, total] = await Promise.all([
    AptitudeQuestion.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AptitudeQuestion.countDocuments(filters),
  ]);

  return { items, total, page, limit };
};

export const getCodingList = async (query = {}) => {
  const { difficulty, company, topic, search, user } = query;
  const { page, limit, skip } = getPagination(query);

  const filters = {};
  if (difficulty) filters.difficulty = normalize(difficulty);
  if (company) {
    const safeCompany = escapeRegex(String(company).trim());
    filters.company = { $regex: new RegExp(`^${safeCompany}$`, 'i') };
  }
  if (topic) {
    const safeTopic = escapeRegex(String(topic).trim());
    filters.topic = { $regex: new RegExp(`^${safeTopic}$`, 'i') };
  }

  if (search) {
    const keyword = escapeRegex(String(search).trim());
    filters.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { topic: { $regex: keyword, $options: 'i' } },
      { company: { $regex: keyword, $options: 'i' } },
      { category: { $regex: keyword, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    CodingQuestion.find(filters)
      .select('-testCases')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CodingQuestion.countDocuments(filters),
  ]);

  const canAccessPremium = hasPremiumAccess(user);
  const safeItems = items.map((item) => {
    if (!item.isPremium || canAccessPremium) return item;

    return {
      _id: item._id,
      title: item.title,
      difficulty: item.difficulty,
      company: item.company,
      topic: item.topic,
      category: item.category,
      isPremium: true,
      isLocked: true,
    };
  });

  return { items: safeItems, total, page, limit };
};

export const getCodingById = async ({ id, user }) => {
  const question = await CodingQuestion.findById(id).lean();
  if (!question) throw new ApiError('Coding question not found', 404, 'CODING_NOT_FOUND');

  if (question.isPremium && !hasPremiumAccess(user)) {
    throw new ApiError('Paid plan required to access this resource', 403, 'PAID_PLAN_REQUIRED');
  }

  return question;
};
