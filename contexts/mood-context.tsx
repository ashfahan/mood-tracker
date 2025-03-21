"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { MoodEntry } from "@/types/mood"

interface MoodContextType {
  moodEntries: MoodEntry[]
  setMoodEntries: (entries: MoodEntry[]) => void
  addOrUpdateEntry: (entry: MoodEntry) => void
  deleteEntry: (entry: MoodEntry) => void
}

const MoodContext = createContext<MoodContextType | undefined>(undefined)

export function MoodProvider({ children }: { children: ReactNode }) {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load mood entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("moodEntries")
    if (savedEntries) {
      try {
        const parsedEntries = JSON.parse(savedEntries)
        // Convert string dates back to Date objects
        const entriesWithDates = parsedEntries.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
        }))
        setMoodEntries(entriesWithDates)
      } catch (error) {
        console.error("Failed to parse mood entries:", error)
      }
    }
    setIsInitialized(true)
  }, [])

  // Save mood entries to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("moodEntries", JSON.stringify(moodEntries))
    }
  }, [moodEntries, isInitialized])

  // Add or update an entry
  const addOrUpdateEntry = (entry: MoodEntry) => {
    const dateStr = new Date(entry.date).toDateString()
    const existingEntryIndex = moodEntries.findIndex((e) => new Date(e.date).toDateString() === dateStr)

    if (existingEntryIndex >= 0) {
      // Update existing entry
      const updatedEntries = [...moodEntries]
      updatedEntries[existingEntryIndex] = entry
      setMoodEntries(updatedEntries)
    } else {
      // Add new entry
      setMoodEntries([...moodEntries, entry])
    }
  }

  // Delete an entry
  const deleteEntry = (entry: MoodEntry) => {
    const updatedEntries = moodEntries.filter(
      (e) => new Date(e.date).toDateString() !== new Date(entry.date).toDateString(),
    )
    setMoodEntries(updatedEntries)
  }

  return (
    <MoodContext.Provider value={{ moodEntries, setMoodEntries, addOrUpdateEntry, deleteEntry }}>
      {children}
    </MoodContext.Provider>
  )
}

export function useMood() {
  const context = useContext(MoodContext)
  if (context === undefined) {
    throw new Error("useMood must be used within a MoodProvider")
  }
  return context
}

