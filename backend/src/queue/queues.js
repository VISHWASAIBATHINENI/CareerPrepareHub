import { env } from '../config/env.js';
import logger from '../logger/index.js';

let cachedQueueBundle = null;

const createInMemoryQueueFallback = () => ({
  submissionQueue: {
    add: async (_name, data) => ({
      id: `local-${Date.now()}`,
      data,
    }),
  },
  submissionQueueEvents: null,
  connection: null,
  isFallback: true,
});

const loadQueueBundle = async () => {
  if (cachedQueueBundle) return cachedQueueBundle;

  if (process.env.VERCEL) {
    cachedQueueBundle = createInMemoryQueueFallback();
    return cachedQueueBundle;
  }

  try {
    const [{ default: IORedis }, { Queue, QueueEvents }] = await Promise.all([
      import('ioredis'),
      import('bullmq'),
    ]);

    const connection = new IORedis(env.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times) => (times > 1 ? null : 200),
    });

    connection.on('error', (error) => {
      logger.warn({ message: 'Redis connection unavailable. Using queue fallback.', error: error.message });
      cachedQueueBundle = createInMemoryQueueFallback();
    });

    cachedQueueBundle = {
      submissionQueue: new Queue(env.judgeQueueName, {
        connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      }),
      submissionQueueEvents: new QueueEvents(env.judgeQueueName, { connection }),
      connection,
      isFallback: false,
    };
  } catch (error) {
    logger.warn({
      message: 'BullMQ/ioredis not installed. Falling back to in-memory queue stub. Run npm install to enable background workers.',
      error: error.message,
    });
    cachedQueueBundle = createInMemoryQueueFallback();
  }

  return cachedQueueBundle;
};

export const getQueueBundle = async () => loadQueueBundle();

export const enqueueSubmission = async (submissionId) => {
  const { submissionQueue, isFallback } = await loadQueueBundle();
  const job = await submissionQueue.add('judge-submission', { submissionId: String(submissionId) });
  logger.info({
    message: isFallback ? 'Submission queued in fallback mode' : 'Submission enqueued',
    submissionId: String(submissionId),
    jobId: String(job.id),
  });
  return job;
};

export const getQueueConnection = async () => {
  const { connection } = await loadQueueBundle();
  return connection;
};