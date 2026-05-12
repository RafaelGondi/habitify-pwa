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

export function canSkipWeeklyX(dateStr: string, weeklyDone: number, timesPerWeek: number): boolean {
  const remainingReps = timesPerWeek - weeklyDone
  if (remainingReps <= 0) return false

  const date = new Date(dateStr + 'T12:00:00')
  const dow = date.getDay()
  const daysToSunday = dow === 0 ? 0 : 7 - dow
  const remainingDays = daysToSunday + 1

  return remainingDays > remainingReps
}
