import { resolve } from 'path'
import { config } from 'dotenv'

const envPath = resolve(__dirname, '.env.local')
config({ path: envPath })

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not found after loading env file at', envPath)
}

async function run() {
  const { getEnrichedProjects } = await import('./src/lib/actions/project-actions')
  const projects = await getEnrichedProjects()
  console.log(JSON.stringify(projects, null, 2))
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})

