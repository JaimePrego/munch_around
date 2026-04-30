import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import * as fs from 'fs'
import * as path from 'path'

const dbPath = path.resolve(__dirname, '..', 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n')
  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === 0) continue
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header.trim()] = (values[index] || '').trim()
    })
    rows.push(row)
  }
  return rows
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.mealHistory.deleteMany()
  await prisma.mealSlot.deleteMany()
  await prisma.weeklyPlan.deleteMany()
  await prisma.meal.deleteMany()
  await prisma.plannerSettings.deleteMany()

  // Seed meals from CSV
  const csvPath = path.join(__dirname, 'seed_meals.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCSV(csvContent)

  for (const row of rows) {
    const ingredients = row.ingredients
      ? JSON.stringify(row.ingredients.split(';').map((s: string) => s.trim()).filter(Boolean))
      : '[]'
    const tags = row.tags
      ? JSON.stringify(row.tags.split(';').map((s: string) => s.trim()).filter(Boolean))
      : '[]'

    await prisma.meal.create({
      data: {
        name: row.name,
        prepTime: row.prepTime as 'SHORT' | 'MEDIUM' | 'LONG',
        category: row.category,
        cuisine: row.cuisine,
        mainProtein: row.mainProtein,
        healthScore: parseFloat(row.healthScore) || 5,
        preferenceScore: parseFloat(row.preferenceScore) || 5,
        defaultPortions: parseInt(row.defaultPortions) || 2,
        imageUrl: row.imageUrl || null,
        ingredients,
        tags,
        notes: row.notes || null,
      },
    })
  }

  // Create default settings
  const defaultSlotConfig = {
    0: ['LUNCH', 'DINNER'],
    1: ['LUNCH', 'DINNER'],
    2: ['LUNCH', 'DINNER'],
    3: ['LUNCH', 'DINNER'],
    4: ['LUNCH', 'DINNER'],
    5: ['DINNER'],
    6: ['DINNER'],
  }

  await prisma.plannerSettings.create({
    data: {
      defaultSlotConfig: JSON.stringify(defaultSlotConfig),
      preferenceWeight: 3,
      healthWeight: 2,
      freshnessWeight: 3,
      varietyWeight: 2,
      prepSuitabilityWeight: 2,
      varietyStrictness: 1,
      freshnessPenaltyStrength: 1,
      maxLongPrepMealsPerWeek: 2,
      preferLongMealsOnWeekends: true,
      targetAverageHealthScore: 7,
    },
  })

  const mealCount = await prisma.meal.count()
  console.log(`Seeded ${mealCount} meals and default settings.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
