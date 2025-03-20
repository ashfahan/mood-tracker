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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      mood: 3,
      notes: "",
    },
  })

  // Initialize form based on selectedEntry
  useEffect(() => {
    if (selectedEntry) {
      const entryDate = new Date(selectedEntry.date)
      form.reset({
        date: entryDate,
        mood: selectedEntry.mood,
        notes: selectedEntry.notes || "",
      })
      setSelectedDate(entryDate)
      setIsEditing(true)
    } else {
      const today = new Date()

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

      setSelectedDate(today)
    }
  }, [selectedEntry, form, entries])

  // Handle date change from calendar
  const handleDateChange = (date: Date | undefined) => {
    if (!date) return

    setSelectedDate(date)
    form.setValue("date", date)

    // Check if there's an entry for the selected date
    const existingEntry = entries.find((entry) => new Date(entry.date).toDateString() === date.toDateString())

    if (existingEntry) {
      form.setValue("mood", existingEntry.mood)
      form.setValue("notes", existingEntry.notes || "")
      setIsEditing(true)
    } else {
      form.setValue("mood", 3)
      form.setValue("notes", "")
      setIsEditing(false)
    }
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave({
      date: values.date,
      mood: values.mood,
      notes: values.notes || "",
    })
  }

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>How are you feeling?</DialogTitle>
        </DialogHeader>

        {isEditing && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              You're editing an existing entry for {format(selectedDate, "MMMM d, yyyy")}.
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
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                  <FormLabel>Mood Level</FormLabel>
                  <FormControl>
                    <MoodSelector selectedMood={field.value} onSelectMood={(mood) => field.onChange(mood)} />
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
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
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
              <Button type="submit">{isEditing ? "Update Entry" : "Save Entry"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

