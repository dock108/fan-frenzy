import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

// Define the expected structure of the JSON data for type safety
interface MomentBase {
    index: number;
    type: 'start' | 'fill-in' | 'end';
}
interface StartEndMoment extends MomentBase {
    type: 'start' | 'end';
    context: string;
}
interface FillInMoment extends MomentBase {
    type: 'fill-in';
    prompt: string;
    answer: string;
    importance: number;
}
type Moment = StartEndMoment | FillInMoment;
interface GameData {
    gameId: string;
    title: string;
    moments: Moment[];
}

export async function GET() {
    try {
        // Construct the absolute path to the JSON file
        // process.cwd() gives the root of the Next.js project
        const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'daily-challenge.json');

        // Read the file content
        const fileContent = await fs.readFile(jsonFilePath, 'utf-8');

        // Parse the JSON content
        const data: GameData = JSON.parse(fileContent);

        // Return the data as a JSON response
        return NextResponse.json(data);

    } catch (error) {
        console.error('[API GET Daily Challenge] Error:', error);

        // Determine the error type
        let errorMessage = 'Failed to load daily challenge data.';
        let statusCode = 500;

        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            errorMessage = 'Daily challenge data file not found.';
            statusCode = 404;
        } else if (error instanceof SyntaxError) {
            errorMessage = 'Failed to parse daily challenge data file (invalid JSON).';
            statusCode = 500;
        }

        // Return an error response
        return NextResponse.json(
            { message: errorMessage },
            { status: statusCode }
        );
    }
}

// Optional: Prevent caching if the challenge data changes daily
// export const dynamic = 'force-dynamic'; 