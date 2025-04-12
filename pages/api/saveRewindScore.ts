interface ScorePayload {
    gameId: string;
    score: number;
    totalMoments: number; // Received from frontend
    correctMoments: number; // Received from frontend
    skipped: number;        // Received from frontend
    answers: { momentIndex: number; selectedOption: number | null; isCorrect: boolean | null }[];
}

export async function POST(request: Request) {
    // ... (auth check) ...
    const userId = session.user.id;

    // 2. Parse and Validate Body
    let payload: ScorePayload;
    try {
        payload = await request.json();
    } catch (e) {
        return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { gameId, score, totalMoments, correctMoments, skipped, answers } = payload;

    // Basic validation
    if (
        typeof gameId !== 'string' || !gameId ||
        typeof score !== 'number' || score < 0 ||
        typeof totalMoments !== 'number' || totalMoments <= 0 ||
        typeof correctMoments !== 'number' || correctMoments < 0 || correctMoments > totalMoments ||
        typeof skipped !== 'number' || skipped < 0 || (correctMoments + skipped) > totalMoments ||
        !Array.isArray(answers)
    ) {
        return NextResponse.json({ message: 'Invalid payload structure or values' }, { status: 400 });
    }

    // --- UPDATED: Prepare Data for Supabase with metadata column --- 
    const scoreData = {
        user_id: userId,
        game_id: gameId,
        score: score,
        mode: 'rewind', 
        metadata: { 
            total_moments: totalMoments,
            correct_moments: correctMoments,
            skipped_moments: skipped,
            // Store detailed answers if needed (optional)
            // detailed_answers: answers 
        },
    };

    // 4. Insert into Supabase
    const { error: insertError } = await supabase
        .from('scores')
        .insert([scoreData]);

    // ... (error handling and success response) ...
} 