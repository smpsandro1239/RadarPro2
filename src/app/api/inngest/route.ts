import { NextRequest, NextResponse } from "next/server";
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import {
  scrapeSource,
  scrapeAll,
  expireStale,
  geocodeMissing,
  sendAlerts,
} from "@/lib/inngest/functions";
import { dailyIngest } from "@/inngest/functions/daily-ingest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [scrapeSource, scrapeAll, expireStale, geocodeMissing, sendAlerts, dailyIngest],
});
