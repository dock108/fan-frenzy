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
interface MomentBase { index: number; type: 'start' | 'fill-in' | 'end'; }
interface StartEndMoment extends MomentBase { type: 'start' | 'end'; context: string; }
interface FillInMoment extends MomentBase { type: 'fill-in'; prompt: string; answer: string; importance: number; }
type Moment = StartEndMoment | FillInMoment;
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
        // Return a fallback message instead of throwing, allowing moment generation to try with limited info
        // Or potentially throw here if PBP is absolutely required
        // throw new Error(`AI PBP generation failed: ${error.message}`);
        return `Error generating play-by-play for ${gameTitle}. Proceeding with moment generation based on title only.`;
    }
}

// --- Function to Process Data with OpenAI --- 
async function generateKeyMomentsWithAI(playByPlayText: string, gameTitle: string): Promise<GameData> {
    console.log("[AI Moments Gen] Sending request to OpenAI GPT-4o...");
    const systemPrompt = `
You are an expert sports analyst. Given the following play-by-play text for a game, identify exactly 8-10 key moments that represent the critical narrative flow of the game's ending sequence. Structure these moments as a JSON object matching the specified GameData interface. 

Requirements:
1.  The FIRST moment MUST have type "start" and provide context for the beginning of the key sequence.
2.  The LAST moment MUST have type "end" and provide context for the conclusion of the sequence.
3.  ALL moments BETWEEN start and end MUST have type "fill-in".
4.  Each "fill-in" moment needs:
    *   A "prompt" (string): A clear question asking the user to recall a specific detail (player, play type, result, decision etc.) from that moment in the provided text.
    *   An "answer" (string): The concise, correct answer to the prompt, directly derivable from the text.
    *   An "importance" (number): A score from 0.0 to 10.0 indicating how crucial this moment was to the game's outcome (use decimals).
5.  Assign sequential "index" numbers starting from 0.
6.  The entire output must be a single valid JSON object containing an "event_data" object (can be simple like {"summary": "AI processed"}) and a "key_moments" array.

Example Fill-In Moment:
{
  "index": 1,
  "type": "fill-in",
  "prompt": "Who caught the pass setting up 1st & Goal?",
  "answer": "Tiquan Underwood",
  "importance": 9.2
}

Strictly adhere to the JSON structure and types. Ensure the prompts are questions and answers are concise facts from the text. If the provided Play-by-Play Text indicates an error during its generation, generate the best possible moments based on the game title alone.
`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Generate key moments for game: ${gameTitle}

Play-by-Play Text:
${playByPlayText}` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
        });

        const jsonResponse = completion.choices[0]?.message?.content;
        if (!jsonResponse) throw new Error('OpenAI moments response content is missing.');

        console.log("[AI Moments Gen] Received response from OpenAI.");
        const parsedData = JSON.parse(jsonResponse);

        if (!parsedData.key_moments || !Array.isArray(parsedData.key_moments)) {
            throw new Error('Invalid JSON structure from AI: key_moments missing/invalid.');
        }
        if (!parsedData.event_data) {
             parsedData.event_data = { summary: "AI processed summary" };
        }

        console.log("[AI Moments Gen] Successfully parsed AI response.");
        return parsedData as GameData;

    } catch (error: any) {
        console.error("[AI Moments Gen] Error during OpenAI call or parsing:", error);
        if (error.response) console.error("[AI Moments Gen] OpenAI Error Response:", error.response.data);
        throw new Error(`AI moments generation failed: ${error.message}`);
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

        if (cachedGame?.event_data && cachedGame?.key_moments) {
            console.log(`[API Fetch Game] Cache hit for ${gameId}. Returning cached data.`);
            return NextResponse.json(cachedGame as GameData);
        }

        // 2. Cache Miss: Generate PBP with AI, then Generate Moments with AI
        console.log(`[API Fetch Game] Cache miss for ${gameId}. Generating PBP and moments with AI.`);
        const gameTitle = `${team} ${year} - ${gameId}`; // Simple title for AI context
        
        // Step 2a: Generate Play-by-Play text using AI
        const playByPlayText = await generatePlayByPlayWithAI(team, year, gameId, gameTitle);
        
        // Step 2b: Generate Key Moments based on the (potentially AI-generated) PBP
        const processedGameData = await generateKeyMomentsWithAI(playByPlayText, gameTitle);
        
        // Add the generated PBP text to event_data for potential display/debugging
        if (!processedGameData.event_data) processedGameData.event_data = {};
        processedGameData.event_data.ai_generated_pbp = playByPlayText;

        // 3. Insert into Cache
        console.log(`[API Fetch Game] Inserting AI-generated data into cache for ${gameId}.`);
        const { error: insertError } = await supabaseAdmin
            .from('game_cache')
            .insert({
                source_game_id: gameId,
                source_api: 'openai-gpt-4o-pbp-moments-v1', // Indicate full AI source
                league: 'Unknown/AI', // TODO: Maybe ask AI for league?
                event_data: processedGameData.event_data, // Includes PBP text now
                key_moments: processedGameData.key_moments,
                fetched_at: new Date().toISOString(),
                needs_review: true // AI-generated data definitely needs review
            });

        if (insertError) {
            console.error('[API Fetch Game] Cache insert error:', insertError);
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