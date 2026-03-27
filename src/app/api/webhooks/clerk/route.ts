import { NextRequest, NextResponse } from "next/server";
import ClerkSyncService from "@/services/clerk-sync.service";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-clerk-webhook-secret");
  const expected = process.env.CLERK_WEBHOOK_SECRET;

  if (!expected) {
    console.error("CLERK_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "webhook not configured" },
      { status: 500 }
    );
  }

  if (!secret || secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    console.error("Failed to parse webhook body", err);
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  // Clerk webhook payloads typically have a `type` and a `data.object` containing the user
  const eventType = body?.type || body?.event || body?.event_type || "";
  const userObj = body?.data?.object || body?.data || body?.object || body;

  try {
    // Only handle user create/update events for now
    if (typeof eventType === "string" && eventType.startsWith("user.")) {
      await ClerkSyncService.upsertClerkUser(userObj);
      return NextResponse.json({ success: true });
    }

    // If payload directly contains a user object, attempt to upsert
    if (userObj && userObj?.id) {
      await ClerkSyncService.upsertClerkUser(userObj);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error handling Clerk webhook:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
