import * as Sentry from "@sentry/nextjs";

const sentryDsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ||
  "https://example@sentry.io/example";

Sentry.init({
  dsn: sentryDsn,
  tracesSampleRate: 1.0,
  debug: false,
  environment: process.env.NODE_ENV || "production",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
});

export default Sentry;
