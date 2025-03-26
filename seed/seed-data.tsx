"use client"

import { Button } from "@/components/ui/button"
import type { MoodEntry } from "@/types/mood"
import { subDays } from "date-fns"
import { useState, type ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface SeedDataProps {
  onSeedComplete: (entries: MoodEntry[]) => void
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  buttonIcon?: ReactNode
  buttonText?: string
  className?: string
}

export default function SeedData({
  onSeedComplete,
  buttonVariant = "default",
  buttonIcon,
  buttonText = "Generate 30 Days of Sample Data",
  className = "",
}: SeedDataProps) {
  const [isSeeding, setIsSeeding] = useState(false)

  const generateSeedData = () => {
    setIsSeeding(true)

    // Create a unique ID for the loading toast so we can dismiss it later
    const loadingToastId = toast.loading("Generating sample data...", {
      description: "Please wait while we create sample mood entries",
    })

    // Generate 30 days of data
    const entries: MoodEntry[] = []
    const today = new Date()
    const todayString = today.toDateString()

    // Create a pattern with some randomness
    // Start with a baseline mood
    let baselineMood = Math.floor(Math.random() * 3) + 2 // 2-4

    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i)

      // Skip the current date
      if (date.toDateString() === todayString) {
        continue
      }

      // Skip some random days (about 20% of days)
      if (Math.random() > 0.8) {
        continue
      }

      // Every 7-10 days, shift the baseline mood
      if (i % (7 + Math.floor(Math.random() * 3)) === 0) {
        // Shift baseline by -1, 0, or 1
        const shift = Math.floor(Math.random() * 3) - 1
        baselineMood = Math.max(1, Math.min(5, baselineMood + shift))
      }

      // Generate a mood that's within +/-1 of the baseline
      let mood = baselineMood + Math.floor(Math.random() * 3) - 1
      mood = Math.max(1, Math.min(5, mood))

      // Generate a note (only for about 60% of entries)
      let notes = ""
      if (Math.random() > 0.4) {
        const noteOptions = [
          "Today was a typical day. Nothing special happened.",
          "Had a good conversation with a friend today.",
          "Feeling a bit stressed about upcoming deadlines.",
          "Enjoyed some time outdoors today.",
          "Didn't sleep well last night, feeling tired.",
          "Made progress on a personal project today.",
          "Had a productive day at work.",
          "Spent time with family today.",
          "Tried a new recipe for dinner.",
          "Watched a good movie tonight.",
          "Feeling motivated to tackle challenges.",
          "Had a minor setback today, but staying positive.",
          "Took some time for self-care today.",
          "Feeling grateful for the small things.",
          "Weather was nice today, improved my mood.",
        ]

        notes = noteOptions[Math.floor(Math.random() * noteOptions.length)]

        // Sometimes add a second sentence
        if (Math.random() > 0.7) {
          const secondSentences = [
            "Looking forward to tomorrow.",
            "Hope tomorrow is better.",
            "Need to focus more on self-care.",
            "Going to try to get more sleep tonight.",
            "Planning to be more productive tomorrow.",
          ]
          notes += " " + secondSentences[Math.floor(Math.random() * secondSentences.length)]
        }
      }

      entries.push({
        date,
        mood,
        notes,
      })
    }

    // Sort by date (newest first)
    entries.sort((a, b) => b.date.getTime() - a.date.getTime())

    // Simulate a delay for better UX
    setTimeout(() => {
      onSeedComplete(entries)
      setIsSeeding(false)

      // Dismiss the loading toast
      toast.dismiss(loadingToastId)

      // We don't need to show a success toast here as it will be handled by the parent component
    }, 1000)
  }

  return (
    <Button
      variant={buttonVariant}
      onClick={generateSeedData}
      disabled={isSeeding}
      size="sm"
      className={`whitespace-nowrap ${className}`}
      aria-label="Generate sample mood data"
    >
      {isSeeding ? (
        <>
          <Loader2 className="mr-1 sm:mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="truncate">Generating...</span>
          <span className="sr-only">Please wait while sample data is being generated</span>
        </>
      ) : (
        <>
          {buttonIcon && <span aria-hidden="true">{buttonIcon}</span>}
          <span className="truncate">{buttonText}</span>
        </>
      )}
    </Button>
  )
}
