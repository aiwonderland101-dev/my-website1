import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SPARK_TOKENS_LIMIT = 25_000;

function getBearerToken(req: NextRequest) {
  const h = req.headers.get("authorization") || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] || null;
}

export async function POST(req: NextRequest) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json({ ok: false, error: "Missing Authorization token" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anon) {
      return NextResponse.json({ ok: false, error: "Supabase env vars missing" }, { status: 500 });
    }

    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return NextResponse.json({ ok: false, error: "Invalid session" }, { status: 401 });
    }

    const userId = userRes.user.id;

    const { error: upsertProfileErr } = await supabase
      .from("profiles")
      .upsert({ id: userId, plan: "spark" }, { onConflict: "id" });

    if (upsertProfileErr) {
      return NextResponse.json(
        { ok: false, error: upsertProfileErr.message, hint: "Do you have a profiles table with id + plan?" },
        { status: 400 }
      );
    }

    const { error: upsertUsageErr } = await supabase
      .from("user_usage")
      .upsert({ user_id: userId, plan: "spark", tokens_limit: SPARK_TOKENS_LIMIT }, { onConflict: "user_id" });

    if (upsertUsageErr) {
      return NextResponse.json(
        { ok: false, error: upsertUsageErr.message, hint: "Do you have a user_usage table with user_id + plan + tokens_limit?" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, plan: "spark", tokensLimit: SPARK_TOKENS_LIMIT });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
