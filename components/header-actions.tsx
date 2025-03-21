"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Database } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import SeedData from "./seed-data"
import NewEntryDialog from "./new-entry-dialog"
import type { MoodEntry } from "@/types/mood"
import { useMood } from "@/contexts/mood-context"
import { toast } from "sonner"

interface HeaderActionsProps {
  initialTab: "analytics" | "history"
}

export function HeaderActions({ initialTab }: HeaderActionsProps) {
  const { moodEntries, setMoodEntries, addOrUpdateEntry } = useMood()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [previousEntries, setPreviousEntries] = useState<MoodEntry[]>([])
  const [forceUpdate, setForceUpdate] = useState(0)

  // Force a re-render when moodEntries changes
  useEffect(() => {
    setForceUpdate((prev) => prev + 1)
  }, [moodEntries])

  const handleSeedData = (seedEntries: MoodEntry[]) => {
    // Store current entries for potential undo
    const currentEntries = [...moodEntries]
    setPreviousEntries(currentEntries)

    // Set new entries
    setMoodEntries(seedEntries)

    // Toast is now handled in the SeedData component
    // We just need to handle the undo action
    toast.success("Sample Data Generated", {
      description: `${seedEntries.length} sample mood entries have been created.`,
      icon: <Database className="h-5 w-5" />,
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          // Direct state restoration
          setMoodEntries([...currentEntries])
          toast.info("Sample data removed", {
            description: "Your previous mood entries have been restored.",
            duration: 3000,
          })
        },
      },
    })
  }

  const handleNewEntry = () => {
    setIsDialogOpen(true)
  }

  const handleSaveEntry = (entry: MoodEntry) => {
    // Save the entry
    addOrUpdateEntry(entry)
    setIsDialogOpen(false)

    // Toast is now handled in the NewEntryDialog component
  }

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
      <SeedData
        onSeedComplete={handleSeedData}
        buttonVariant="outline"
        buttonIcon={<Database className="h-4 w-4 mr-2" aria-hidden="true" />}
        buttonText="Generate Sample Data"
        className="text-xs sm:text-sm"
        key={`seed-data-${forceUpdate}`}
      />
      <Button onClick={handleNewEntry} className="gap-2 text-xs sm:text-sm">
        <PlusCircle className="h-4 w-4" aria-hidden="true" />
        <span>New Entry</span>
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

