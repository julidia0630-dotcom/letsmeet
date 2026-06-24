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

export default function EditPage() {
  const { editToken } = useParams<{ editToken: string }>()
  const router = useRouter()

  const [response, setResponse] = useState<Response | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())

  useEffect(() => {
    const fetchData = async () => {
      const { data: responseData } = await supabase
        .from('responses')
        .select('*')
        .eq('edit_token', editToken)
        .single()

      if (!responseData) {
        setError('응답을 찾을 수 없어요.')
        setLoading(false)
        return
      }

      setResponse(responseData)
      setSelectedDates(responseData.available_dates)

      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', responseData.event_id)
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

      setLoading(false)
    }
    fetchData()
  }, [editToken])

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

  const handleSave = async () => {
    if (selectedDates.length === 0) {
      setError('가능한 날짜를 하나 이상 선택해주세요.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/responses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edit_token: editToken, available_dates: selectedDates }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess('응답이 수정됐어요!')
      setTimeout(() => router.push(`/e/${event?.id}/result`), 1500)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('응답을 삭제할까요?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/responses?edit_token=${editToken}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.push(`/e/${event?.id}`)
    } catch {
      setError('삭제에 실패했어요.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">불러오는 중...</p>
    </main>
  )

  if (error && !response) return (
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
          <p className="text-sm text-gray-400">{response?.name}님의 응답 수정</p>
        </div>

        {event?.is_closed ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-gray-400 mb-4">마감된 이벤트라 수정할 수 없어요.</p>
            <button
              onClick={() => router.push(`/e/${event.id}/result`)}
              className="h-10 px-6 bg-gray-900 text-white rounded-xl text-sm"
            >
              결과 보기 →
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">가능한 날짜 수정</p>
                <span className="text-xs text-gray-400">{selectedDates.length}일 선택됨</span>
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
            {success && <p className="text-emerald-500 text-sm mb-4">{success}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 mb-3"
            >
              {saving ? '저장 중...' : '수정 저장하기 →'}
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full h-10 border border-red-200 text-red-400 rounded-xl text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deleting ? '삭제 중...' : '응답 삭제하기'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}