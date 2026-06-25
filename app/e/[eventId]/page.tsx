'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Event } from '@/lib/types'
import Calendar from '@/components/Calendar'

function getDatesBetween(start: string, end: string, excluded: number[]): string[] {
  const dates: string[] = []
  const cur = new Date(start)
  const endDate = new Date(end)
  while (cur <= endDate) {
    if (!excluded.includes(cur.getDay())) {
      dates.push(cur.toISOString().slice(0, 10))
    }
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

export default function EventPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const router = useRouter()

  const [event, setEvent] = useState<Event | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [shareMsg, setShareMsg] = useState('')
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()
      if (error || !data) {
        setError('이벤트를 찾을 수 없어요.')
      } else {
        setEvent(data)
        const dates = getDatesBetween(data.date_range_start, data.date_range_end, data.excluded_weekdays)
        setAvailableDates(dates)
        if (dates.length > 0) {
          const first = new Date(dates[0])
          setViewYear(first.getFullYear())
          setViewMonth(first.getMonth())
        }
      }
      setLoading(false)
    }
    fetchEvent()
  }, [eventId])

  const toggleDate = (date: string) => {
    setSelectedDates(prev =>
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    )
  }

  const changeMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setShareMsg('링크가 복사됐어요!')
    setTimeout(() => setShareMsg(''), 2000)
  }

  const handleSubmit = async () => {
    if (!name || !email || selectedDates.length === 0) {
      setError('이름, 이메일, 가능한 날짜를 모두 입력해주세요.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, name, email, available_dates: selectedDates }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/e/${eventId}/result`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  if (error && !event) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">{error}</p>
    </main>
  )

  const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">LetsMeet</p>
          <h1 className="text-2xl font-medium text-gray-900 mb-1">{event?.title}</h1>
          <p className="text-sm text-gray-400">{event?.host_name}님이 만든 일정 조율</p>
          {event?.deadline && (
            <p className="text-sm text-orange-500 mt-1">
              마감 {new Date(event.deadline).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          {event?.is_closed && (
            <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">마감됨</span>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">내 정보</p>
          <div className="space-y-3">
            <input
              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
              placeholder="이름 *"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={event?.is_closed}
            />
            <input
              type="email"
              className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
              placeholder="이메일 * (응답 수정 링크를 보내드려요)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={event?.is_closed}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">가능한 날짜 선택</p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
            >
              ‹
            </button>
            <span className="text-sm font-medium text-gray-700">
              {viewYear}년 {MONTHS[viewMonth]}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
            >
              ›
            </button>
          </div>

          <Calendar
            year={viewYear}
            month={viewMonth}
            availableDates={availableDates}
            selectedDates={selectedDates}
            onToggle={toggleDate}
            disabled={event?.is_closed}
          />

          {selectedDates.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">선택된 날짜</p>
              <div className="flex flex-wrap gap-1.5">
                {[...selectedDates].sort().map(d => {
                  const dt = new Date(d)
                  const days = ['일', '월', '화', '수', '목', '금', '토']
                  return (
                    <span key={d} className="px-2 py-1 bg-gray-900 text-white text-xs rounded-lg">
                      {dt.getMonth() + 1}/{dt.getDate()} ({days[dt.getDay()]})
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {!event?.is_closed && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-12 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 mb-3"
          >
            {submitting ? '제출 중...' : '응답 제출하기 →'}
          </button>
        )}

        <button
          onClick={copyLink}
          className="w-full h-10 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors mb-2"
        >
          {shareMsg || '링크 복사해서 공유하기'}
        </button>

        <button
          onClick={() => router.push(`/e/${eventId}/result`)}
          className="w-full h-10 text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          결과 보기 →
        </button>
      </div>
    </main>
  )
}