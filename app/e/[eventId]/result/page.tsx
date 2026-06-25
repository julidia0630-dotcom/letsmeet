'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Event, Response } from '@/lib/types'
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

export default function ResultPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const router = useRouter()

  const [event, setEvent] = useState<Event | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())

  useEffect(() => {
    const fetchData = async () => {
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (eventData) {
        setEvent(eventData)
        const dates = getDatesBetween(eventData.date_range_start, eventData.date_range_end, eventData.excluded_weekdays)
        setAvailableDates(dates)
        if (dates.length > 0) {
          const first = new Date(dates[0])
          setViewYear(first.getFullYear())
          setViewMonth(first.getMonth())
        }
      }

      const { data: responseData } = await supabase
        .from('responses')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })

      setResponses(responseData ?? [])
      setLoading(false)
    }
    fetchData()
  }, [eventId])

  const changeMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  const total = responses.length
  const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

  const getCount = (date: string) =>
    responses.filter(r => r.available_dates.includes(date)).length

  const bestDates = availableDates.filter(d => total > 0 && getCount(d) === total)

  const getColor = (date: string) => {
    if (total === 0) return { bg: '#f3f4f6', text: '#9ca3af' }
    const count = getCount(date)
    if (count === 0) return { bg: '#fff1f2', text: '#fca5a5', label: '0/' + total }
    if (count === total) return { bg: '#10b981', text: '#ffffff', label: count + '/' + total }
    const ratio = count / total
    if (ratio >= 0.7) return { bg: '#6ee7b7', text: '#065f46', label: count + '/' + total }
    if (ratio >= 0.4) return { bg: '#d1fae5', text: '#065f46', label: count + '/' + total }
    return { bg: '#f0fdf4', text: '#6b7280', label: count + '/' + total }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">LetsMeet</p>
          <h1 className="text-2xl font-medium text-gray-900 mb-1">{event?.title}</h1>
          <p className="text-sm text-gray-400">총 {total}명 응답</p>
          {event?.is_closed && (
            <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">마감됨</span>
          )}
        </div>

        {bestDates.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-4">
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-3">
              🎉 모두 가능한 날짜
            </p>
            <div className="flex flex-wrap gap-2">
              {bestDates.map(d => {
                const dt = new Date(d)
                const days = ['일', '월', '화', '수', '목', '금', '토']
                return (
                  <span key={d} className="px-3 py-2 bg-emerald-500 text-white text-sm rounded-lg font-medium">
                    {dt.getMonth() + 1}월 {dt.getDate()}일 ({days[dt.getDay()]})
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">날짜별 현황</p>
          </div>

          <div className="flex gap-3 mb-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-sm inline-block" style={{background:'#10b981'}}></span>모두 가능
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-sm inline-block" style={{background:'#6ee7b7'}}></span>대부분 가능
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-sm inline-block" style={{background:'#d1fae5'}}></span>일부 가능
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3 h-3 rounded-sm inline-block" style={{background:'#fff1f2'}}></span>불가
            </span>
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
            getColor={getColor}
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
            참여자
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">{total}명</span>
          </p>
          {responses.length === 0 ? (
            <p className="text-sm text-gray-400">아직 응답이 없어요.</p>
          ) : (
            <div className="space-y-3">
              {responses.map(r => {
                const days = ['일', '월', '화', '수', '목', '금', '토']
                return (
                  <div key={r.id} className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {r.available_dates.sort().map(d => {
                          const dt = new Date(d)
                          return `${dt.getMonth() + 1}/${dt.getDate()}(${days[dt.getDay()]})`
                        }).join(', ')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push(`/e/${eventId}`)}
          className="w-full h-10 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          ← 응답 페이지로 돌아가기
        </button>
      </div>
    </main>
  )
}