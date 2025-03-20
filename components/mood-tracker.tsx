"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import MoodHistory from "./mood-history"
import MoodAnalytics from "./mood-analytics"
import DeleteConfirmationDialog from "./delete-confirmation-dialog"
import NewEntryDialog from "./new-entry-dialog"
import type { MoodEntry } from "@/types/mood"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface MoodTrackerProps {
  initialTab: "analytics" | "history"
}

export default function MoodTracker({ initialTab }: MoodTrackerProps) {
  const [moodEntries, setMoodEntries] = useLocalStorage<MoodEntry[]>("moodEntries", [])
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<MoodEntry | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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

  const handleDeleteEntry = (entry: MoodEntry) => {
    setEntryToDelete(entry)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteEntry = () => {
    if (!entryToDelete) return

    // Filter out the entry to delete
    const updatedEntries = moodEntries.filter(
      (entry) => new Date(entry.date).toDateString() !== new Date(entryToDelete.date).toDateString(),
    )

    setMoodEntries(updatedEntries)
    setIsDeleteDialogOpen(false)
    setEntryToDelete(null)
  }

  const handleEntryClick = (entry: MoodEntry) => {
    setSelectedEntry(entry)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          {initialTab === "analytics" ? (
            <MoodAnalytics entries={moodEntries} />
          ) : (
            <MoodHistory entries={moodEntries} onEntryClick={handleEntryClick} onDeleteEntry={handleDeleteEntry} />
          )}
        </CardContent>
      </Card>

      {/* Conditionally render the dialog only when it's open */}
      {isDialogOpen && (
        <NewEntryDialog
          onOpenChange={setIsDialogOpen}
          onSave={handleSaveEntry}
          entries={moodEntries}
          selectedEntry={selectedEntry}
        />
      )}

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        entry={entryToDelete}
        onConfirm={confirmDeleteEntry}
      />
    </div>
  )
}

