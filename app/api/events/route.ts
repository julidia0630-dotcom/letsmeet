import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      host_name,
      host_email,
      date_range_start,
      date_range_end,
      excluded_weekdays,
      selection_mode,
      deadline,
      notify_mode,
    } = body

    if (!title || !host_name || !host_email || !date_range_start || !date_range_end) {
      return NextResponse.json({ error: '필수 항목이 누락됐어요.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({
        title,
        host_name,
        host_email,
        date_range_start,
        date_range_end,
        excluded_weekdays: excluded_weekdays ?? [],
        selection_mode: selection_mode ?? 'range',
        deadline: deadline ?? null,
        notify_mode: notify_mode ?? 'instant',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ event: data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '이벤트 생성에 실패했어요.' }, { status: 500 })
  }
}