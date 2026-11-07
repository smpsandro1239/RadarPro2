import { NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { inngest } from "@/lib/inngest";

export async function POST(request: Request) {
  if (!isAuthorizedCronRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await inngest.send({ name: "scrape.all" });

    return NextResponse.json({
      success: true,
      message: "Pipeline de scraping completo enviado para fila (Inngest)",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
 if (!isAuthorizedCronRequest(request)) return NextResponse.json({error:"Unauthorized"},{status:401});
 try { await inngest.send({name:"scrape.all"}); return NextResponse.json({success:true}); }
 catch { return NextResponse.json({error:"Internal server error"},{status:500}); }
}
