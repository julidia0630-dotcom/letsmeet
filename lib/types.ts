export type SelectionMode = 'range' | 'individual'
export type NotifyMode = 'instant' | 'daily' | 'deadline'

export interface Event {
  id: string
  title: string
  host_name: string
  host_email: string
  date_range_start: string
  date_range_end: string
  excluded_weekdays: number[]
  selection_mode: SelectionMode
  deadline: string | null
  notify_mode: NotifyMode
  is_closed: boolean
  created_at: string
}

export interface Response {
  id: string
  event_id: string
  name: string
  email: string
  available_dates: string[]
  edit_token: string
  created_at: string
  updated_at: string
}