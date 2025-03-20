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
    <div>
      {Object.keys(groupedEntries).length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No entries yet</h3>
          <p className="text-muted-foreground">Start tracking your mood by adding an entry.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([monthYear, monthEntries]) => (
            <div key={monthYear} className="space-y-4">
              <h3 className="text-lg font-medium sticky top-0 bg-white py-2">{monthYear}</h3>
              <div className="space-y-4">
                {monthEntries.map((entry, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className={`h-1 ${MOOD_COLORS[entry.mood].split(" ")[0]}`} />
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onEntryClick(entry)}>
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{format(new Date(entry.date), "EEEE, MMMM d, yyyy")}</span>
                        </div>
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
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {entry.notes && (
                      <CardContent className="p-4 pt-2 cursor-pointer" onClick={() => onEntryClick(entry)}>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <p className="whitespace-pre-wrap">{entry.notes}</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

