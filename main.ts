import { DatabaseSync, StatementSync } from 'node:sqlite'
import { Summary } from './model/index.ts'

const db = new DatabaseSync('./db/insights.db')

const pieChart = (summaryJson: string): string => {
  const s: Summary = JSON.parse(summaryJson)

  const values = Object.entries(s.os ?? {}).map(
    ([name, val]) => ({ 'Operating System': name, value: val }),
  )
  return JSON.stringify({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: {
      values: values,
    },
    mark: {
      type: 'arc',
      tooltip: true,
    },
    encoding: {
      theta: {
        field: 'value',
        type: 'quantitative',
        stack: 'normalize',
        title: 'Percentage',
      },
      color: {
        field: 'Operating System',
        type: 'nominal',
        sort: {
          field: 'value',
          order: 'descending',
        },
      },
      order: {
        field: 'value',
        type: 'quantitative',
        sort: 'descending',
        title: 'Count',
      },
    },
  })
}

const lineGraph = (stmt: StatementSync): string => {
  const values = [{}]
  for (const row of stmt.iterate()) {
    const dt = new Date(row.time as string).toISOString().slice(0, 10)
    const s: Summary = JSON.parse(
      new TextDecoder().decode(row.data as Uint8Array),
    )

    Object.entries(s.versions ?? {}).forEach(
      ([version, count]) => values.push({ v: version, n: count, d: dt }),
    )
    values.push({
      v: 'all',
      n: s.numInstances,
      d: dt,
    })
  }
  return JSON.stringify({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: {
      values: values,
    },
    height: 500,
    width: 1000,
    mark: {
      type: 'line',
      tooltip: true,
      point: true,
    },
    encoding: {
      color: {
        field: 'v',
        type: 'nominal',
        sort: {
          field: 'n',
          op: 'sum',
          order: 'descending',
        },
        title: 'Version',
      },
      x: {
        field: 'd',
        type: 'temporal',
        timeUnit: 'yearmonthdate',
        title: 'Date',
      },
      y: {
        field: 'n',
        type: 'quantitative',
        title: 'Number of Instances',
      },
    },
  })
}

const summaryJson =
  ((row) =>
    row && row['data'] instanceof Uint8Array
      ? new TextDecoder().decode(row['data'])
      : '')(
      db.prepare('select data from summary order by time desc').get(),
    )

const numInstanceTS = db.prepare(
  "select time, data from summary where data not like '{}' and time > '2024-12-21'",
) // number of instance time series statement

await Deno.writeTextFile('./data/pie.json', pieChart(summaryJson))
await Deno.writeTextFile('./data/numInstance.json', lineGraph(numInstanceTS))

db.close()
