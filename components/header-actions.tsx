"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Database } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import SeedData from "./seed-data"
import NewEntryDialog from "./new-entry-dialog"
import type { MoodEntry } from "@/types/mood"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface HeaderActionsProps {
  initialTab: "analytics" | "history"
}

export function HeaderActions({ initialTab }: HeaderActionsProps) {
  const [moodEntries, setMoodEntries] = useLocalStorage<MoodEntry[]>("moodEntries", [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSeedData = (seedEntries: MoodEntry[]) => {
    setMoodEntries(seedEntries)
  }

  const handleNewEntry = () => {
    setIsDialogOpen(true)
  }

  const handleSaveEntry = (entry: MoodEntry) => {
    const dateStr = new Date(entry.date).toDateString()

    // Check if an entry already exists for this date
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

    // Close dialog
    setIsDialogOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      {moodEntries.length === 0 && (
        <SeedData
          onSeedComplete={handleSeedData}
          buttonVariant="outline"
          buttonIcon={<Database className="h-4 w-4 mr-2" aria-hidden="true" />}
          buttonText="Generate Sample Data"
        />
      )}
      <Button onClick={handleNewEntry} className="gap-2">
        <PlusCircle className="h-4 w-4" aria-hidden="true" />
        New Entry
      </Button>
      <ThemeToggle />

      {/* Conditionally render the dialog only when it's open */}
      {isDialogOpen && (
        <NewEntryDialog
          onOpenChange={setIsDialogOpen}
          onSave={handleSaveEntry}
          entries={moodEntries}
          selectedEntry={null}
        />
      )}
    </div>
  )
}

