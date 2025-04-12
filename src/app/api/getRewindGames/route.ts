import { NextResponse, type NextRequest } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

// Define the expected structure of the game list data
interface GameInfo {
    gameId: string;
    week?: number | string; // Allow string for things like "Wild Card"
    date: string;
    opponent: string;
    result?: string;
}

type GameList = GameInfo[];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const team = searchParams.get('team')?.toUpperCase() // Ensure consistent casing
    const year = searchParams.get('year')

    // Validate query parameters
    if (!team || !year) {
        return NextResponse.json(
            { message: 'Bad Request: Missing team or year parameter.' },
            { status: 400 }
        );
    }

    // Basic validation (can be enhanced)
    if (!/^[A-Z]{2,4}$/.test(team)) { // Example: Expect 2-4 uppercase letters
         return NextResponse.json({ message: 'Bad Request: Invalid team format.' }, { status: 400 });
    }
    if (!/^[0-9]{4}$/.test(year)) { // Example: Expect 4 digits for year
        return NextResponse.json({ message: 'Bad Request: Invalid year format.' }, { status: 400 });
    }

    try {
        // Construct the filename and path
        const filename = `${team}_${year}.json`;
        const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'games', filename);

        // Read the file content
        const fileContent = await fs.readFile(jsonFilePath, 'utf-8');

        // Parse the JSON content
        const data: GameList = JSON.parse(fileContent);

        // Return the data as a JSON response
        return NextResponse.json(data);

    } catch (error) {
        console.error(`[API GET Rewind Games - ${team} ${year}] Error:`, error);

        let errorMessage = 'Failed to load game list data.';
        let statusCode = 500;

        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            errorMessage = `Game list not found for ${team} ${year}.`;
            statusCode = 404;
        } else if (error instanceof SyntaxError) {
            errorMessage = 'Failed to parse game list data file (invalid JSON).';
            statusCode = 500;
        }

        // Return an error response
        return NextResponse.json(
            { message: errorMessage },
            { status: statusCode }
        );
    }
} 