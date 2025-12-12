
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const filePath = path.join(process.cwd(), 'lib/algo-stategies/algo-scripts.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Algo scripts file not found' }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const scripts = JSON.parse(fileContents);

    if (id) {
        const script = scripts.find((s: any) => s.url === id);
        if (script) {
            return NextResponse.json(script);
        } else {
            return NextResponse.json({ error: 'Script not found' }, { status: 404 });
        }
    }

    // Return summary list (exclude description and source, map likes_count to likes)
    const summaryScripts = scripts.map(({ description, source, likes, ...rest }: any) => ({
      ...rest,
      likes
    }))
    return NextResponse.json(summaryScripts)
  } catch (error) {
    console.error('Error reading algo scripts:', error);
    return NextResponse.json({ error: 'Failed to fetch algo scripts' }, { status: 500 });
  }
}
