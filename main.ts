import { DatabaseSync } from 'node:sqlite'
import {
  dataFsPie,
  musicFsPie,
  numInstanceLine,
  osPie,
  playerTypePie,
} from './generators.ts'
import { parseArgs } from 'jsr:@std/cli/parse-args'
import { exit } from 'node:process'

const flags = parseArgs(Deno.args, {
  string: ['db-path', 'output-dir'],
  boolean: ['help'],
  default: { 'output-dir': '.' },
  alias: { d: 'db-path', o: 'output-dir' },
})

flags['output-dir'] = flags['output-dir'].replace(/\/$/, '')

const printUsage = () =>
  console.log(
    `Usage: gen-charts [options]
    
Options:
  -d, --db-path <path>      Path to the SQLite database (required)
  -o, --output-dir <path>   Output directory for visualization files (default: '.')
  --help                    Display this help message
    
Example:
  gen-charts -d ./db/insights.db -o ./visualizations`,
  )

if (flags.help) {
  printUsage()
  exit(0)
}

if (flags['db-path'] === undefined) {
  console.log('gen-charts: Database path must be specified')
  exit(1)
}

const db = new DatabaseSync(flags['db-path'])

Deno.mkdir(flags['output-dir'], { recursive: true }).catch(() => {})

await Deno.writeTextFile(
  `${flags['output-dir']}/osPie.json`,
  osPie(db),
)
await Deno.writeTextFile(
  `${flags['output-dir']}/numInstance.json`,
  numInstanceLine(db),
)
await Deno.writeTextFile(
  `${flags['output-dir']}/musicFsPie.json`,
  musicFsPie(db),
)
await Deno.writeTextFile(
  `${flags['output-dir']}/dataFsPie.json`,
  dataFsPie(db),
)
await Deno.writeTextFile(
  `${flags['output-dir']}/playerTypePie.json`,
  playerTypePie(db),
)

db.close()
