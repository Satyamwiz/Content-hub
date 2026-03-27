import { NextRequest, NextResponse } from "next/server";
import ProfileService from "@/services/profile.service";

export async function GET() {
  try {
    const result = await ProfileService.getProfile();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "User not authenticated" ? 401 : 500 }
      );
    }

    return NextResponse.json({ success: true, profile: result.profile });
  } catch (error) {
    console.error("Error in GET /api/profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await ProfileService.createOrUpdateProfile(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "User not authenticated" ? 401 : 500 }
      );
    }

    return NextResponse.json({ success: true, profile: result.profile });
  } catch (error) {
    console.error("Error in POST /api/profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
