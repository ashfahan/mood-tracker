"use client"

import { format } from "date-fns"
import type { MoodEntry } from "@/types/mood"
import { Calendar, FileText, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MOOD_ICONS_SMALL, MOOD_LABELS, MOOD_COLORS } from "@/constants/mood"

interface MoodHistoryProps {
  entries: MoodEntry[]
  onEntryClick?: (entry: MoodEntry) => void
  onDeleteEntry?: (entry: MoodEntry) => void
}

export default function MoodHistory({ entries, onEntryClick = () => {}, onDeleteEntry = () => {} }: MoodHistoryProps) {
  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Group entries by month
  const groupedEntries: Record<string, MoodEntry[]> = {}

  sortedEntries.forEach((entry) => {
    const monthYear = format(new Date(entry.date), "MMMM yyyy")
    if (!groupedEntries[monthYear]) {
      groupedEntries[monthYear] = []
    }
    groupedEntries[monthYear].push(entry)
  })

  return (
    <section aria-label="Mood history">
      {Object.keys(groupedEntries).length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
          <h3 className="text-lg font-medium mb-2">No entries yet</h3>
          <p className="text-muted-foreground">Start tracking your mood by adding an entry.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
            <div key={monthYear} className="space-y-4">
              <h3 className="text-lg font-medium sticky top-0 bg-white dark:bg-gray-900 py-2">{monthYear}</h3>
              <div className="space-y-4">
                {monthEntries.map((entry, index) => {
                  const entryDate = new Date(entry.date)
                  const formattedDate = format(entryDate, "EEEE, MMMM d, yyyy")

                  return (
                    <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className={`h-1 ${MOOD_COLORS[entry.mood].split(" ")[0]}`} />
                      <CardHeader className="p-4 pb-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <Button
                            variant="ghost"
                            className="flex items-center gap-2 p-0 h-auto font-normal hover:bg-transparent justify-start"
                            onClick={() => onEntryClick(entry)}
                            aria-label={`Edit entry for ${formattedDate}`}
                          >
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                            <span className="font-medium text-left">{formattedDate}</span>
                          </Button>
                          <div className="flex items-center gap-2">
                            <Badge className={MOOD_COLORS[entry.mood]}>
                              <div className="flex items-center gap-1">
                                {MOOD_ICONS_SMALL[entry.mood]}
                                <span>{MOOD_LABELS[entry.mood]}</span>
                              </div>
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteEntry(entry)
                              }}
                              aria-label={`Delete entry for ${formattedDate}`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {entry.notes && (
                        <CardContent className="p-4 pt-2">
                          <Button
                            variant="ghost"
                            className="flex items-start gap-2 text-sm text-muted-foreground p-0 h-auto w-full justify-start font-normal hover:bg-transparent"
                            onClick={() => onEntryClick(entry)}
                            aria-label={`View and edit notes for ${formattedDate}`}
                          >
                            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                            <p className="whitespace-pre-wrap text-left">{entry.notes}</p>
                          </Button>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

