import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendDailySummaryEmail, sendDeadlineResultEmail } from '@/lib/emails'

export async function GET() {
  try {
    const now = new Date()

    // 마감일 지난 이벤트 잠금 처리
    const { data: expiredEvents } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('is_closed', false)
      .lt('deadline', now.toISOString())
      .not('deadline', 'is', null)

    for (const event of expiredEvents ?? []) {
      await supabaseAdmin
        .from('events')
        .update({ is_closed: true })
        .eq('id', event.id)

      await sendDeadlineResultEmail(
        event.host_email,
        event.host_name,
        event.title,
        event.id
      )
    }

    // 하루 요약 알림
    const { data: dailyEvents } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('is_closed', false)
      .eq('notify_mode', 'daily')

    for (const event of dailyEvents ?? []) {
      const { count } = await supabaseAdmin
        .from('responses')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)

      await sendDailySummaryEmail(
        event.host_email,
        event.host_name,
        event.title,
        event.id,
        count ?? 0
      )
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Cron 실행 실패' }, { status: 500 })
  }
}