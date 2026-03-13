import { filterSensitiveInformation } from '@igo2/fastify';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import dotenv from 'dotenv';

import { getPackageVersion } from './utils/version';

dotenv.config({
  quiet: true
});

const isLocal = process.env.ENVIRONMENT === 'local';
const isProd = process.env.ENVIRONMENT === 'production';
const hasSentry = process.env.SENTRY_DSN && !isLocal;

if (hasSentry) {
  // Ensure to call this before importing any other modules!
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: getPackageVersion(process.env.ENVIRONMENT),
    environment: process.env.ENVIRONMENT,
    integrations: [
      // Add our Profiling integration
      nodeProfilingIntegration()
    ],

    // Add Tracing by setting tracesSampleRate
    // We recommend adjusting this value in production
    tracesSampleRate: isProd ? 0.2 : 1.0,

    // Set sampling rate for profiling
    // This is relative to tracesSampleRate
    profilesSampleRate: 1.0,
    beforeSend: filterSensitiveInformation()
  });
}
