import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const LOGS_DIR = path.join(process.cwd(), 'logs')

function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true })
  }
}

function getLogPath(date: string): string {
  return path.join(LOGS_DIR, `${date}.json`)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 })
  }

  const logPath = getLogPath(date)

  if (!fs.existsSync(logPath)) {
    return NextResponse.json(null)
  }

  try {
    const content = fs.readFileSync(logPath, 'utf-8')
    const log = JSON.parse(content)
    return NextResponse.json(log)
  } catch {
    return NextResponse.json({ error: 'Failed to read log' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  ensureLogsDir()

  try {
    const body = await request.json()
    const { date, status, rpe, actualDuration, notes } = body

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !status || rpe === undefined) {
      return NextResponse.json(
        { error: 'date, status, and rpe are required' },
        { status: 400 }
      )
    }

    const logPath = getLogPath(date)
    const log = {
      date,
      status,
      rpe,
      actualDuration: actualDuration || null,
      notes: notes || null,
    }

    fs.writeFileSync(logPath, JSON.stringify(log, null, 2))
    return NextResponse.json(log)
  } catch {
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 })
  }
}
