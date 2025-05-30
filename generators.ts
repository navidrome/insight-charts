import { Summary } from './model/index.ts'
import { DatabaseSync } from 'node:sqlite'

const vegaSchema = 'https://vega.github.io/schema/vega-lite/v5.json'

const osPie = (db: DatabaseSync): string => {
  const summary: Summary = JSON.parse(
    ((row) =>
      row && row['data'] instanceof Uint8Array
        ? new TextDecoder().decode(row['data'])
        : '')(
        db.prepare('select data from summary order by time desc').get(),
      ),
  )

  const values = Object.entries(summary.os ?? {}).map(
    ([name, count]) => ({ os: name, c: count }),
  )
  return JSON.stringify({
    $schema: vegaSchema,
    data: {
      values: values,
    },
    mark: {
      type: 'arc',
      tooltip: true,
    },
    encoding: {
      theta: {
        field: 'c',
        type: 'quantitative',
        stack: 'normalize',
        title: 'Percentage',
      },
      color: {
        field: 'os',
        type: 'nominal',
        sort: {
          field: 'c',
          order: 'descending',
        },
        title: 'Operating System',
      },
      order: {
        field: 'c',
        type: 'quantitative',
        sort: 'descending',
        title: 'Count',
      },
    },
  })
}

const numInstanceLine = (db: DatabaseSync): string => {
  const stmt = db.prepare(
    "select time, data from summary where data not like '{}' and time > '2024-12-21'",
  )
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
    $schema: vegaSchema,
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

const musicFsPie = (db: DatabaseSync): string => {
  const summary: Summary = JSON.parse(
    ((row) =>
      row && row['data'] instanceof Uint8Array
        ? new TextDecoder().decode(row['data'])
        : '')(
        db.prepare('select data from summary order by time desc').get(),
      ),
  )
  const values = Object.entries(summary.musicFS ?? {}).map(
    ([type, count]) => ({ fs: type, c: count }),
  )

  return JSON.stringify(
    {
      $schema: vegaSchema,
      data: {
        values: values,
      },
      mark: {
        type: 'arc',
        tooltip: true,
      },
      encoding: {
        theta: {
          field: 'c',
          type: 'quantitative',
          stack: 'normalize',
          title: 'Percentage',
        },
        color: {
          field: 'fs',
          type: 'nominal',
          sort: {
            field: 'c',
            order: 'descending',
          },
          title: 'File System (music)',
        },
        order: {
          field: 'c',
          type: 'quantitative',
          sort: 'descending',
          title: 'Count',
        },
      },
    },
  )
}

const dataFsPie = (db: DatabaseSync): string => {
  const summary: Summary = JSON.parse(
    ((row) =>
      row && row['data'] instanceof Uint8Array
        ? new TextDecoder().decode(row['data'])
        : '')(
        db.prepare('select data from summary order by time desc').get(),
      ),
  )
  const values = Object.entries(summary.dataFS ?? {}).map(
    ([type, count]) => ({ fs: type, c: count }),
  )

  return JSON.stringify(
    {
      $schema: vegaSchema,
      data: {
        values: values,
      },
      mark: {
        type: 'arc',
        tooltip: true,
      },
      encoding: {
        theta: {
          field: 'c',
          type: 'quantitative',
          stack: 'normalize',
          title: 'Percentage',
        },
        color: {
          field: 'fs',
          type: 'nominal',
          sort: {
            field: 'c',
            order: 'descending',
          },
          title: 'File System (data)',
        },
        order: {
          field: 'c',
          type: 'quantitative',
          sort: 'descending',
          title: 'Count',
        },
      },
    },
  )
}

const playerTypePie = (db: DatabaseSync): string => {
  const summary: Summary = JSON.parse(
    ((row) =>
      row && row['data'] instanceof Uint8Array
        ? new TextDecoder().decode(row['data'])
        : '')(
        db.prepare('select data from summary order by time desc').get(),
      ),
  )
  const values = Object.entries(summary.playerTypes ?? {}).map(
    ([name, count]) => ({ pt: `${name}: ${count}`, c: count }),
  )

  return JSON.stringify(
    {
      $schema: vegaSchema,
      data: {
        values: values,
      },
      mark: {
        type: 'arc',
        tooltip: true,
      },
      encoding: {
        theta: {
          field: 'c',
          type: 'quantitative',
          stack: 'normalize',
          title: 'Percentage',
        },
        color: {
          field: 'pt',
          type: 'nominal',
          sort: {
            field: 'c',
            order: 'descending',
          },
          title: 'Client',
        },
        order: {
          field: 'c',
          type: 'quantitative',
          sort: 'descending',
          title: 'Count',
        },
      },
    },
  )
}

export { dataFsPie, musicFsPie, numInstanceLine, osPie, playerTypePie }
