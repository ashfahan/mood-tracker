"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Initialize the state
  useEffect(() => {
    try {
      const item = localStorage.getItem(key)
      if (item) {
        const parsedItem = JSON.parse(item)

        // Convert string dates back to Date objects if we're dealing with MoodEntry[]
        if (Array.isArray(parsedItem) && parsedItem.length > 0 && parsedItem[0].date) {
          const itemWithDates = parsedItem.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date),
          }))
          setStoredValue(itemWithDates)
        } else {
          setStoredValue(parsedItem)
        }
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error)
    }
  }, [key])

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to localStorage
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error("Error writing to localStorage:", error)
    }
  }

  return [storedValue, setValue]
}

