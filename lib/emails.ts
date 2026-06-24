import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export async function sendEditLinkEmail(
  to: string,
  name: string,
  eventTitle: string,
  editToken: string
) {
  const editUrl = `${BASE_URL}/r/${editToken}`
  await resend.emails.send({
    from: 'LetsMeet <onboarding@resend.dev>',
    to,
    subject: `[LetsMeet] ${eventTitle} 응답 수정 링크`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#111">안녕하세요, ${name}님 👋</h2>
        <p><strong>${eventTitle}</strong> 일정 조율에 응답해주셔서 감사해요!</p>
        <p>아래 링크로 언제든지 응답을 수정하거나 삭제할 수 있어요.</p>
        <a href="${editUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none">응답 수정하기</a>
        <p style="color:#888;font-size:13px">링크는 본인만 보관해주세요.</p>
      </div>
    `,
  })
}

export async function sendHostNotifyEmail(
  to: string,
  hostName: string,
  eventTitle: string,
  eventId: string,
  responderName: string
) {
  const resultUrl = `${BASE_URL}/e/${eventId}/result`
  await resend.emails.send({
    from: 'LetsMeet <onboarding@resend.dev>',
    to,
    subject: `[LetsMeet] ${responderName}님이 ${eventTitle}에 응답했어요`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#111">안녕하세요, ${hostName}님 👋</h2>
        <p><strong>${responderName}</strong>님이 <strong>${eventTitle}</strong> 일정 조율에 응답했어요!</p>
        <a href="${resultUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none">결과 확인하기</a>
      </div>
    `,
  })
}

export async function sendDeadlineResultEmail(
  to: string,
  hostName: string,
  eventTitle: string,
  eventId: string
) {
  const resultUrl = `${BASE_URL}/e/${eventId}/result`
  await resend.emails.send({
    from: 'LetsMeet <onboarding@resend.dev>',
    to,
    subject: `[LetsMeet] ${eventTitle} 응답 마감됐어요`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#111">안녕하세요, ${hostName}님 👋</h2>
        <p><strong>${eventTitle}</strong> 일정 조율이 마감됐어요. 결과를 확인해보세요!</p>
        <a href="${resultUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none">최종 결과 보기</a>
      </div>
    `,
  })
}

export async function sendDailySummaryEmail(
  to: string,
  hostName: string,
  eventTitle: string,
  eventId: string,
  responseCount: number
) {
  const resultUrl = `${BASE_URL}/e/${eventId}/result`
  await resend.emails.send({
    from: 'LetsMeet <onboarding@resend.dev>',
    to,
    subject: `[LetsMeet] ${eventTitle} 오늘 응답 현황`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#111">안녕하세요, ${hostName}님 👋</h2>
        <p><strong>${eventTitle}</strong>에 현재 <strong>${responseCount}명</strong>이 응답했어요.</p>
        <a href="${resultUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#111;color:#fff;border-radius:8px;text-decoration:none">결과 확인하기</a>
      </div>
    `,
  })
}