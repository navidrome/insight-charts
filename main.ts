import { DatabaseSync } from 'node:sqlite'
import {
  dataFsPie,
  musicFsPie,
  numInstanceLine,
  osPie,
  playerTypePie,
} from './generators.ts'

const db = new DatabaseSync('./db/insights.db')

await Deno.writeTextFile('./data/osPie.json', osPie(db))
await Deno.writeTextFile(
  './data/numInstance.json',
  numInstanceLine(db),
)
await Deno.writeTextFile('./data/musicFsPie.json', musicFsPie(db))
await Deno.writeTextFile('./data/dataFsPie.json', dataFsPie(db))
await Deno.writeTextFile('./data/playerTypePie.json', playerTypePie(db))

db.close()
