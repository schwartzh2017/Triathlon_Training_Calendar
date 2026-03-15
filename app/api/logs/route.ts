import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const LOGS_DIR = path.join(process.cwd(), 'logs')

export async function GET() {
  try {
    const files = await fs.readdir(LOGS_DIR)
    const dates = files
      .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .map(f => f.replace('.json', ''))
    return NextResponse.json(dates)
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json([])
    }
    return NextResponse.json({ error: 'Failed to read logs' }, { status: 500 })
  }
}
