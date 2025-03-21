"use client"

import { Slider } from "@/components/ui/slider"
import { MOOD_ICONS, MOOD_ICONS_SMALL, MOOD_LABELS, MOOD_LEVELS } from "@/constants/mood"

interface MoodSelectorProps {
  selectedMood: number | undefined
  onSelectMood: (mood: number) => void
  "aria-labelledby"?: string
}

export default function MoodSelector({
  selectedMood,
  onSelectMood,
  "aria-labelledby": ariaLabelledBy,
}: MoodSelectorProps) {
  const handleSliderChange = (value: number[]) => {
    onSelectMood(value[0])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        {MOOD_LEVELS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelectMood(value)}
            className={`flex flex-col items-center gap-1 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              selectedMood === value ? "bg-gray-100 dark:bg-gray-800" : ""
            }`}
            aria-label={`Select mood: ${MOOD_LABELS[value]}`}
          >
            {MOOD_ICONS_SMALL[value]}
            <span className="text-xs">{MOOD_LABELS[value]}</span>
          </button>
        ))}
      </div>

      <Slider
        value={selectedMood ? [selectedMood] : [3]}
        max={5}
        min={1}
        step={1}
        onValueChange={handleSliderChange}
        aria-labelledby={ariaLabelledBy}
        disabled={!selectedMood}
      />

      <div className="flex justify-center mt-2">
        {selectedMood ? (
          <div className="flex items-center gap-2">
            {MOOD_ICONS[selectedMood]}
            <span className="font-medium">{MOOD_LABELS[selectedMood]}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Select your mood</span>
        )}
      </div>
    </div>
  )
}

