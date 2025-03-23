"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import MoodSelector from "./mood-selector"
import type { MoodEntry } from "@/types/mood"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { MOOD_ICONS } from "@/constants/mood"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface NewEntryDialogProps {
  onOpenChange: (open: boolean) => void
  onSave: (entry: MoodEntry) => void
  entries: MoodEntry[]
  selectedEntry?: MoodEntry | null
  isUpdatingToday?: boolean
}

const formSchema = z.object({
  mood: z
    .number({
      required_error: "Please select a mood",
    })
    .min(1)
    .max(5),
  notes: z
    .string()
    .max(500, {
      message: "Note must not exceed 500 characters",
    })
    .optional(),
})

export default function NewEntryDialog({
  onOpenChange,
  onSave,
  entries,
  selectedEntry = null,
  isUpdatingToday = false,
}: NewEntryDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [originalEntry, setOriginalEntry] = useState<MoodEntry | null>(null)
  const [entryDate, setEntryDate] = useState<Date>(new Date())

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: undefined,
      notes: "",
    },
    mode: "onChange", // Validate on change to show errors immediately
  })

  // Initialize form based on selectedEntry or current date - only run once
  useEffect(() => {
    if (initialized) return

    const today = new Date()

    if (selectedEntry) {
      // If we're editing a specific entry
      const selectedEntryDate = new Date(selectedEntry.date)
      setEntryDate(selectedEntryDate)
      form.reset({
        mood: selectedEntry.mood,
        notes: selectedEntry.notes || "",
      })
      setOriginalEntry(selectedEntry)
      setIsEditing(true)
    } else {
      // Check if there's an existing entry for today
      const currentEntry = entries.find((entry) => new Date(entry.date).toDateString() === today.toDateString())

      if (currentEntry) {
        setEntryDate(today)
        form.reset({
          mood: currentEntry.mood,
          notes: currentEntry.notes || "",
        })
        setOriginalEntry(currentEntry)
        setIsEditing(true)
      } else {
        setEntryDate(today)
        form.reset({
          mood: undefined,
          notes: "",
        })
        setIsEditing(false)
      }
    }

    setInitialized(true)
  }, [selectedEntry, form, entries, initialized])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const entry = {
      date: entryDate,
      mood: values.mood,
      notes: values.notes || "",
    }

    // Check if this is a new entry or an update
    const dateStr = new Date(entry.date).toDateString()
    const existingEntry = entries.find((e) => new Date(e.date).toDateString() === dateStr)
    const isNewEntry = !existingEntry

    // Call the onSave callback
    onSave(entry)

    // Show toast for today's entry update
    const today = new Date().toDateString()
    if (dateStr === today && !isNewEntry) {
      // For updates to today's entry - show toast with note if available
      const toastOptions: any = {
        icon: MOOD_ICONS[entry.mood],
      }

      // Only add description if there's a note
      if (entry.notes) {
        toastOptions.description = entry.notes
      }

      toast.success(`Mood updated for ${format(new Date(entry.date), "MMMM d, yyyy")}`, toastOptions)
    }
  }

  // Custom submit handler to trigger validation
  const handleSubmit = () => {
    form.handleSubmit(onSubmit)()
  }

  const formattedDate = format(entryDate, "MMMM d, yyyy")
  const dialogTitle = isEditing ? `Edit Mood for ${formattedDate}` : "How are you feeling today?"

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        {/* Alert for updating today's entry */}
        {isUpdatingToday && (
          <Alert variant="warning" className="mt-2 mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Entry Already Exists</AlertTitle>
            <AlertDescription>
              You already have a mood entry for today. You're updating your existing entry.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                // Only submit if Enter is pressed without Shift (to allow multiline in textarea)
                if (e.target instanceof HTMLTextAreaElement) {
                  // Don't submit when pressing Enter in a textarea unless Ctrl+Enter is pressed
                  if (!e.ctrlKey) return
                }
                e.preventDefault()
                handleSubmit()
              }
            }}
          >
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel id="mood-label">Mood Level</FormLabel>
                  <FormControl>
                    <MoodSelector
                      selectedMood={field.value}
                      onSelectMood={(mood) => field.onChange(mood)}
                      aria-labelledby="mood-label"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="notes">Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      id="notes"
                      placeholder="Write a short note about your day... (Press Enter to submit, Shift+Enter for new line)"
                      {...field}
                      value={field.value || ""}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" onClick={handleSubmit} className="w-full sm:w-auto">
                {isEditing ? "Update Entry" : "Save Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

