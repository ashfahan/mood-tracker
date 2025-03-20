"use client"

import type React from "react"

import type { MoodEntry } from "@/types/mood"
import { format, subDays, differenceInDays, isSameDay } from "date-fns"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ResponsiveLine } from "@nivo/line"
import { Calendar, BarChart3, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
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
} from "@/utils/mood-utils"

// Custom tooltip component for Nivo charts
const ChartTooltip = ({ point }: any) => {
  const moodValue = Math.round(point.data.y)

  return (
    <div className="bg-white p-2 shadow-md rounded-md border text-sm">
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
        <div className="text-2xl font-bold">{value}</div>
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
}

const DailyMoodChart = ({ data }: DailyMoodChartProps) => (
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
        tickRotation: -45,
        legend: "Date",
        legendOffset: 55,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        tickValues: [1, 2, 3, 4, 5],
        legend: "Mood Level",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      colors={{ scheme: "category10" }}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      gridYValues={[1, 2, 3, 4, 5]}
      tooltip={ChartTooltip}
      theme={{
        axis: {
          ticks: {
            text: {
              fontSize: 12,
            },
          },
          legend: {
            text: {
              fontSize: 14,
              fontWeight: "bold",
            },
          },
        },
        grid: {
          line: {
            stroke: "#e0e0e0",
            strokeWidth: 1,
          },
        },
        crosshair: {
          line: {
            stroke: "#b0b0b0",
            strokeWidth: 1,
            strokeOpacity: 0.5,
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
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  </div>
)

// Weekday Mood Chart Component
interface WeekdayMoodChartProps {
  data: any[]
}

const WeekdayMoodChart = ({ data }: WeekdayMoodChartProps) => (
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
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        tickValues: [1, 2, 3, 4, 5],
        legend: "Average Mood",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      colors={{ scheme: "category10" }}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      gridYValues={[1, 2, 3, 4, 5]}
      tooltip={ChartTooltip}
      theme={{
        axis: {
          ticks: {
            text: {
              fontSize: 12,
            },
          },
          legend: {
            text: {
              fontSize: 14,
              fontWeight: "bold",
            },
          },
        },
        grid: {
          line: {
            stroke: "#e0e0e0",
            strokeWidth: 1,
          },
        },
        crosshair: {
          line: {
            stroke: "#b0b0b0",
            strokeWidth: 1,
            strokeOpacity: 0.5,
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
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  </div>
)

// Date Range Selector Component
interface DateRangeSelectorProps {
  timeRange: string
  setTimeRange: (range: "7" | "30" | "90" | "custom") => void
  startDate: Date
  setStartDate: (date: Date) => void
  endDate: Date
  setEndDate: (date: Date) => void
  isCustomRangeMatchingPreset: boolean
  handleDateRangeChange: (start: Date, end: Date) => void
}

const DateRangeSelector = ({
  timeRange,
  setTimeRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isCustomRangeMatchingPreset,
  handleDateRangeChange,
}: DateRangeSelectorProps) => (
  <div className="flex flex-wrap gap-2">
    <Button
      variant={timeRange === "7" ? "default" : "outline"}
      size="sm"
      onClick={() => {
        setTimeRange("7")
        setStartDate(subDays(new Date(), 7))
        setEndDate(new Date())
      }}
    >
      7 Days
    </Button>
    <Button
      variant={timeRange === "30" ? "default" : "outline"}
      size="sm"
      onClick={() => {
        setTimeRange("30")
        setStartDate(subDays(new Date(), 30))
        setEndDate(new Date())
      }}
    >
      30 Days
    </Button>
    <Button
      variant={timeRange === "90" ? "default" : "outline"}
      size="sm"
      onClick={() => {
        setTimeRange("90")
        setStartDate(subDays(new Date(), 90))
        setEndDate(new Date())
      }}
    >
      90 Days
    </Button>

    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={timeRange === "custom" && !isCustomRangeMatchingPreset ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          Custom Range
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col sm:flex-row">
          <div className="border-b sm:border-b-0 sm:border-r p-2">
            <div className="px-3 py-2 text-sm font-medium">Start Date</div>
            <CalendarComponent
              mode="single"
              selected={startDate}
              onSelect={(date) => date && handleDateRangeChange(date, endDate)}
              disabled={(date) => date > endDate || date > new Date()}
              initialFocus
            />
          </div>
          <div className="p-2">
            <div className="px-3 py-2 text-sm font-medium">End Date</div>
            <CalendarComponent
              mode="single"
              selected={endDate}
              onSelect={(date) => date && handleDateRangeChange(startDate, date)}
              disabled={(date) => date < startDate || date > new Date()}
              initialFocus
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
)

// Main MoodAnalytics Component
interface MoodAnalyticsProps {
  entries: MoodEntry[]
}

export default function MoodAnalytics({ entries }: MoodAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90" | "custom">("30")
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [activeChart, setActiveChart] = useState<"daily" | "weekly">("daily")

  // Calculate date range based on selected time range
  const dateRange = useMemo(() => {
    if (timeRange === "7") {
      return {
        start: subDays(new Date(), 7),
        end: new Date(),
      }
    } else if (timeRange === "30") {
      return {
        start: subDays(new Date(), 30),
        end: new Date(),
      }
    } else if (timeRange === "90") {
      return {
        start: subDays(new Date(), 90),
        end: new Date(),
      }
    } else {
      return {
        start: startDate,
        end: endDate,
      }
    }
  }, [timeRange, startDate, endDate])

  // Check if custom date range matches any preset
  const isCustomRangeMatchingPreset = useMemo(() => {
    const daysDiff = differenceInDays(endDate, startDate)
    return (
      (daysDiff === 6 && isSameDay(endDate, new Date())) ||
      (daysDiff === 29 && isSameDay(endDate, new Date())) ||
      (daysDiff === 89 && isSameDay(endDate, new Date()))
    )
  }, [startDate, endDate])

  // Get all days in the range
  const daysInRange = useMemo(() => getDaysInRange(dateRange.start, dateRange.end), [dateRange])

  // Filter entries to the selected date range
  const filteredEntries = useMemo(
    () => filterEntriesByDateRange(entries, dateRange.start, dateRange.end),
    [entries, dateRange],
  )

  // Prepare data for charts
  const dailyChartData = useMemo(() => formatDailyChartData(entries, daysInRange), [entries, daysInRange])

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

  // Handle custom date range selection
  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start)
    setEndDate(end)

    // Check if the selected range matches any preset
    const daysDiff = differenceInDays(end, start)
    if (daysDiff === 6 && isSameDay(end, new Date())) {
      setTimeRange("7")
    } else if (daysDiff === 29 && isSameDay(end, new Date())) {
      setTimeRange("30")
    } else if (daysDiff === 89 && isSameDay(end, new Date())) {
      setTimeRange("90")
    } else {
      setTimeRange("custom")
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Average Mood"
          value={averageMood}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
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
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          subtitle={
            filteredEntries.length > 0 ? `${daysTrackedPercentage}% of days tracked` : "No entries in selected range"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <div>
              <CardTitle>Mood Analysis</CardTitle>
              <CardDescription>View your mood patterns over time</CardDescription>
            </div>

            <DateRangeSelector
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              isCustomRangeMatchingPreset={isCustomRangeMatchingPreset}
              handleDateRangeChange={handleDateRangeChange}
            />
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
              <DailyMoodChart data={nivoLineData} />
            ) : (
              <WeekdayMoodChart data={nivoWeekdayData} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

