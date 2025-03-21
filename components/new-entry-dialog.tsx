"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { format, isFuture } from "date-fns"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import MoodSelector from "./mood-selector"
import type { MoodEntry } from "@/types/mood"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, AlertCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { MOOD_ICONS, MOOD_LABELS } from "@/constants/mood"

interface NewEntryDialogProps {
  onOpenChange: (open: boolean) => void
  onSave: (entry: MoodEntry) => void
  entries: MoodEntry[]
  selectedEntry?: MoodEntry | null
}

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required",
  }),
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

export default function NewEntryDialog({ onOpenChange, onSave, entries, selectedEntry = null }: NewEntryDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      mood: 3,
      notes: "",
    },
  })

  // Initialize form based on selectedEntry or current date - only run once
  useEffect(() => {
    if (initialized) return

    const today = new Date()

    if (selectedEntry) {
      const entryDate = new Date(selectedEntry.date)
      form.reset({
        date: entryDate,
        mood: selectedEntry.mood,
        notes: selectedEntry.notes || "",
      })
      setIsEditing(true)
    } else {
      // Check if there's an existing entry for today
      const currentEntry = entries.find((entry) => new Date(entry.date).toDateString() === today.toDateString())

      if (currentEntry) {
        form.reset({
          date: today,
          mood: currentEntry.mood,
          notes: currentEntry.notes || "",
        })
        setIsEditing(true)
      } else {
        form.reset({
          date: today,
          mood: 3,
          notes: "",
        })
        setIsEditing(false)
      }
    }

    setInitialized(true)
  }, [selectedEntry, form, entries, initialized])

  // Handle date change from calendar
  const handleDateChange = (date: Date | undefined) => {
    if (!date) return

    form.setValue("date", date)

    // Check if there's an entry for the selected date
    const existingEntry = entries.find((entry) => new Date(entry.date).toDateString() === date.toDateString())

    setIsEditing(!!existingEntry)
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const entry = {
      date: values.date,
      mood: values.mood,
      notes: values.notes || "",
    }

    // Check if this is a new entry or an update
    const dateStr = new Date(entry.date).toDateString()
    const existingEntry = entries.find((e) => new Date(e.date).toDateString() === dateStr)

    const isNewEntry = !existingEntry
    const originalEntry = existingEntry ? { ...existingEntry } : null

    onSave(entry)

    // Show Sonner toast notification
    const formattedDate = format(new Date(entry.date), "MMMM d, yyyy")

    if (isNewEntry) {
      toast.success(`Mood tracked for ${formattedDate}`, {
        description: `You're feeling ${MOOD_LABELS[entry.mood].toLowerCase()}`,
        icon: MOOD_ICONS[entry.mood],
        action: {
          label: "Undo",
          onClick: () => {
            // This will be handled by the parent component
          },
        },
      })
    } else {
      toast.success(`Mood updated for ${formattedDate}`, {
        description: `You're feeling ${MOOD_LABELS[entry.mood].toLowerCase()}`,
        icon: MOOD_ICONS[entry.mood],
        action: {
          label: "Undo",
          onClick: () => {
            // This will be handled by the parent component
          },
        },
      })
    }
  }

  const selectedDate = form.watch("date")
  const formattedDate = selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""
  const dialogTitle = isEditing ? `Edit Mood for ${formattedDate}` : "How are you feeling?"

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        {isEditing && selectedDate && (
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              You're editing an existing entry for {formattedDate}.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel id="date-label">Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          aria-labelledby="date-label"
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" aria-hidden="true" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={handleDateChange}
                        disabled={(date) => isFuture(date)}
                        initialFocus
                        aria-label="Select date"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto">
                {isEditing ? "Update Entry" : "Save Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

