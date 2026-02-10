import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/db';
import { SessionChatTable } from '@/config/shema';
import { eq, desc } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server'; // or your auth provider

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }
  try {
    if (sessionId === 'all') {
      const result = await db
        .select()
        .from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, user.primaryEmailAddress.emailAddress))
        .orderBy(desc(SessionChatTable.id));

      if (!result.length) {
        return NextResponse.json({ error: "No sessions found" }, { status: 404 });
      }

      // Return full list of sessions instead of just first one
      return NextResponse.json(result, { status: 200 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const result = await db
      .select()
      .from(SessionChatTable)
      .where(eq(SessionChatTable.sessionId, sessionId));

    if (!result.length) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });

  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// import { SessionChatTable } from "@config/schema";
// import { currentUser } from "@clerk/nextjs/server";
// import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

 // adjust to your schema location

export async function POST(req: NextRequest) {
  try {
    const { notes, selectedDoctor } = await req.json();
    const user = await currentUser();

    if (!notes || !selectedDoctor) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sessionId = uuidv4();

    // Insert into DB
    const result = await db
      .insert(SessionChatTable)
      .values({
        sessionId,
        createdBy: user?.primaryEmailAddress?.emailAddress || "anonymous",
        notes,
        selectedDoctor,
        createdOn: new Date().toISOString(),
      })
      .returning(); // let Drizzle return full inserted row(s)

    console.log("DB insert result:", result);

    // Return predictable structure
    return NextResponse.json({ sessionId }, { status: 200 });
  } catch (e: any) {
    console.error("Error in POST /api/session-chat:", e);
    return NextResponse.json(
      { error: e.message || "Internal server error" },
      { status: 500 }
    );
  }
}
