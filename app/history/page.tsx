"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Trash2, Pencil } from "lucide-react"
import DeleteConfirmationDialog from "@/components/dialogs/delete-confirmation-dialog"
import NewEntryDialog from "@/components/dialogs/new-entry-dialog"
import type { MoodEntry } from "@/types/mood"
import { MOOD_ICONS, MOOD_ICONS_SMALL, MOOD_COLORS } from "@/constants/mood"
import { useMood } from "@/contexts/mood-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

// History Card Item Component
interface HistoryCardItemProps {
  entry: MoodEntry
  onEdit: (entry: MoodEntry) => void
  onDelete: (entry: MoodEntry) => void
}

function HistoryCardItem({ entry, onEdit, onDelete }: HistoryCardItemProps) {
  const isMobile = useMediaQuery("(max-width: 640px)")
  const entryDate = new Date(entry.date)
  const formattedDate = format(entryDate, "EEEE, MMMM d, yyyy")
  const moodColor = MOOD_COLORS[entry.mood].split(" ")[0]
  const borderColor = moodColor.replace("bg-", "border-")

  return (
    <Card className={cn("overflow-hidden border", "border-l-[6px]", borderColor, "sm:flex sm:justify-between")}>
      <CardHeader className="px-4 sm:px-5 py-3 sm:py-4">
        <div className="flex items-center gap-2">
          {MOOD_ICONS_SMALL[entry.mood]}
          <div className="flex flex-col">
            <span className="font-medium text-base">{format(entryDate, "EEEE")}</span>
            <span className="text-sm text-muted-foreground">{format(entryDate, "MMMM d, yyyy")}</span>
          </div>
        </div>

        {entry.notes && (
          <div className="mt-3 text-sm text-foreground/80" aria-label={`Notes for ${formattedDate}`}>
            <p className="whitespace-pre-wrap text-left leading-relaxed">{entry.notes}</p>
          </div>
        )}
      </CardHeader>

      <CardFooter className="px-4 sm:px-5 py-3 sm:py-4 pt-0">
        <div className={isMobile ? "grid grid-cols-2 gap-2 w-full" : "flex justify-end gap-2 w-full"}>
          <Button
            variant="outline"
            size="sm"
            className={`h-9 gap-1.5 text-primary border-primary/20 ${isMobile ? "w-full" : ""}`}
            onClick={() => onEdit(entry)}
            aria-label={`Edit entry for ${formattedDate}`}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-xs sm:text-sm">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`h-9 gap-1.5 text-destructive border-destructive/20 ${isMobile ? "w-full" : ""}`}
            onClick={() => onDelete(entry)}
            aria-label={`Delete entry for ${formattedDate}`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-xs sm:text-sm">Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function HistoryPage() {
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
    const today = new Date().toDateString()
    const isToday = dateStr === today

    // Save the entry
    addOrUpdateEntry(entry)
    setIsDialogOpen(false)

    // Only show toast for updates to past entries (not today's entry and not new entries)
    // New entries and today's updates are handled in the NewEntryDialog component
    if (!isNewEntry && !isToday && originalEntry) {
      // For updates to past entries - keep undo action with previous design
      const toastOptions: Record<string, unknown> = {
        icon: MOOD_ICONS[entry.mood],
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

            // Dismiss the toast without showing a new one
            toast.dismiss(toastId)
          },
        },
      }

      // Only add description if there's a note
      if (entry.notes) {
        toastOptions.description = entry.notes
      }

      const toastId = toast.success(`Mood updated for ${format(new Date(entry.date), "MMMM d, yyyy")}`, toastOptions)
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
    const toastId = toast.error(`Entry deleted for ${formattedDate}`, {
      icon: MOOD_ICONS[entryToRestore.mood],
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          // Direct state restoration instead of using context function
          const restoredEntries = [...currentEntries]
          setMoodEntries(restoredEntries)

          // Dismiss the toast without showing a new one
          toast.dismiss(toastId)
        },
      },
    })
  }

  const handleEntryClick = (entry: MoodEntry) => {
    setSelectedEntry(entry)
    setIsDialogOpen(true)
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...moodEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Group entries by month
  const groupedEntries: Record<string, MoodEntry[]> = {}

  sortedEntries.forEach((entry) => {
    const monthYear = format(new Date(entry.date), "MMMM yyyy")
    if (!groupedEntries[monthYear]) {
      groupedEntries[monthYear] = []
    }
    groupedEntries[monthYear].push(entry)
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <section aria-label="Mood history">
            {Object.keys(groupedEntries).length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
                <h3 className="text-lg font-medium mb-2">No entries yet</h3>
                <p className="text-muted-foreground">Start tracking your mood by adding an entry.</p>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
                  <div key={monthYear} className="space-y-4 sm:space-y-5">
                    <h3 className="text-base sm:text-lg font-medium sticky top-0 bg-background py-2 sm:py-3 z-10 border-b">
                      {monthYear}
                    </h3>
                    <div className="space-y-3 sm:space-y-5">
                      {monthEntries.map((entry, index) => (
                        <HistoryCardItem
                          key={index}
                          entry={entry}
                          onEdit={handleEntryClick}
                          onDelete={handleDeleteEntry}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
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

