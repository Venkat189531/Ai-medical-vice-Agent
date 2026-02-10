
import { NextRequest,NextResponse } from 'next/server';
import { openai } from '@/config/OpenAiModel';
import { AIDoctorAgents } from '@/shared/list';

// import Together from 'together-ai';
// const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });
const PROMPT = `You are an AI Trip Planner Agent. Your goal is to assist the user in planning a trip by asking one relevant trip-related question at a time, following a strict sequence. Only ask questions in the order below, and wait for the user's clear and complete answer before proceeding to the next question:

1. Starting location (e.g., city or country of origin)
2. Destination city or country
3. Group size (e.g., Solo, Couple, Family, Friends)
4. Budget (e.g.Cheap: under $1000, Moderate: $1000-$5000, Luxury: over $5000)
5. Trip duration (number of days)
6. Travel interests (e.g., adventure, sightseeing, cultural, food, nightlife, relaxation)
7. Special requirements or preferences (e.g., accessibility needs, dietary restrictions, specific activities)

Rules:
- Ask only one question at a time, directly related to the current step in the sequence.
- Do not ask irrelevant questions or combine multiple questions.
- If the user's answer is missing, incomplete, or unclear (e.g., vague location or invalid budget), politely ask for clarification for that specific question before proceeding.
- Maintain a friendly, conversational, and engaging tone in all responses.
- Once all seven questions are answered clearly, generate a strict JSON response (no explanations or extra text) adhering to the following schema:

- return a JSON object with the question as "resp" and the corresponding UI component as "ui" (e.g., "source", "destination", "groupSize", "budget", "tripDuration", "interests", "requirements").
- Ensure the "ui" value matches one of: "source", "destination", "groupSize", "budget", "tripDuration", "interests", "requirements", or "final".
- If the user provides unsolicited information (e.g., answers a later question early), store it but still ask the current question in sequence unless the answer is already clear and complete.

Example response:
{
  resp:"Text Resp",
  ui:"source/destination/budget/groupSize/tripDuration/interests/requirements/Final"
}

`


const FINAL_PROMPT =` Generate Travel Plan with give details, give me Hotels options list with HotelName, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest itinerary with placeName, Place Details, Place Image Url, Geo Coordinates, Place address, ticket Pricing, Time travel each of the location, with each day plan with best time to visit in JSON format.

{
  "trip_plan": {
    "destination": "string",
    "duration": "string",
    "origin": "string",
    "budget": "string",
    "group_size": "string",
    "hotels": [
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string",
        "hotel_image_url": "string",
        "geo_coordinates": {
          "latitude": "number",
          "longitude": "number"
        },
        "rating": "number",
        "description": "string"
      }
    ],
    "itinerary": [
      {
        "day": "number",
        "day_plan": "string",
        "best_time_to_visit_day": "string",
        "activities": [
          {
            "place_name": "string",
            "place_details": "string",
            "place_image_url": "string",
            "geo_coordinates": {
              "latitude": "number",
              "longitude": "number"
            },
            "place_address": "string",
            "ticket_pricing": "string",
            "time_travel_each_location": "string",
            "best_time_to_visit": "string"
          }
        ]
      }
    ]
  }
}
`
// export async function POST(req:NextResponse){
//     const {messages,isFinal}=await req.json();
//     try{
//     const completion = await together.chat.completions.create({
//     model: 'meta-llama/Llama-Vision-Free',
//     messages: [
//         {
//             role:'system',
//             content:isFinal?FINAL_PROMPT:PROMPT
//         },
//       ...messages,
//     ],
//   });
//   console.log(completion.choices[0].message);
//   const message=completion.choices[0].message;
//   return NextResponse.json(JSON.parse(message.content??''));
// } catch (error) {
//    return NextResponse.json(error);
// }
// }


export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body
    const { notes } = await req.json();

    // 2. Validate input
    if (!notes || typeof notes !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing notes" },
        { status: 400 }
      );
    }

    // 3. Call AI model (adjust model name depending on your provider)
    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_KEY 
        ? "google/gemma-2-9b-it" // example Gemma model on OpenRouter
        : "gpt-4o-mini",         // standard OpenAI model
      messages: [
        {
          role: "system",
          content: JSON.stringify(AIDoctorAgents), // make sure AIDoctorAgents is defined
        },
        {
          role: "user",
          content: `User Notes/Symptoms: ${notes}.
Please suggest a list of doctors and return only valid JSON in this format:
[
  {
    "id": number,
    "specialist": string,
    "description": string,
    "image": string,
    "agentPrompt": string
  }
]`,
        },
      ],
    });

    // 4. Extract response safely
    const messageContent = completion.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("No response from AI model");
    }

    // 5. Clean and parse JSON safely
    let jsonResponse;
    try {
      const cleanedContent = messageContent
        .trim()
        .replace(/```json/g, "")
        .replace(/```/g, "");
      jsonResponse = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("AI raw response:", messageContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    // 6. Return response
    return NextResponse.json(jsonResponse, { status: 200 });

  } catch (error: any) {
    // 7. Log detailed error for debugging
    console.error("Error in POST /api/medical-agent:", 
      error.response?.data || error.message || error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}