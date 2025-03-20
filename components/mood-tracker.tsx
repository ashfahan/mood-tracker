"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Database } from "lucide-react"
import MoodHistory from "./mood-history"
import MoodAnalytics from "./mood-analytics"
import NewEntryDialog from "./new-entry-dialog"
import DeleteConfirmationDialog from "./delete-confirmation-dialog"
import SeedData from "./seed-data"
import type { MoodEntry } from "@/types/mood"

export default function MoodTracker() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("analytics") // Changed default to analytics
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null)
  const [entryToDelete, setEntryToDelete] = useState<MoodEntry | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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
  }, [])

  // Save mood entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("moodEntries", JSON.stringify(moodEntries))
  }, [moodEntries])

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

  const handleSeedData = (seedEntries: MoodEntry[]) => {
    setMoodEntries(seedEntries)
  }

  const handleEntryClick = (entry: MoodEntry) => {
    setSelectedEntry(entry)
    setIsDialogOpen(true)
  }

  // Function to open dialog for a new entry
  const handleNewEntry = () => {
    setSelectedEntry(null) // Ensure no entry is selected
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="analytics">Analytics</TabsTrigger> {/* Reordered tabs */}
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              {moodEntries.length === 0 && (
                <SeedData
                  onSeedComplete={handleSeedData}
                  buttonVariant="outline"
                  buttonIcon={<Database className="h-4 w-4 mr-2" />}
                  buttonText="Generate Sample Data"
                />
              )}
              <Button onClick={handleNewEntry} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                New Entry
              </Button>
            </div>
          </div>

          <TabsContent value="analytics" className="mt-0">
            <Card>
              <CardContent className="pt-6">
                <MoodAnalytics entries={moodEntries} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Card>
              <CardContent className="pt-6">
                <MoodHistory entries={moodEntries} onEntryClick={handleEntryClick} onDeleteEntry={handleDeleteEntry} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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

