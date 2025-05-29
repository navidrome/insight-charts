import { DatabaseSync } from 'node:sqlite'
import { fsPie, numInstanceLine, osPie } from './generators.ts'

const db = new DatabaseSync('./db/insights.db')

await Deno.writeTextFile('./data/osPie.json', osPie(db))
await Deno.writeTextFile(
  './data/numInstance.json',
  numInstanceLine(db),
)
await Deno.writeTextFile('./data/fsPie.json', fsPie(db))

db.close()
