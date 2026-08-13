import User from '../models/user.model.js';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const normalizeUsername = (username) => String(username || '').trim().toLowerCase();

export const findUserByEmail = (email) => User.findOne({ email: normalizeEmail(email) });
export const findUserByEmailWithPassword = (email) => User.findOne({ email: normalizeEmail(email) }).select('+password');
export const findUserByUsernameWithPassword = (username) => User.findOne({ username: normalizeUsername(username) }).select('+password');

export const findUserById = (id) => User.findById(id);

export const createUser = (payload) => User.create(payload);

export const updatePasswordByEmail = async (email, newPassword) => {
  const user = await User.findOne({ email: normalizeEmail(email) }).select('+password');
  if (!user) return null;

  user.password = newPassword;
  await user.save();
  return user;
};

export const updateUserResume = async (userId, resumeData) => {
  return User.findByIdAndUpdate(
    userId,
    { resumeData: String(resumeData || '').trim().slice(0, 8000) },
    { new: true },
  );
};

export const getUserResume = async (userId) => {
  const user = await User.findById(userId).select('resumeData');
  return user ? (user.resumeData || '') : '';
};
