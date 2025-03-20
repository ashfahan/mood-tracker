import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to analytics page by default
  redirect("/analytics")
}

