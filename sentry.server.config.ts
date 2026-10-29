import * as Sentry from "@sentry/nextjs";

const sentryDsn =
  process.env.SENTRY_DSN ||
  "https://example@sentry.io/example";

Sentry.init({
  dsn: sentryDsn,
  tracesSampleRate: 1.0,
  debug: false,
  environment: process.env.NODE_ENV || "production",
});

export default Sentry;
