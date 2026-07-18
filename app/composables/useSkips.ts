import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import type { Skip } from '~/types'

export function useSkips() {
  const { data } = useStorage()
  const { db } = useFirebase()
  const { user } = useAuth()

  function skipRef(id: string) {
    return doc(db, 'users', user.value!.uid, 'skips', id)
  }

  function skipHabit(habitId: string, date: string) {
    const already = data.value.skips.find(s => s.habitId === habitId && s.date === date)
    if (already) return
    const skip: Skip = { id: crypto.randomUUID(), habitId, date }
    data.value.skips = [...(data.value.skips ?? []), skip]
    if (user.value) setDoc(skipRef(skip.id), skip)
  }

  function unskipHabit(habitId: string, date: string) {
    const skip = data.value.skips.find(s => s.habitId === habitId && s.date === date)
    data.value.skips = (data.value.skips ?? []).filter(s => !(s.habitId === habitId && s.date === date))
    if (user.value && skip) deleteDoc(skipRef(skip.id))
  }

  function isSkipped(habitId: string, date: string): boolean {
    return (data.value.skips ?? []).some(s => s.habitId === habitId && s.date === date)
  }

  return { skipHabit, unskipHabit, isSkipped }
}

/** Skip allowed when remaining calendar days in the period exceed remaining reps needed. */
export function canSkipPeriodQuota(
  dateStr: string,
  periodEnd: string,
  done: number,
  total: number,
): boolean {
  const remainingReps = total - done
  if (remainingReps <= 0) return false

  const start = new Date(dateStr + 'T12:00:00')
  const end = new Date(periodEnd + 'T12:00:00')
  const remainingDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1

  return remainingDays > remainingReps
}

/** @deprecated Prefer canSkipPeriodQuota */
export function canSkipWeeklyX(dateStr: string, weeklyDone: number, timesPerWeek: number): boolean {
  return canSkipPeriodQuota(dateStr, getWeekEnd(dateStr), weeklyDone, timesPerWeek)
}
