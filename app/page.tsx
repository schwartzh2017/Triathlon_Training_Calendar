import Calendar from '@/components/Calendar'
import { Workout } from '@/types/workout'

async function getWorkouts(): Promise<Workout[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/workouts`, {
      cache: 'no-store'
    })
    if (!res.ok) {
      throw new Error('Failed to fetch workouts')
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching workouts:', error)
    return []
  }
}

export default async function Home() {
  const workouts = await getWorkouts()

  return (
    <main className="min-h-screen p-8">
      <Calendar workouts={workouts} />
    </main>
  )
}
