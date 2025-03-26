import { HeartCrack, Frown, Meh, Smile, Laugh } from "lucide-react"

// Mood levels
export const MOOD_LEVELS = [1, 2, 3, 4, 5] as const
export type MoodLevel = (typeof MOOD_LEVELS)[number]

// Mood icons
export const MOOD_ICONS = {
  1: <HeartCrack className="h-6 w-6 text-current" />,
  2: <Frown className="h-6 w-6 text-current" />,
  3: <Meh className="h-6 w-6 text-current" />,
  4: <Smile className="h-6 w-6 text-current" />,
  5: <Laugh className="h-6 w-6 text-current" />,
}

// Smaller mood icons for badges, etc.
export const MOOD_ICONS_SMALL = {
  1: <HeartCrack className="h-5 w-5 text-current" />,
  2: <Frown className="h-5 w-5 text-current" />,
  3: <Meh className="h-5 w-5 text-current" />,
  4: <Smile className="h-5 w-5 text-current" />,
  5: <Laugh className="h-5 w-5 text-current" />,
}

// Mood labels
export const MOOD_LABELS = {
  1: "Very Bad",
  2: "Bad",
  3: "Neutral",
  4: "Good",
  5: "Very Good",
}

// Mood colors for badges, borders, etc.
export const MOOD_COLORS = {
  1: "bg-gray-100 text-gray-800 border-gray-200",
  2: "bg-gray-100 text-gray-800 border-gray-200",
  3: "bg-gray-100 text-gray-800 border-gray-200",
  4: "bg-gray-100 text-gray-800 border-gray-200",
  5: "bg-gray-100 text-gray-800 border-gray-200",
}

// Mood background colors (just the bg part)
export const MOOD_BG_COLORS = {
  1: "bg-gray-100",
  2: "bg-gray-100",
  3: "bg-gray-100",
  4: "bg-gray-100",
  5: "bg-gray-100",
}

// Mood border colors
export const MOOD_BORDER_COLORS = {
  1: "border-gray-300",
  2: "border-gray-300",
  3: "border-gray-300",
  4: "border-gray-300",
  5: "border-gray-300",
}

// Chart colors
export const CHART_COLORS = {
  Happy: "#9CA3AF", // gray-400
  Content: "#6B7280", // gray-500
  Neutral: "#4B5563", // gray-600
  Sad: "#374151", // gray-700
  Angry: "#1F2937", // gray-800
  Anxious: "#111827", // gray-900
  Tired: "#D1D5DB", // gray-300
  Excited: "#E5E7EB", // gray-200
}

