export const sendSuccess = (res, {
  statusCode = 200,
  message = 'Success',
  data = null,
  meta,
} = {}) => {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const sendPaginated = (res, {
  message = 'Success',
  data = [],
  page = 1,
  limit = 10,
  total = 0,
} = {}) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return sendSuccess(res, {
    message,
    data,
    meta: {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
};
