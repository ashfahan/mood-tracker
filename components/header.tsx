"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Database, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import SeedData from "./seed-data"
import NewEntryDialog from "./new-entry-dialog"
import type { MoodEntry } from "@/types/mood"
import { useMood } from "@/contexts/mood-context"
import { toast } from "sonner"

export function Header() {
  const { moodEntries, setMoodEntries, addOrUpdateEntry } = useMood()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [previousEntries, setPreviousEntries] = useState<MoodEntry[]>([])
  const [forceUpdate, setForceUpdate] = useState(0)
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null)
  const [isUpdatingToday, setIsUpdatingToday] = useState(false)

  // Theme toggle functionality
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark"
    setTheme(newTheme)
  }

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
    // Check if there's already an entry for today
    const today = new Date().toDateString()
    const existingTodayEntry = moodEntries.find((entry) => new Date(entry.date).toDateString() === today)

    if (existingTodayEntry) {
      // Store today's entry and set flag for updating
      setTodayEntry(existingTodayEntry)
      setIsUpdatingToday(true)
    } else {
      // Reset for new entry
      setTodayEntry(null)
      setIsUpdatingToday(false)
    }

    // Open the dialog
    setIsDialogOpen(true)
  }

  const handleSaveEntry = (entry: MoodEntry) => {
    // Save the entry
    addOrUpdateEntry(entry)
    setIsDialogOpen(false)
    setIsUpdatingToday(false)

    // Toast is now handled in the NewEntryDialog component
  }

  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Mood Tracker</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>

      {/* Conditionally render the dialog only when it's open */}
      {isDialogOpen && (
        <NewEntryDialog
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setIsUpdatingToday(false)
          }}
          onSave={handleSaveEntry}
          entries={moodEntries}
          selectedEntry={todayEntry}
          isUpdatingToday={isUpdatingToday}
        />
      )}
    </header>
  )
}

