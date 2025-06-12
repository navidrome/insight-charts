import { DatabaseSync } from 'node:sqlite'
import { exit } from 'node:process'
import { parseArgs } from 'jsr:@std/cli/parse-args'
import {
  dataFsPie,
  musicFsPie,
  numInstanceLine,
  osPie,
  playerTypePie,
} from './generators.ts'

const logWithTimestamp = (...args: unknown[]) => {
  const now = new Date()
  const timestamp = now.toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '')
    .replace(/-/g, '/')
  console.log(`${timestamp}`, ...args)
}

const flags = parseArgs(Deno.args, {
  string: ['db-path', 'output-dir'],
  boolean: ['help', 'verbose'],
  default: { 'output-dir': '.' },
  alias: { d: 'db-path', o: 'output-dir', v: 'verbose' },
})

flags['output-dir'] = flags['output-dir'].replace(/\/$/, '')

const printUsage = () =>
  console.log(
    `Usage: insight-charts [options]
    
Options:
  -d, --db-path <path>      Path to the SQLite database (required)
  -o, --output-dir <path>   Output directory for visualization files (default: '.')
  -v, --verbose             Add date and time to log messages
  --help                    Display this help message
    
Example:
  insight-charts -d ./db/insights.db -o ./visualizations`,
  )

if (flags.help) {
  printUsage()
  exit(0)
}

if (flags['db-path'] === undefined) {
  console.log('insight-charts: Database path must be specified')
  exit(1)
}

flags['verbose']
  ? logWithTimestamp('Opening SQLite database at:', flags['db-path'])
  : console.log('Opening SQLite database at:', flags['db-path'])
const db = new DatabaseSync(flags['db-path'])

const summaryStmt = db.prepare('select data from summary order by time desc')
const timeSeriesStmt = db.prepare(
  "select time, data from summary where data not like '{}' and time > '2024-12-21'",
)

Deno.mkdir(flags['output-dir'], { recursive: true }).catch(() => {})

const charts = {
  'osPie.json': osPie,
  'musicFsPie.json': musicFsPie,
  'dataFsPie.json': dataFsPie,
  'playerTypePie.json': playerTypePie,
}

for (const [filename, generator] of Object.entries(charts)) {
  flags['verbose']
    ? logWithTimestamp(`Saving ${flags['output-dir']}/${filename}`)
    : console.log(`Saving ${flags['output-dir']}/${filename}`)
  await Deno.writeTextFile(
    `${flags['output-dir']}/${filename}`,
    generator(summaryStmt),
  )
}

flags['verbose']
  ? logWithTimestamp(`Saving ${flags['output-dir']}/numInstance.json`)
  : console.log(`Saving ${flags['output-dir']}/numInstance.json`)
await Deno.writeTextFile(
  `${flags['output-dir']}/numInstance.json`,
  numInstanceLine(timeSeriesStmt),
)

flags['verbose']
  ? logWithTimestamp('All charts saved, bye bye!')
  : console.log('All charts saved, bye bye!')
db.close()
