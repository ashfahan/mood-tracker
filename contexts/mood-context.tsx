"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { MoodEntry } from "@/types/mood"

interface MoodContextType {
  moodEntries: MoodEntry[]
  setMoodEntries: (entries: MoodEntry[]) => void
  addOrUpdateEntry: (entry: MoodEntry) => void
  deleteEntry: (entry: MoodEntry) => void
  undoDelete: (entry: MoodEntry) => void
  undoUpdate: (originalEntry: MoodEntry) => void
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
      updatedEntries[existingEntryIndex] = {
        ...entry,
        date: new Date(entry.date), // Ensure date is a Date object
      }
      setMoodEntries(updatedEntries)
    } else {
      // Add new entry
      setMoodEntries([
        ...moodEntries,
        {
          ...entry,
          date: new Date(entry.date), // Ensure date is a Date object
        },
      ])
    }
  }

  // Delete an entry
  const deleteEntry = (entry: MoodEntry) => {
    const dateStr = new Date(entry.date).toDateString()
    const updatedEntries = moodEntries.filter((e) => new Date(e.date).toDateString() !== dateStr)
    setMoodEntries(updatedEntries)
  }

  // Undo delete - restore a deleted entry
  const undoDelete = (entry: MoodEntry) => {
    // Create a completely new entry object with a proper Date object
    const restoredEntry: MoodEntry = {
      date: new Date(entry.date),
      mood: entry.mood,
      notes: entry.notes,
    }

    // Check if an entry for this date already exists
    const dateStr = restoredEntry.date.toDateString()
    const exists = moodEntries.some((e) => new Date(e.date).toDateString() === dateStr)

    if (!exists) {
      // Create a completely new array to ensure React detects the change
      const newEntries = [...moodEntries, restoredEntry]

      // Sort entries by date (newest first) to maintain consistent order
      newEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Update state with the new array
      setMoodEntries(newEntries)
    }
  }

  // Undo update - restore the original entry
  const undoUpdate = (originalEntry: MoodEntry) => {
    // Create a completely new entry object with a proper Date object
    const restoredEntry: MoodEntry = {
      date: new Date(originalEntry.date),
      mood: originalEntry.mood,
      notes: originalEntry.notes,
    }

    const dateStr = restoredEntry.date.toDateString()
    const existingEntryIndex = moodEntries.findIndex((e) => new Date(e.date).toDateString() === dateStr)

    if (existingEntryIndex >= 0) {
      // Create a completely new array to ensure React detects the change
      const updatedEntries = [...moodEntries]
      updatedEntries[existingEntryIndex] = restoredEntry

      // Update state with the new array
      setMoodEntries(updatedEntries)
    }
  }

  return (
    <MoodContext.Provider
      value={{
        moodEntries,
        setMoodEntries,
        addOrUpdateEntry,
        deleteEntry,
        undoDelete,
        undoUpdate,
      }}
    >
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

