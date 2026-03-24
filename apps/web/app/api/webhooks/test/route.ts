import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { getSmokeUserIdFromRequest } from "@lib/smokeAuth";
import { dispatchWebhookEvent } from "@/lib/webhooks/dispatch";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const smokeUserId = getSmokeUserIdFromRequest(req);
  const ownerId = smokeUserId ?? user?.id;
  if (!ownerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await dispatchWebhookEvent({
    ownerId,
    event: "project.created",
    data: { test: true, message: "WonderBuild webhook test" },
  });

  return NextResponse.json({ ok: true, result });
}
