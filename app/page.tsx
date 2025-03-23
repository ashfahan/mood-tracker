"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { format, subDays } from "date-fns"
import { ResponsiveLine } from "@nivo/line"
import { BarChart3, TrendingUp } from "lucide-react"
import NewEntryDialog from "@/components/new-entry-dialog"
import type { MoodEntry } from "@/types/mood"
import { useMood } from "@/contexts/mood-context"
import { toast } from "sonner"
import { MOOD_ICONS, MOOD_LABELS } from "@/constants/mood"
import {
  calculateAverageMood,
  calculateMoodDistribution,
  findMostFrequentMood,
  filterEntriesByDateRange,
  getDaysInRange,
  formatDailyChartData,
  formatWeekdayChartData,
  calculateDaysTrackedPercentage,
} from "@/lib/mood-utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useTheme } from "next-themes"
import ClientOnly from "@/components/client-only"

// Custom tooltip component for Nivo charts
const ChartTooltip = ({ point }: any) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const moodValue = Math.round(point.data.y)

  return (
    <div
      className={`${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"} p-2 shadow-md rounded-md border text-sm`}
    >
      <div className="font-medium">{point.data.x}</div>
      <div className="flex items-center gap-2">
        <span>Mood: {typeof point.data.y === "number" ? point.data.y.toFixed(2) : point.data.y}</span>
        {MOOD_ICONS[moodValue]}
      </div>
      {point.data.count && <div className="text-xs text-muted-foreground">Based on {point.data.count} entries</div>}
    </div>
  )
}

// Stats Card Component
interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  subtitle?: string
  children?: React.ReactNode
}

const StatsCard = ({ title, value, icon, subtitle, children }: StatsCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div className={value === "No data" ? "text-base text-muted-foreground" : "text-2xl font-bold"}>
          {value === "No data" ? "No data available" : value}
        </div>
        {icon}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      {children}
    </CardContent>
  </Card>
)

// Daily Mood Chart Component
interface DailyMoodChartProps {
  data: any[]
  isMobile: boolean
  timeRange: string
}

