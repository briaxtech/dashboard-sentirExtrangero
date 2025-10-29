import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query<{ now: string }>('SELECT NOW() as now');
    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    console.error('[db-test] error connecting to database', error);
    return NextResponse.json(
      { ok: false, error: 'DB connection failed' },
      { status: 500 },
    );
  }
}
