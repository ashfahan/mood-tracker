import { HeartCrack, Frown, Meh, Smile, Laugh } from "lucide-react"

// Mood levels
export const MOOD_LEVELS = [1, 2, 3, 4, 5] as const
export type MoodLevel = (typeof MOOD_LEVELS)[number]

// Mood icons
export const MOOD_ICONS = {
  1: <HeartCrack className="h-6 w-6 text-red-500" />,
  2: <Frown className="h-6 w-6 text-orange-500" />,
  3: <Meh className="h-6 w-6 text-yellow-500" />,
  4: <Smile className="h-6 w-6 text-green-500" />,
  5: <Laugh className="h-6 w-6 text-blue-500" />,
}

// Smaller mood icons for badges, etc.
export const MOOD_ICONS_SMALL = {
  1: <HeartCrack className="h-5 w-5 text-red-500" />,
  2: <Frown className="h-5 w-5 text-orange-500" />,
  3: <Meh className="h-5 w-5 text-yellow-500" />,
  4: <Smile className="h-5 w-5 text-green-500" />,
  5: <Laugh className="h-5 w-5 text-blue-500" />,
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
  1: "bg-red-100 text-red-800 border-red-200",
  2: "bg-orange-100 text-orange-800 border-orange-200",
  3: "bg-yellow-100 text-yellow-800 border-yellow-200",
  4: "bg-green-100 text-green-800 border-green-200",
  5: "bg-blue-100 text-blue-800 border-blue-200",
}

// Mood background colors (just the bg part)
export const MOOD_BG_COLORS = {
  1: "bg-red-100",
  2: "bg-orange-100",
  3: "bg-yellow-100",
  4: "bg-green-100",
  5: "bg-blue-100",
}

// Chart colors
export const CHART_COLORS = {
  Happy: "#FFEB3B",
  Content: "#4CAF50",
  Neutral: "#9E9E9E",
  Sad: "#2196F3",
  Angry: "#F44336",
  Anxious: "#9C27B0",
  Tired: "#3F51B5",
  Excited: "#FF9800",
}

