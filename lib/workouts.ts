import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import { Workout } from '@/types/workout'

const workoutsDirectory = path.join(process.cwd(), 'workouts')

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html).process(markdown)
  return result.toString()
}

export async function getWorkouts(): Promise<Workout[]> {
  if (!fs.existsSync(workoutsDirectory)) {
    return []
  }

  const filenames = fs.readdirSync(workoutsDirectory)

  const workouts: Workout[] = await Promise.all(
    filenames
      .filter((filename) => filename.endsWith('.md'))
      .map(async (filename) => {
        const filePath = path.join(workoutsDirectory, filename)
        const fileContents = fs.readFileSync(filePath, 'utf8')
        const { data, content } = matter(fileContents)

        const body = await markdownToHtml(content)
        const dateStr = filename.replace('.md', '')

        return {
          date: dateStr,
          phase: data.phase,
          sports: data.sports,
          summary: data.summary,
          title: data.title,
          body,
        } as Workout
      })
  )

  workouts.sort((a, b) => String(a.date).localeCompare(String(b.date)))
  return workouts
}
