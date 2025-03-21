"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import MoodHistory from "./mood-history"
import MoodAnalytics from "./mood-analytics"
import DeleteConfirmationDialog from "./delete-confirmation-dialog"
import NewEntryDialog from "./new-entry-dialog"
import type { MoodEntry } from "@/types/mood"
import { useMood } from "@/contexts/mood-context"
import { format } from "date-fns"
import { MOOD_ICONS } from "@/constants/mood"
import { toast } from "sonner"

interface MoodTrackerProps {
  initialTab: "analytics" | "history"
}

export default function MoodTracker({ initialTab }: MoodTrackerProps) {
  const { moodEntries, setMoodEntries, addOrUpdateEntry, deleteEntry } = useMood()
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<MoodEntry | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)

  // Force a re-render when moodEntries changes
  useEffect(() => {
    setForceUpdate((prev) => prev + 1)
  }, [moodEntries])

  const handleSaveEntry = (entry: MoodEntry) => {
    // Check if this is a new entry or an update
    const dateStr = new Date(entry.date).toDateString()
    const existingEntry = moodEntries.find((e) => new Date(e.date).toDateString() === dateStr)

    const isNewEntry = !existingEntry
    const originalEntry = existingEntry ? { ...existingEntry } : null

    // Save the entry
    addOrUpdateEntry(entry)
    setIsDialogOpen(false)

    // Toast is now handled in the NewEntryDialog component
    // But we need to handle the undo action here
    if (isNewEntry) {
      // For new entries - no undo action
      toast.success(`Mood tracked for ${format(new Date(entry.date), "MMMM d, yyyy")}`, {
        // No action property for undo
      })
    } else if (originalEntry) {
      // For updates - keep undo action
      toast.success(`Mood updated for ${format(new Date(entry.date), "MMMM d, yyyy")}`, {
        action: {
          label: "Undo",
          onClick: () => {
            // Direct state update instead of using context function
            const updatedEntries = moodEntries.map((e) =>
              new Date(e.date).toDateString() === new Date(originalEntry.date).toDateString()
                ? { ...originalEntry, date: new Date(originalEntry.date) }
                : e,
            )
            setMoodEntries(updatedEntries)
            toast.info("Update reversed")
          },
        },
      })
    }
  }

  const handleDeleteEntry = (entry: MoodEntry) => {
    setEntryToDelete(entry)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteEntry = () => {
    if (!entryToDelete) return

    // Create a deep copy of the entry to be deleted
    const entryToRestore: MoodEntry = {
      date: new Date(entryToDelete.date),
      mood: entryToDelete.mood,
      notes: entryToDelete.notes,
    }

    const formattedDate = format(new Date(entryToDelete.date), "MMMM d, yyyy")

    // Store current entries before deletion
    const currentEntries = [...moodEntries]

    // Delete the entry
    deleteEntry(entryToDelete)
    setIsDeleteDialogOpen(false)
    setEntryToDelete(null)

    // Show Sonner toast for delete with undo functionality
    toast.error(`Entry deleted for ${formattedDate}`, {
      icon: MOOD_ICONS[entryToRestore.mood],
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          // Direct state restoration instead of using context function
          const restoredEntries = [...currentEntries]
          setMoodEntries(restoredEntries)
          toast.success(`Entry restored for ${formattedDate}`, {
            duration: 3000,
          })
        },
      },
    })
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
            <MoodAnalytics entries={moodEntries} key={`analytics-${forceUpdate}`} />
          ) : (
            <MoodHistory
              entries={moodEntries}
              onEntryClick={handleEntryClick}
              onDeleteEntry={handleDeleteEntry}
              key={`history-${forceUpdate}`}
            />
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

