import { NextResponse } from "next/server";
import { issueSmokeToken, isSmokeEnabled } from "@lib/smokeAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSmokeEnabled()) {
    return NextResponse.json({ error: "Not enabled" }, { status: 403 });
  }

  const secret = process.env.SMOKE_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    return NextResponse.json({ error: "Not enabled" }, { status: 403 });
  }

  if (secret) {
    const provided = req.headers.get("x-smoke-secret");
    if (!provided || provided !== secret) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const token = issueSmokeToken("smoke-user");
  return NextResponse.json({ token, user: { id: "smoke-user" } });
}
