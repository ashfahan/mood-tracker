"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import MoodSelector from "@/components/form/mood-selector"
import type { MoodEntry } from "@/types/mood"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { MOOD_ICONS } from "@/constants/mood"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

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
  const isMobile = useMediaQuery("(max-width: 640px)")

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

    // Show toast for new entry or today's entry update
    // We'll handle this here instead of in the parent component
    const today = new Date().toDateString()

    if (isNewEntry) {
      // For new entries
      const toastOptions: any = {
        icon: MOOD_ICONS[entry.mood],
      }

      // Only add description if there's a note
      if (entry.notes) {
        toastOptions.description = entry.notes
      }

      toast.success(`Mood tracked for ${format(new Date(entry.date), "MMMM d, yyyy")}`, toastOptions)
    } else if (dateStr === today) {
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
    // Note: We don't show a toast for updates to past entries here
    // That will be handled by the parent component with undo functionality
  }

  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // If Enter is pressed and not in a textarea (or Ctrl+Enter in textarea)
    if (e.key === "Enter") {
      // Allow normal behavior in textarea (new line) unless Ctrl+Enter is pressed
      if (e.target instanceof HTMLTextAreaElement) {
        if (!e.ctrlKey) {
          return // Allow normal Enter behavior in textarea
        }
      }

      // Prevent default Enter behavior (which might submit the form incorrectly)
      e.preventDefault()

      // Submit the form if it's valid
      if (form.formState.isValid) {
        form.handleSubmit(onSubmit)()
      } else {
        // Trigger validation if form is not valid
        form.trigger()
      }
    }
  }

  const formattedDate = format(entryDate, "MMMM d, yyyy")
  const dialogTitle = isEditing ? `Edit Mood for ${formattedDate}` : "How are you feeling today?"

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent
        className={`sm:max-w-[500px] max-h-[90vh] overflow-y-auto ${isMobile ? "p-4" : "p-6"}`}
        onKeyDown={handleKeyDown}
      >
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel id="mood-label" className="text-sm sm:text-base">
                    Mood Level
                  </FormLabel>
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
                  <FormLabel htmlFor="notes" className="text-sm sm:text-base">
                    Note (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="notes"
                      placeholder="Write a short note about your day..."
                      {...field}
                      value={field.value || ""}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
              <Button type="submit" className={isMobile ? "w-full" : "w-full sm:w-auto"}>
                {isEditing ? "Update Entry" : "Save Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

