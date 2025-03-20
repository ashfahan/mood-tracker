import type { MoodEntry } from "@/types/mood"
import { format, isWithinInterval, eachDayOfInterval } from "date-fns"
import type { MoodLevel } from "@/constants/mood"

// Calculate average mood from entries
export function calculateAverageMood(entries: MoodEntry[]): string {
  if (entries.length === 0) return "N/A"
  const sum = entries.reduce((acc, entry) => acc + entry.mood, 0)
  return (sum / entries.length).toFixed(1)
}

// Calculate mood distribution
export function calculateMoodDistribution(entries: MoodEntry[]): Record<number, number> {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  entries.forEach((entry) => {
    distribution[entry.mood]++
  })

  return distribution
}

// Find most frequent mood (with preference for better moods when tied)
export function findMostFrequentMood(entries: MoodEntry[]): MoodLevel | null {
  if (entries.length === 0) return null

  const distribution = calculateMoodDistribution(entries)
  let maxCount = 0
  let mostFrequent = 0

  Object.entries(distribution).forEach(([mood, count]) => {
    const moodValue = Number.parseInt(mood)
    if (count > maxCount) {
      maxCount = count
      mostFrequent = moodValue
    } else if (count === maxCount && moodValue > mostFrequent) {
      // If counts are equal, pick the better mood (higher number)
      mostFrequent = moodValue
    }
  })

  return mostFrequent as MoodLevel
}

// Filter entries by date range
export function filterEntriesByDateRange(entries: MoodEntry[], startDate: Date, endDate: Date): MoodEntry[] {
  return entries.filter((entry) =>
    isWithinInterval(new Date(entry.date), {
      start: startDate,
      end: endDate,
    }),
  )
}

// Get all days in a date range
export function getDaysInRange(startDate: Date, endDate: Date): Date[] {
  return eachDayOfInterval({
    start: startDate,
    end: endDate,
  })
}

// Format daily chart data
export function formatDailyChartData(entries: MoodEntry[], daysInRange: Date[]) {
  return daysInRange
    .map((date) => {
      const dateStr = date.toDateString()
      const entry = entries.find((e) => new Date(e.date).toDateString() === dateStr)

      return {
        x: format(date, "MMM dd"),
        y: entry ? entry.mood : null,
        date: date,
      }
    })
    .filter((item) => item.y !== null)
}

// Format weekday chart data
export function formatWeekdayChartData(entries: MoodEntry[]) {
  const weekdayMap = new Map<number, { total: number; count: number; day: string }>()

  // Initialize map for all weekdays (0-6, where 0 is Sunday)
  for (let i = 0; i < 7; i++) {
    weekdayMap.set(i, { total: 0, count: 0, day: format(new Date(2023, 0, i + 1), "EEEE") })
  }

  entries.forEach((entry) => {
    const entryDate = new Date(entry.date)
    const weekday = entryDate.getDay() // 0-6, where 0 is Sunday

    const day = weekdayMap.get(weekday)!
    day.total += entry.mood
    day.count += 1
  })

  // Convert to array and sort by day of week (starting with Monday)
  return Array.from(weekdayMap.entries())
    .map(([dayIndex, { total, count, day }]) => ({
      x: day,
      y: count > 0 ? Number.parseFloat((total / count).toFixed(2)) : null,
      count,
      dayIndex,
    }))
    .sort((a, b) => {
      // Sort days of week starting with Monday (1) through Sunday (0)
      const adjustedA = a.dayIndex === 0 ? 7 : a.dayIndex
      const adjustedB = b.dayIndex === 0 ? 7 : b.dayIndex
      return adjustedA - adjustedB
    })
    .filter((item) => item.y !== null)
}

// Calculate percentage of days tracked
export function calculateDaysTrackedPercentage(entries: MoodEntry[], daysInRange: Date[]): string {
  if (entries.length === 0) return "0"
  return ((entries.length / daysInRange.length) * 100).toFixed(0)
}

