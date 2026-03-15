import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const LOGS_DIR = path.join(process.cwd(), 'logs')

function getLogPath(date: string): string {
  return path.join(LOGS_DIR, `${date}.json`)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 })
  }

  try {
    const content = await fs.readFile(getLogPath(date), 'utf-8')
    return NextResponse.json(JSON.parse(content))
  } catch (e: unknown) {
    if (e instanceof Error && 'code' in e && (e as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(null)
    }
    return NextResponse.json({ error: 'Failed to read log' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, status, rpe, actualDuration, notes } = body

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !status || rpe === undefined) {
      return NextResponse.json(
        { error: 'date, status, and rpe are required' },
        { status: 400 }
      )
    }

    await fs.mkdir(LOGS_DIR, { recursive: true })

    const log = {
      date,
      status,
      rpe,
      actualDuration: actualDuration || null,
      notes: notes || null,
    }

    await fs.writeFile(getLogPath(date), JSON.stringify(log, null, 2))
    return NextResponse.json(log)
  } catch {
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 })
  }
}
