import fs from 'node:fs'
import path from 'node:path'
import { pool } from '../src/lib/db'

async function run() {
	const root = path.resolve(__dirname, '../../..')
	const migrationsDir = path.join(root, 'db', 'migrations')
	const files = fs.readdirSync(migrationsDir)
		.filter(f => f.endsWith('.sql'))
		.sort()
	for (const file of files) {
		const full = path.join(migrationsDir, file)
		const sql = fs.readFileSync(full, 'utf8')
		console.log(`Applying migration: ${file}`)
		await pool.query(sql)
	}
	await pool.end()
	console.log('Migrations applied successfully')
}

run().catch(err => {
	console.error(err)
	process.exit(1)
})
