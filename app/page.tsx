'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

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

export default function Home() {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)
  const threeMonths = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const [title, setTitle] = useState('')
  const [hostName, setHostName] = useState('')
  const [hostEmail, setHostEmail] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(threeMonths)
  const [excludedWeekdays, setExcludedWeekdays] = useState<number[]>([])
  const [selectionMode, setSelectionMode] = useState<'range' | 'individual'>('range')
  const [deadline, setDeadline] = useState('')
  const [notifyMode, setNotifyMode] = useState<'instant' | 'daily' | 'deadline'>('instant')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleWeekday = (day: number) => {
    setExcludedWeekdays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const previewDates = getDatesBetween(startDate, endDate, excludedWeekdays)

  const handleSubmit = async () => {
    if (!title || !hostName || !hostEmail || !startDate || !endDate) {
      setError('모든 필수 항목을 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          host_name: hostName,
          host_email: hostEmail,
          date_range_start: startDate,
          date_range_end: endDate,
          excluded_weekdays: excludedWeekdays,
          selection_mode: selectionMode,
          deadline: deadline || null,
          notify_mode: notifyMode,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/e/${data.event.id}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50">

      {/* 히어로 섹션 */}
      <div className="relative h-[450px] w-full overflow-hidden">
        <Image
          src="/hero.jpg"
          alt="비행기 창문 너머 노을"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-stone-50/100" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-white/70 text-sm font-medium tracking-widest uppercase mb-3">LetsMeet</p>
          <h1 className="text-white text-4xl font-semibold mb-3 drop-shadow-sm">
            같이 떠날 날짜를 찾아요
          </h1>
          <p className="text-white/80 text-base">
            가능한 날짜를 모아 모두에게 맞는 여행 일정을 찾아드려요.
          </p>
        </div>
      </div>

      {/* 폼 섹션 */}
      <div className="max-w-lg mx-auto px-4 -mt-0 pb-16">

        {/* 이벤트 정보 */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-4">
          <p className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-4">여행 정보</p>
          <div className="space-y-3">
            <input
              className="w-full h-11 px-4 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-300 bg-stone-50 placeholder:text-stone-300 transition-colors"
              placeholder="여행 이름 *  (예: 제주도 여름 여행)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <div className="flex gap-3">
              <input
                className="flex-1 h-11 px-4 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-300 bg-stone-50 placeholder:text-stone-300 transition-colors"
                placeholder="주최자 이름 *"
                value={hostName}
                onChange={e => setHostName(e.target.value)}
              />
              <input
                type="email"
                className="flex-1 h-11 px-4 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-300 bg-stone-50 placeholder:text-stone-300 transition-colors"
                placeholder="이메일 *"
                value={hostEmail}
                onChange={e => setHostEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 기간 설정 */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-3">
          <p className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-4">조율 기간</p>
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <p className="text-xs text-stone-400 mb-1.5">시작 날짜</p>
              <input
                type="date"
                className="w-full h-11 px-4 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-300 bg-stone-50 transition-colors"
                value={startDate}
                min={today}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex items-end pb-2.5 text-stone-300">→</div>
            <div className="flex-1">
              <p className="text-xs text-stone-400 mb-1.5">마지막 날짜</p>
              <input
                type="date"
                className="w-full h-11 px-4 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-300 bg-stone-50 transition-colors"
                value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs text-stone-400 mb-2">제외할 요일</p>
            <div className="flex gap-2">
              {WEEKDAYS.map((day, i) => (
                <button
                  key={i}
                  onClick={() => toggleWeekday(i)}
                  className={`flex-1 h-9 rounded-lg text-xs font-medium transition-colors ${
                    excludedWeekdays.includes(i)
                      ? 'bg-stone-800 text-white'
                      : i === 0
                      ? 'bg-red-50 text-red-300 hover:bg-red-100'
                      : i === 6
                      ? 'bg-blue-50 text-blue-300 hover:bg-blue-100'
                      : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          
        </div>

        {/* 설정 */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-4">
          <p className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-4">설정</p>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-stone-400 mb-1.5">응답 마감일 <span className="text-stone-300">(선택)</span></p>
              <input
                type="datetime-local"
                className="w-full h-11 px-4 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-orange-300 bg-stone-50 transition-colors"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-2">알림 방식</p>
              <div className="space-y-2">
                {[
                  { value: 'instant', label: '즉시 알림', desc: '새 응답마다 바로 알려드려요' },
                  { value: 'daily', label: '하루 한 번', desc: '매일 자정에 현황을 알려드려요' },
                  { value: 'deadline', label: '마감일에 한 번', desc: '마감 후 최종 결과를 알려드려요' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setNotifyMode(opt.value as any)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                      notifyMode === opt.value
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-stone-100 bg-stone-50 hover:border-stone-200'
                    }`}
                  >
                    <span className={`font-medium ${notifyMode === opt.value ? 'text-orange-500' : 'text-stone-600'}`}>
                      {opt.label}
                    </span>
                    <span className="text-stone-400 text-xs ml-2">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm mb-4 px-1">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-13 py-3.5 bg-stone-800 text-white rounded-2xl font-medium text-sm hover:bg-stone-700 transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? '생성 중...' : '일정 조율 시작하기 →'}
        </button>

        <p className="text-center text-xs text-stone-300 mt-4">
          Photo by Sasha Freemind on Unsplash
        </p>
      </div>
    </main>
  )
}