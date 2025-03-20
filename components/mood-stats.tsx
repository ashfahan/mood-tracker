import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MoodEntry } from "@/types/mood"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { CHART_COLORS } from "@/constants/mood"
import { calculateMoodDistribution, findMostFrequentMood } from "@/utils/mood-utils"

interface MoodStatsProps {
  entries: MoodEntry[]
}

export default function MoodStats({ entries }: MoodStatsProps) {
  // Count occurrences of each mood
  const moodCounts = calculateMoodDistribution(entries)

  // Convert to array for chart
  const data = Object.entries(moodCounts).map(([name, value]) => ({
    name,
    value,
  }))

  // Get most frequent mood
  const mostFrequentMood = findMostFrequentMood(entries)
  const mostFrequentMoodLabel = mostFrequentMood ? String(mostFrequentMood) : "None"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Statistics</CardTitle>
        <CardDescription>Overview of your mood patterns</CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No data available yet</p>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total entries: {entries.length}</p>
              <p className="text-sm text-muted-foreground">Most frequent mood: {mostFrequentMoodLabel}</p>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS] || "#000000"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