const DailyMoodChart = ({ data, isMobile, timeRange }: DailyMoodChartProps) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Determine how many ticks to show based on screen size and time range
  const getTickValues = () => {
    if (isMobile) {
      if (timeRange === "30") {
        // For 30 days on mobile, show only every ~5th day
        return data[0].data.filter((_: any, i: number) => i % 5 === 0).map((d: any) => d.x)
      } else if (timeRange === "15") {
        // For 15 days on mobile, show only every ~3rd day
        return data[0].data.filter((_: any, i: number) => i % 3 === 0).map((d: any) => d.x)
      }
    }
    // Default: show all ticks or a reasonable number for other cases
    return undefined // Let Nivo decide
  }

  return (
    <div className="h-full w-full">
      <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 50, bottom: isMobile ? 80 : 70, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: 1,
          max: 5,
          stacked: false,
          reverse: false,
        }}
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: isMobile ? -45 : -30,
          legend: "Date",
          legendOffset: 55,
          legendPosition: "middle",
          tickValues: getTickValues(),
          tickColor: isDark ? "#ffffff" : "#333333",
          legendColor: isDark ? "#ffffff" : "#333333",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          tickValues: [1, 2, 3, 4, 5],
          legend: "Mood Level",
          legendOffset: -40,
          legendPosition: "middle",
          tickColor: isDark ? "#ffffff" : "#333333",
          legendColor: isDark ? "#ffffff" : "#333333",
        }}
        enableGridX={false}
        colors={{ scheme: "category10" }}
        pointSize={isMobile ? 6 : 10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        gridYValues={[1, 2, 3, 4, 5]}
        tooltip={ChartTooltip}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: isDark ? "#888888" : "#777777",
                strokeWidth: 1,
              },
            },
            ticks: {
              line: {
                stroke: isDark ? "#888888" : "#777777",
                strokeWidth: 1,
              },
              text: {
                fill: isDark ? "#ffffff" : "#333333",
                fontSize: 12,
              },
            },
            legend: {
              text: {
                fill: isDark ? "#ffffff" : "#333333",
                fontSize: 14,
                fontWeight: "bold",
              },
            },
          },
          grid: {
            line: {
              stroke: isDark ? "#444444" : "#e0e0e0",
              strokeWidth: 1,
            },
          },
          crosshair: {
            line: {
              stroke: isDark ? "#ffffff" : "#b0b0b0",
              strokeWidth: 1,
              strokeOpacity: 0.5,
            },
          },
          tooltip: {
            container: {
              background: isDark ? "#1f2937" : "#ffffff",
              color: isDark ? "#ffffff" : "#333333",
              fontSize: 12,
            },
          },
          legends: {
            text: {
              fill: isDark ? "#ffffff" : "#333333",
              fontSize: 12,
            },
          },
        }}
        legends={[
          {
            anchor: "top",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: -30,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 100,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: isDark ? "rgba(255, 255, 255, .5)" : "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: isDark ? "rgba(255, 255, 255, .03)" : "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  )
}

// Weekday Mood Chart Component
interface WeekdayMoodChartProps {
  data: any[]
  isMobile: boolean
}

const WeekdayMoodChart = ({ data, isMobile }: WeekdayMoodChartProps) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="h-full w-full">
      <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 50, bottom: 70, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: 1,
          max: 5,
          stacked: false,
          reverse: false,
        }}
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Day of Week",
          legendOffset: 40,
          legendPosition: "middle",
          tickColor: isDark ? "#ffffff" : "#333333",
          legendColor: isDark ? "#ffffff" : "#333333",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          tickValues: [1, 2, 3, 4, 5],
          legend: "Average Mood",
          legendOffset: -40,
          legendPosition: "middle",
          tickColor: isDark ? "#ffffff" : "#333333",
          legendColor: isDark ? "#ffffff" : "#333333",
        }}
        enableGridX={false}
        colors={{ scheme: "category10" }}
        pointSize={isMobile ? 8 : 10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        gridYValues={[1, 2, 3, 4, 5]}
        tooltip={ChartTooltip}
        theme={{
          axis: {
            domain: {
              line: {
                stroke: isDark ? "#888888" : "#777777",
                strokeWidth: 1,
              },
            },
            ticks: {
              line: {
                stroke: isDark ? "#888888" : "#777777",
                strokeWidth: 1,
              },
              text: {
                fill: isDark ? "#ffffff" : "#333333",
                fontSize: 12,
              },
            },
            legend: {
              text: {
                fill: isDark ? "#ffffff" : "#333333",
                fontSize: 14,
                fontWeight: "bold",
              },
            },
          },
          grid: {
            line: {
              stroke: isDark ? "#444444" : "#e0e0e0",
              strokeWidth: 1,
            },
          },
          crosshair: {
            line: {
              stroke: isDark ? "#ffffff" : "#b0b0b0",
              strokeWidth: 1,
              strokeOpacity: 0.5,
            },
          },
          tooltip: {
            container: {
              background: isDark ? "#1f2937" : "#ffffff",
              color: isDark ? "#ffffff" : "#333333",
              fontSize: 12,
            },
          },
          legends: {
            text: {
              fill: isDark ? "#ffffff" : "#333333",
              fontSize: 12,
            },
          },
        }}
        legends={[
          {
            anchor: "top",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: -30,
            itemsSpacing: 0,
            itemDirection: "left-to-right",
            itemWidth: 100,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: "circle",
            symbolBorderColor: isDark ? "rgba(255, 255, 255, .5)" : "rgba(0, 0, 0, .5)",
            effects: [
              {
                on: "hover",
                style: {
                  itemBackground: isDark ? "rgba(255, 255, 255, .03)" : "rgba(0, 0, 0, .03)",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  )
}

// Date Range Selector Component
interface DateRangeSelectorProps {
  timeRange: string
  setTimeRange: (range: "7" | "15" | "30") => void
}

const DateRangeSelector = ({ timeRange, setTimeRange }: DateRangeSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
        <Button
          variant={timeRange === "7" ? "default" : "outline"}
          size="sm"
          className="text-xs sm:text-sm"
          onClick={() => setTimeRange("7")}
        >
          7 Days
        </Button>
        <Button
          variant={timeRange === "15" ? "default" : "outline"}
          size="sm"
          className="text-xs sm:text-sm"
          onClick={() => setTimeRange("15")}
        >
          15 Days
        </Button>
        <Button
          variant={timeRange === "30" ? "default" : "outline"}
          size="sm"
          className="text-xs sm:text-sm"
          onClick={() => setTimeRange("30")}
        >
          30 Days
        </Button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { moodEntries, setMoodEntries, addOrUpdateEntry } = useMood()
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [timeRange, setTimeRange] = useState<"7" | "15" | "30">("30")
  const [activeChart, setActiveChart] = useState<"daily" | "weekly">("daily")

  // Check if screen is mobile
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Force a re-render when moodEntries changes
  useEffect(() => {
    setForceUpdate((prev) => prev + 1)
  }, [moodEntries])

  // Calculate date range based on selected time range
  const dateRange = useMemo(() => {
    if (timeRange === "7") {
      return {
        start: subDays(new Date(), 7),
        end: new Date(),
      }
    } else if (timeRange === "15") {
      return {
        start: subDays(new Date(), 15),
        end: new Date(),
      }
    } else {
      return {
        start: subDays(new Date(), 30),
        end: new Date(),
      }
    }
  }, [timeRange])

  // Get all days in the range
  const daysInRange = useMemo(() => getDaysInRange(dateRange.start, dateRange.end), [dateRange])

  // Filter entries to the selected date range
  const filteredEntries = useMemo(
    () => filterEntriesByDateRange(moodEntries, dateRange.start, dateRange.end),
    [moodEntries, dateRange],
  )

  // Prepare data for charts
  const dailyChartData = useMemo(() => formatDailyChartData(moodEntries, daysInRange), [moodEntries, daysInRange])

  const weekdayChartData = useMemo(() => formatWeekdayChartData(filteredEntries), [filteredEntries])

  // Prepare data for Nivo charts
  const nivoLineData = useMemo(
    () => [
      {
        id: "Mood Level",
        data: dailyChartData,
      },
    ],
    [dailyChartData],
  )

  const nivoWeekdayData = useMemo(
    () => [
      {
        id: "Average Mood by Weekday",
        data: weekdayChartData,
      },
    ],
    [weekdayChartData],
  )

  // Calculate statistics
  const averageMood = useMemo(() => calculateAverageMood(filteredEntries), [filteredEntries])

  const moodDistribution = useMemo(() => calculateMoodDistribution(filteredEntries), [filteredEntries])

  const mostFrequentMood = useMemo(() => findMostFrequentMood(filteredEntries), [filteredEntries])

  const daysTrackedPercentage = useMemo(
    () => calculateDaysTrackedPercentage(filteredEntries, daysInRange),
    [filteredEntries, daysInRange],
  )

  // Placeholder for charts while they're loading on client
  const chartPlaceholder = (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">Loading chart...</p>
    </div>
  )

  const handleSaveEntry = (entry: MoodEntry) => {
    // Check if this is a new entry or an update
    const dateStr = new Date(entry.date).toDateString()
    const existingEntry = moodEntries.find((e) => new Date(e.date).toDateString() === dateStr)

    const isNewEntry = !existingEntry
    const originalEntry = existingEntry ? { ...existingEntry } : null

    // Save the entry
    addOrUpdateEntry(entry)
    setIsDialogOpen(false)

    // Toast is now handled in the NewEntryDialog component
    // But we need to handle the undo action here
    if (isNewEntry) {
      // For new entries - no undo action
      toast.success(`Mood tracked for ${format(new Date(entry.date), "MMMM d, yyyy")}`, {
        // No action property for undo
      })
    } else if (originalEntry) {
      // For updates - keep undo action with previous design
      // Only show description if there's a note
      const toastOptions: any = {
        icon: MOOD_ICONS[entry.mood],
        action: {
          label: "Undo",
          onClick: () => {
            // Direct state update instead of using context function
            const updatedEntries = moodEntries.map((e) =>
              new Date(e.date).toDateString() === new Date(originalEntry.date).toDateString()
                ? { ...originalEntry, date: new Date(originalEntry.date) }
                : e,
            )
            setMoodEntries(updatedEntries)

            // Dismiss the toast without showing a new one
            toast.dismiss(toastId)
          },
        },
      }

      // Only add description if there's a note
      if (entry.notes) {
        toastOptions.description = entry.notes
      }

      const toastId = toast.success(`Mood updated for ${format(new Date(entry.date), "MMMM d, yyyy")}`, toastOptions)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="grid gap-4">
          <div>
            <div className="grid gap-4 md:grid-cols-3">
              <StatsCard
                title="Average Mood"
                value={averageMood}
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                subtitle={`From ${format(dateRange.start, "MMM dd, yyyy")} to ${format(dateRange.end, "MMM dd, yyyy")}`}
              />

              <StatsCard title="Most Frequent Mood" value="" icon={<></>}>
                {mostFrequentMood ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {MOOD_ICONS[mostFrequentMood]}
                      <span className="text-2xl font-bold">{MOOD_LABELS[mostFrequentMood]}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{moodDistribution[mostFrequentMood]} entries</div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No data available</div>
                )}
              </StatsCard>

              <StatsCard
                title="Total Entries"
                value={filteredEntries.length}
                icon={<BarChart3 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                subtitle={
                  filteredEntries.length > 0
                    ? `${daysTrackedPercentage}% of days tracked`
                    : "No entries in selected range"
                }
              />
            </div>

            <Card className="mt-4">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <CardTitle>Mood Analysis</CardTitle>
                    <CardDescription>View your mood patterns over time</CardDescription>
                  </div>

                  <DateRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
                </div>

                <Tabs
                  defaultValue="daily"
                  className="mt-4"
                  onValueChange={(value) => setActiveChart(value as "daily" | "weekly")}
                >
                  <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="daily">Daily Mood</TabsTrigger>
                    <TabsTrigger value="weekly">Weekday Average</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent>
                <div className="h-[400px] w-full">
                  {filteredEntries.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No data available for the selected time range</p>
                    </div>
                  ) : activeChart === "daily" && dailyChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No daily data available for the selected time range</p>
                    </div>
                  ) : activeChart === "weekly" && weekdayChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No weekday data available for the selected time range</p>
                    </div>
                  ) : activeChart === "daily" ? (
                    <ClientOnly fallback={chartPlaceholder}>
                      <DailyMoodChart data={nivoLineData} isMobile={isMobile} timeRange={timeRange} />
                    </ClientOnly>
                  ) : (
                    <ClientOnly fallback={chartPlaceholder}>
                      <WeekdayMoodChart data={nivoWeekdayData} isMobile={isMobile} />
                    </ClientOnly>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Conditionally render the dialog only when it's open */}
      {isDialogOpen && (
        <NewEntryDialog
          onOpenChange={setIsDialogOpen}
          onSave={handleSaveEntry}
          entries={moodEntries}
          selectedEntry={selectedEntry}
        />
      )}
    </div>
  )
}

