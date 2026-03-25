import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PLAN_LIMITS = {
  spark: 25_000,
  builder: 100_000,
  visionary: 500_000,
  sovereign: 2_500_000,
} as const;

type SubscriptionPlan = keyof typeof PLAN_LIMITS;

function getBearerToken(req: NextRequest) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

function isValidPlan(plan: string): plan is SubscriptionPlan {
  return plan in PLAN_LIMITS;
}

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ success: false, error: "Missing Authorization token" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body as { plan?: string };

    if (!plan || !isValidPlan(plan)) {
      return NextResponse.json({ success: false, error: "Invalid plan provided" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anon) {
      return NextResponse.json({ success: false, error: "Supabase env vars missing" }, { status: 500 });
    }

    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
    }

    const userId = userRes.user.id;
    const tokenLimit = PLAN_LIMITS[plan];

    const { error: upsertProfileErr } = await supabase
      .from("profiles")
      .upsert({ id: userId, plan }, { onConflict: "id" });

    if (upsertProfileErr) {
      return NextResponse.json(
        { success: false, error: upsertProfileErr.message, hint: "Do you have a profiles table with id + plan?" },
        { status: 400 }
      );
    }

    const { error: upsertUsageErr } = await supabase
      .from("user_usage")
      .upsert({ user_id: userId, plan, tokens_limit: tokenLimit }, { onConflict: "user_id" });

    if (upsertUsageErr) {
      return NextResponse.json(
        { success: false, error: upsertUsageErr.message, hint: "Do you have a user_usage table with user_id + plan + tokens_limit?" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, plan, tokensLimit: tokenLimit });
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
