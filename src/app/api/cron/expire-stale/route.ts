import { NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { inngest } from "@/lib/inngest";

export async function POST(request: Request) {
  if (!isAuthorizedCronRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
    const maxAgeDays = body.maxAgeDays ?? 7;
    if (!Number.isInteger(maxAgeDays) || maxAgeDays < 1 || maxAgeDays > 365) return NextResponse.json({error:"maxAgeDays inválido"},{status:400});

    await inngest.send({
      name: "expire.stale",
      data: { maxAgeDays },
    });

    return NextResponse.json({
      success: true,
      message: "Expiração de imóveis enviados para fila (Inngest)",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
 if (!isAuthorizedCronRequest(request)) return NextResponse.json({error:"Unauthorized"},{status:401});
 const raw=new URL(request.url).searchParams.get("maxAgeDays"), maxAgeDays=raw?Number(raw):7;
 if(!Number.isInteger(maxAgeDays)||maxAgeDays<1||maxAgeDays>365)return NextResponse.json({error:"maxAgeDays inválido"},{status:400});
 try { await inngest.send({name:"expire.stale",data:{maxAgeDays}}); return NextResponse.json({success:true}); }
 catch { return NextResponse.json({error:"Internal server error"},{status:500}); }
}
