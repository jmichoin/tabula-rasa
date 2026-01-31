
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { song_info, chords, pro_tab, tuning } = body;

        if (!song_info || (!chords && !pro_tab)) {
            return NextResponse.json({ success: false, message: 'Missing required data' }, { status: 400 });
        }

        const knowledgeDir = join(process.cwd(), '..', 'data', 'knowledge');
        if (!existsSync(knowledgeDir)) {
            await mkdir(knowledgeDir, { recursive: true });
        }

        // Create a unique key for the song
        const songKey = song_info.shazam_id || `${song_info.artist}_${song_info.title}`.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filePath = join(knowledgeDir, `${songKey}.json`);

        const knowledgeData = {
            song_info,
            chords,
            pro_tab,
            tuning,
            last_updated: new Date().toISOString(),
            version: 1
        };

        await writeFile(filePath, JSON.stringify(knowledgeData, null, 2));

        return NextResponse.json({
            success: true,
            message: 'AI Knowledge Updated! The system will leverage this for future sessions.'
        });
    } catch (error: any) {
        console.error('Knowledge Update Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to update knowledge', error: error.message }, { status: 500 });
    }
}
