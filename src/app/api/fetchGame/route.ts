import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js' // Use standard client for admin access
import path from 'path'
import fs from 'fs/promises'
import OpenAI from 'openai' // Import OpenAI library

// Ensure environment variables are loaded (especially for server-side client)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use Service Role Key for admin actions
const openaiApiKey = process.env.OPENAI_API_KEY // Load OpenAI API Key

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('FATAL: Missing Supabase URL or Service Role Key');
}
if (!openaiApiKey) {
    console.error('FATAL: Missing OpenAI API Key');
}

// Initialize OpenAI client (do this once outside the handler)
const openai = new OpenAI({
    apiKey: openaiApiKey,
});

// Define expected data structures (can be shared with frontend types)
interface MomentBase { index: number; type: 'start' | 'mc' | 'end'; }
interface StartEndMoment extends MomentBase { type: 'start' | 'end'; context: string; }
interface MultipleChoiceMoment extends MomentBase { type: 'mc'; context: string; question: string; options: string[]; answer: number; explanation: string; importance: number; }
type Moment = StartEndMoment | MultipleChoiceMoment;
interface GameData {
    event_data: any; // Placeholder for scraped/API data or AI summary
    key_moments: Moment[];
}

// Helper function to get mock data (replace with real API/AI call later)
async function fetchMockGameData(team: string, year: string, gameId: string): Promise<GameData> {
    // Simple mock: use a predictable filename based on gameId or a generic one
    // In a real scenario, this would involve API calls or AI generation
    const mockFilename = `${gameId.replace(/[^a-zA-Z0-9]/g, '_')}.json`; // Example: ne_2023_wk1.json
    // For now, let's hardcode to use the NE_2023_WK1 mock for demonstration
    const mockFilePath = path.join(process.cwd(), 'src', 'data', 'mock-games', 'NE_2023_WK1.json');
    console.log(`[API Fetch Game] Cache miss for ${gameId}. Fetching mock data from ${mockFilePath}`);

    try {
        const fileContent = await fs.readFile(mockFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        // Ensure the returned structure matches GameData interface
        if (!data.event_data || !data.key_moments) {
             throw new Error('Mock data file has incorrect structure.');
        }
        return data as GameData;
    } catch (err) {
        console.error(`[API Fetch Game] Error reading/parsing mock file ${mockFilePath}:`, err);
        throw new Error(`Could not load mock game data for ${gameId}.`);
    }
}

// --- Placeholder for Play-by-Play Data --- 
const getPlaceholderPlayByPlay = (gameId: string): string => {
    // ALWAYS return the Rutgers PBP for demo purposes, regardless of gameId
    // console.log(`DEBUG: Using Rutgers PBP placeholder for requested gameId: ${gameId}`)
    return `
    Louisville vs. Rutgers - November 9, 2006 - Key Sequence Analysis

    Mid-4th Quarter: Louisville leads 25-17. Rutgers drives.
    Play: Ray Rice 2-yard TD run. Score: LOU 25, RUT 23.
    Play: Rutgers 2-point conversion attempt FAILED.
    
    Following Possession: Louisville punts after 3 plays.

    Final Drive (Rutgers): Starts near midfield, under 2 mins left.
    Play: Ray Rice runs for small gain.
    Play: Mike Teel pass incomplete.
    Play: Mike Teel pass complete to Tiquan Underwood for 28 yards to LOU 7. (1st & Goal)
    Play: Ray Rice run, no gain.
    Play: Timeout Rutgers.
    Play: Mike Teel pass incomplete.
    Play: Mike Teel pass incomplete.
    Play: Timeout Rutgers. (18 seconds left)
    Play: Rutgers elects to kick FG on 4th & Goal from the 10.
    Play: Jeremy Ito 28-yard Field Goal attempt IS GOOD. Score: RUT 28, LOU 25. (13 seconds left)
    
    Final Sequence: Louisville attempts final plays, game ends.
    Final Score: Rutgers 28, Louisville 25.
    `;
    // Removed the if check and the default error message return
}

// --- Function to Generate Play-by-Play with OpenAI --- 
async function generatePlayByPlayWithAI(team: string, year: number, gameId: string, gameTitle: string): Promise<string> {
    console.log(`[AI PBP Gen] Requesting PBP generation for ${gameTitle}...`);
    const prompt = `
Please generate a detailed, factual play-by-play summary for the final stages (e.g., last quarter or key final drives) of the following sports game:

Game ID: ${gameId}
Team: ${team}
Year: ${year}
Title: ${gameTitle}

Focus on the sequence of plays that led to the final outcome. Include scores changing, key player actions (passes, runs, kicks, turnovers), timeouts, and final score. Present it as plain text.
`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a sports archivist providing detailed play-by-play summaries." },
                { role: "user", content: prompt }
            ],
            temperature: 0.3, // Slightly higher temp for generation, but still aiming for factuality
            max_tokens: 500, // Limit token usage
        });

        const pbpText = completion.choices[0]?.message?.content;

        if (!pbpText) {
            throw new Error('OpenAI PBP generation response content is missing.');
        }

        console.log(`[AI PBP Gen] Successfully generated PBP text for ${gameTitle}.`);
        return pbpText.trim();

    } catch (error: any) {
        console.error("[AI PBP Gen] Error during OpenAI call:", error);
        if (error.response) {
            console.error("[AI PBP Gen] OpenAI Error Response:", error.response.data);
        }
        return `Error generating play-by-play for ${gameTitle}. Proceeding with moment generation based on title only.`;
    }
}

