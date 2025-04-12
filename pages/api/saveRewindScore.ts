import { Database } from "@/types/supabase";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface ScorePayload {
    gameId: string;
    score: number;
    totalMoments: number; // Received from frontend
    correctMoments: number; // Received from frontend
    skipped: number;        // Received from frontend
    answers: { momentIndex: number; selectedOption: number | null; isCorrect: boolean | null }[];
}

export async function POST(request: Request) {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // 1. Check Authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        console.error("Session Error:", sessionError.message);
        return NextResponse.json({ message: "Error retrieving session" }, { status: 500 });
    }
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Parse and Validate Body
    let payload: ScorePayload;
    try {
        payload = await request.json();
    } catch (parseError) {
        console.error("Payload Parsing Error:", parseError);
        return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const { gameId, score, totalMoments, correctMoments, skipped, answers } = payload;

    // Basic validation
    if (
        typeof gameId !== "string" || !gameId ||
        typeof score !== "number" || score < 0 ||
        typeof totalMoments !== "number" || totalMoments <= 0 ||
        typeof correctMoments !== "number" || correctMoments < 0 || correctMoments > totalMoments ||
        typeof skipped !== "number" || skipped < 0 || (correctMoments + skipped) > totalMoments ||
        !Array.isArray(answers)
    ) {
        return NextResponse.json({ message: "Invalid payload structure or values" }, { status: 400 });
    }

    // --- UPDATED: Prepare Data for Supabase with metadata column --- 
    const scoreData = {
        user_id: userId,
        game_id: gameId,
        score: score,
        mode: "rewind", 
        metadata: { 
            total_moments: totalMoments,
            correct_moments: correctMoments,
            skipped_moments: skipped,
            // Store detailed answers if needed (optional)
            // detailed_answers: answers 
        },
    };

    // 4. Insert into Supabase
    const { error } = await supabase
        .from("scores")
        .insert([scoreData]);

    // Check insert error directly
    if (error) {
        console.error("Supabase Insert Error (scores):", error.message);
        return NextResponse.json({ message: `Failed to save score: ${error.message}` }, { status: 500 });
    }

    // 5. Return Success
    return NextResponse.json({ message: "Rewind score saved successfully" }, { status: 201 });
} 