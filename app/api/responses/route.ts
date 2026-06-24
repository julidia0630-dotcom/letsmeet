import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  sendEditLinkEmail,
  sendHostNotifyEmail,
} from '@/lib/emails'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_id, name, email, available_dates } = body

    if (!event_id || !name || !email || !available_dates?.length) {
      return NextResponse.json({ error: '필수 항목이 누락됐어요.' }, { status: 400 })
    }

    // 이벤트 조회
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: '이벤트를 찾을 수 없어요.' }, { status: 404 })
    }

    if (event.is_closed) {
      return NextResponse.json({ error: '마감된 이벤트예요.' }, { status: 403 })
    }

    // 응답 저장
    const { data: response, error } = await supabaseAdmin
      .from('responses')
      .insert({ event_id, name, email, available_dates })
      .select()
      .single()

    if (error) throw error

    // 응답자에게 편집 링크 이메일 발송
    await sendEditLinkEmail(email, name, event.title, response.edit_token)

    // 주최자 알림 (즉시 모드)
    if (event.notify_mode === 'instant') {
      await sendHostNotifyEmail(
        event.host_email,
        event.host_name,
        event.title,
        event.id,
        name
      )
    }

    return NextResponse.json({ response })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '응답 저장에 실패했어요.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { edit_token, available_dates } = body

    if (!edit_token || !available_dates?.length) {
      return NextResponse.json({ error: '필수 항목이 누락됐어요.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('responses')
      .update({ available_dates, updated_at: new Date().toISOString() })
      .eq('edit_token', edit_token)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ response: data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '응답 수정에 실패했어요.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const edit_token = searchParams.get('edit_token')

    if (!edit_token) {
      return NextResponse.json({ error: 'edit_token이 필요해요.' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('responses')
      .delete()
      .eq('edit_token', edit_token)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: '응답 삭제에 실패했어요.' }, { status: 500 })
  }
}