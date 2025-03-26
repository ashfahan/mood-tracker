"use client"

import { Slider } from "@/components/ui/slider"
import { MOOD_ICONS_SMALL, MOOD_LABELS, MOOD_LEVELS } from "@/constants/mood"
import { useMediaQuery } from "@/hooks/use-media-query"

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
  const isMobile = useMediaQuery("(max-width: 640px)")

  const handleSliderChange = (value: number[]) => {
    onSelectMood(value[0])
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between gap-1 sm:gap-2">
        {MOOD_LEVELS.map((value) => {
          const isSelected = selectedMood === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelectMood(value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-md transition-colors flex-1 ${
                isSelected ? "bg-primary text-primary-foreground" : "hover:bg-gray-100 dark:hover:bg-gray-800"
              } ${isMobile ? "sm:w-auto" : ""}`}
              aria-label={`Select mood: ${MOOD_LABELS[value]}`}
              aria-pressed={isSelected}
            >
              <div className="relative">
                {isSelected ? (
                  <div className="text-white">{MOOD_ICONS_SMALL[value]}</div>
                ) : (
                  <div className="text-gray-500">{MOOD_ICONS_SMALL[value]}</div>
                )}
              </div>
              <span className={`text-[10px] sm:text-xs ${isSelected ? "font-medium" : ""}`}>{MOOD_LABELS[value]}</span>
            </button>
          )
        })}
      </div>

      {!isMobile && (
        <Slider
          value={[selectedMood || 0]}
          max={5}
          min={1}
          step={1}
          onValueChange={handleSliderChange}
          aria-labelledby={ariaLabelledBy}
        />
      )}
    </div>
  )
}