// --- Function to Generate Key Moments (Now Multiple Choice) --- 
async function generateKeyMomentsWithAI(playByPlayText: string, gameTitle: string): Promise<GameData> {
    console.log("[AI MC Moments Gen] Sending request to OpenAI GPT-4o...");
    // UPDATED System Prompt for Multiple Choice
    const systemPrompt = `
You are an expert sports analyst. Given the following play-by-play text for a game, identify exactly 5-7 key moments. Structure these moments as a JSON object matching the specified GameData interface.

Requirements:
1.  Each moment MUST have type "mc" (multiple choice).
2.  Each moment needs:
    *   "index" (number): Sequential, starting from 0.
    *   "type" (string): Set to "mc".
    *   "context" (string): Text describing the game situation *before* the key event happens.
    *   "question" (string): A clear multiple-choice question about the *next key event* based on the context and play-by-play.
    *   "options" (array of strings): Exactly 4 plausible options. One must be the correct answer derived from the text.
    *   "answer" (number): The 0-based index of the correct option in the "options" array.
    *   "explanation" (string): A brief explanation of why the answer is correct, citing the play-by-play.
    *   "importance" (number): A score from 0.0 to 10.0 indicating how crucial this moment was (use decimals).
3.  The entire output must be a single valid JSON object containing an "event_data" object (e.g., {"summary": "AI processed"}) and a "key_moments" array containing only "mc" type moments.

Example MC Moment:
{
  "index": 1,
  "type": "mc",
  "context": "Runner on 1st, 0 outs. Bill Mueller batting.",
  "question": "What does Dave Roberts famously do next?",
  "options": [
    "Gets picked off",
    "Steals second base",
    "Advances on a wild pitch",
    "Gets thrown out stealing"
  ],
  "answer": 1,
  "explanation": "Dave Roberts steals second base, putting the tying run in scoring position.",
  "importance": 9.8
}

Strictly adhere to the JSON structure and types. Generate exactly 4 options for each question.
`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Generate multiple choice key moments for game: ${gameTitle}

Play-by-Play Text:
${playByPlayText}` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5, // Slightly higher temp might help option generation
        });

        const jsonResponse = completion.choices[0]?.message?.content;
        if (!jsonResponse) throw new Error('OpenAI MC moments response content is missing.');

        console.log("[AI MC Moments Gen] Received response from OpenAI.");
        const parsedData = JSON.parse(jsonResponse);

        if (!parsedData.key_moments || !Array.isArray(parsedData.key_moments)) {
            throw new Error('Invalid JSON structure from AI: key_moments missing/invalid.');
        }
        // Add more validation here if needed (e.g., check moment types, options array length)
        if (!parsedData.event_data) {
             parsedData.event_data = { summary: "AI processed summary" };
        }

        console.log("[AI MC Moments Gen] Successfully parsed AI response.");
        return parsedData as GameData;

    } catch (error: any) {
        console.error("[AI MC Moments Gen] Error during OpenAI call or parsing:", error);
        if (error.response) console.error("[AI MC Moments Gen] OpenAI Error Response:", error.response.data);
        throw new Error(`AI MC moments generation failed: ${error.message}`);
    }
}

// --- Main API Route Handler --- 
export async function GET(request: NextRequest) {
    if (!supabaseUrl || !supabaseServiceRoleKey || !openaiApiKey) {
        return NextResponse.json({ message: 'Server configuration error: Credentials missing.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { searchParams } = new URL(request.url);
    const team = searchParams.get('team')?.toUpperCase();
    const yearStr = searchParams.get('year');
    const gameId = searchParams.get('gameId');

    if (!team || !yearStr || !gameId) {
        return NextResponse.json({ message: 'Bad Request: Missing team, year, or gameId.' }, { status: 400 });
    }
    const year = parseInt(yearStr);
    if (isNaN(year)) {
         return NextResponse.json({ message: 'Bad Request: Invalid year format.' }, { status: 400 });
    }

    try {
        // 1. Check Cache
        console.log(`[API Fetch Game] Checking cache for gameId: ${gameId}`);
        const { data: cachedGame, error: cacheError } = await supabaseAdmin
            .from('game_cache')
            .select('event_data, key_moments')
            .eq('source_game_id', gameId)
            .maybeSingle();

        if (cacheError) {
            console.error('[API Fetch Game] Cache lookup error:', cacheError);
            throw new Error(`Database error checking cache: ${cacheError.message}`);
        }

        // Check if cached data looks like the new MC format (simple check on first moment type)
        const firstMoment = cachedGame?.key_moments?.[0];
        if (cachedGame?.event_data && cachedGame?.key_moments && firstMoment?.type === 'mc') {
            console.log(`[API Fetch Game] Cache hit (MC Format) for ${gameId}. Returning cached data.`);
            return NextResponse.json(cachedGame as GameData);
        } else if (cachedGame) {
             console.log(`[API Fetch Game] Cache hit for ${gameId}, but data is old format or invalid. Re-fetching.`);
             // Optional: Delete the old cache entry here?
        }

        // 2. Cache Miss or Old Format: Generate PBP and Moments
        console.log(`[API Fetch Game] Cache miss or old format for ${gameId}. Generating PBP and MC moments with AI.`);
        const gameTitle = `${team} ${year} - ${gameId}`;
        
        const playByPlayText = await generatePlayByPlayWithAI(team, year, gameId, gameTitle);
        const processedGameData = await generateKeyMomentsWithAI(playByPlayText, gameTitle);
        
        if (!processedGameData.event_data) processedGameData.event_data = {};
        processedGameData.event_data.ai_generated_pbp = playByPlayText;

        // 3. Insert/Upsert into Cache
        console.log(`[API Fetch Game] Upserting AI-generated MC data into cache for ${gameId}.`);
        // Use upsert to overwrite old format if it existed
        const { error: upsertError } = await supabaseAdmin
            .from('game_cache')
            .upsert({
                source_game_id: gameId,
                source_api: 'openai-gpt-4o-pbp-mc-moments-v1', // Updated source ID
                league: 'Unknown/AI',
                event_data: processedGameData.event_data,
                key_moments: processedGameData.key_moments,
                fetched_at: new Date().toISOString(),
                needs_review: true
            }, { onConflict: 'source_game_id' }); // Upsert based on gameId

        if (upsertError) {
            console.error('[API Fetch Game] Cache upsert error:', upsertError);
            // Return data even if cache insert fails
        }

        // 4. Return Processed Data
        return NextResponse.json(processedGameData);

    } catch (error: any) {
        console.error('[API Fetch Game] General Error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal Server Error fetching game data.' },
            { status: 500 }
        );
    }
} 