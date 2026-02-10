import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/config/OpenAiModel';
import { db } from '@/config/db';
import { SessionChatTable } from '@/config/shema';
import { eq } from 'drizzle-orm';

const PROMPT = `You are an AI Medical Voice Agent that just finished a voice conversation with a user. Based on Depends on doctor AI agent into and Coversation between AI medical agent and user, generate a structured report with the following fields:

sessionId: a unique session identifier
agent: the medical specialist name (e.g., "General Physician AI")
user: name of the patient or "Anonymous" if not provided
timestamp: current date and time in ISO format
chiefComplaint: one-sentence summary of the main health concern
summary: a 2-3 sentence summary of the conversation, symptoms, and recommendations
symptoms: list of symptoms mentioned by the user
duration: how long the user has experienced the symptoms
severity: mild, moderate, or severe
medicationsMentioned: list of any medicines mentioned
recommendations: list of AI suggestions (e.g., rest, see a doctor)

Return the result in this JSON format ONLY:
{
  "sessionId": "string",
  "agent": "string",
  "user": "string",
  "timestamp": "ISO Date string",
  "chiefComplaint": "string",
  "summary": "string",
  "symptoms": {
    "symptom1": "string",
    "symptom2": "string"
  },
  "duration": "string",
  "severity": "string",
  "medicationsMentioned": ["med1", "med2"],
  "recommendations": ["rec1", "rec2"]
}`;

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionDetail, sessionId } = await req.json();
    const userInput = 
      "AI Doctor Agent Info: " + JSON.stringify(sessionDetail) + 
      ", Conversation: " + JSON.stringify(messages);

    // FIX: Ensure correct OpenAI model name
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // or gpt-4o, or your correct model
      messages: [
        { role: 'system', content: PROMPT },
        { role: 'user', content: userInput }
      ]
    });

    // FIX: Access the string content
    const messageContent = completion.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error('No response from AI model');
    }

    // Clean and parse JSON
    let jsonResponse;
    try {
      const cleanedContent = messageContent
        .trim()
        .replace(/```json/g, '')
        .replace(/```/g, '');
      jsonResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Parsing error: ", parseError, messageContent);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Save to database
    await db.update(SessionChatTable)
      .set({ report: jsonResponse,conversation:messages })
      .where(eq(SessionChatTable.sessionId, sessionId));

    return NextResponse.json(jsonResponse, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/medical-report:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
