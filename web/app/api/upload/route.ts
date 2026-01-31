
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const songName = data.get('songName') as string || 'Unknown';
        const artist = data.get('artist') as string || 'Unknown';
        const tuning = data.get('tuning') as string || 'Standard E';

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file received' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public/uploads
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        const stemsDir = join(process.cwd(), 'public', 'stems');

        try {
            await mkdir(uploadDir, { recursive: true });
            await mkdir(stemsDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        const filePath = join(uploadDir, file.name);
        await writeFile(filePath, buffer);

        console.log(`File saved to ${filePath} for ${songName} by ${artist}`);

        // --- Execute Python Script ---
        const pythonScriptPath = join(process.cwd(), '..', 'execution', 'ml', 'process_audio.py');
        const pythonPath = join(process.cwd(), '..', '.venv', 'bin', 'python');

        console.log(`Executing Python: ${pythonPath} ${pythonScriptPath}`);

        return new Promise((resolve) => {
            const { spawn } = require('child_process');

            // Use spawn for safer argument handling
            const pyProcess = spawn(pythonPath, [
                pythonScriptPath,
                filePath,
                songName,
                artist,
                stemsDir,
                tuning
            ]);

            let stdout = '';
            let stderr = '';

            pyProcess.stdout.on('data', (data: Buffer) => {
                stdout += data.toString();
            });

            pyProcess.stderr.on('data', (data: Buffer) => {
                const msg = data.toString();
                stderr += msg;
                // Log debug info to server console
                if (msg.includes('DEBUG')) {
                    console.log(`[Python DEBUG] ${msg.trim()}`);
                }
            });

            pyProcess.on('close', (code: number) => {
                console.log(`Python process exited with code ${code}`);

                if (code !== 0) {
                    console.error(`Python Error Code ${code}: ${stderr}`);
                    resolve(NextResponse.json({
                        success: false,
                        message: 'Processing failed',
                        error: stderr || `Exited with code ${code}`
                    }, { status: 500 }));
                    return;
                }

                try {
                    const jsonStart = stdout.indexOf('{');
                    const jsonEnd = stdout.lastIndexOf('}');
                    if (jsonStart === -1 || jsonEnd === -1) {
                        throw new Error("No JSON found in output");
                    }
                    const jsonStr = stdout.substring(jsonStart, jsonEnd + 1);
                    const results = JSON.parse(jsonStr);

                    resolve(NextResponse.json({
                        success: true,
                        message: 'File processed successfully',
                        path: `/uploads/${file.name}`,
                        data: results
                    }));
                } catch (e) {
                    console.error('JSON Parse Error:', e);
                    console.error('Raw Stdout:', stdout);
                    resolve(NextResponse.json({
                        success: false,
                        message: 'Failed to parse processing results',
                        raw_output: stdout,
                        error: stderr
                    }, { status: 500 }));
                }
            });

            pyProcess.on('error', (err: any) => {
                console.error('Failed to start Python process:', err);
                resolve(NextResponse.json({
                    success: false,
                    message: 'Failed to start processing engine',
                    error: err.message
                }, { status: 500 }));
            });
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
    }
}
