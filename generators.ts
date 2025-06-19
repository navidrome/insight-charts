import { Summary } from './model/index.ts'
import { StatementSync } from 'node:sqlite'

const vegaSchema = 'https://vega.github.io/schema/vega-lite/v5.json'

const genPie = (
  width: number | string,
  height: number | string,
  colorField: string,
  tooltipTitle: string,
) => ({
  $schema: vegaSchema,
  background: null,
  height: height,
  width: width,
  transform: [
    {
      joinaggregate: [
        { op: 'sum', field: 'c', as: 'total' },
      ],
    },
    {
      calculate:
        "datum.c / datum.total < 0.01 ? '<1%' : format(datum.c / datum.total, '.0%')",
      as: 'pctLabel',
    },
  ],
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
      legend: {
        labelLimit: 250,
        symbolLimit: 13,
      },
      field: colorField,
      type: 'nominal',
      sort: {
        field: 'c',
        order: 'descending',
      },
      title: '',
    },
    order: {
      field: 'c',
      type: 'quantitative',
      sort: 'descending',
      title: 'Count',
    },
    tooltip: [
      { field: colorField, type: 'nominal', title: tooltipTitle },
      {
        field: 'c',
        type: 'quantitative',
        title: 'Count',
        format: ',',
      },
      { field: 'pctLabel', type: 'nominal', title: 'Percentage' },
    ],
  },
})

const parseSummaryData = (stmt: StatementSync) =>
  JSON.parse(
    ((row) =>
      row && row['data'] instanceof Uint8Array
        ? new TextDecoder().decode(row['data'])
        : '')(
        stmt.get(),
      ),
  )

const osPie = (stmt: StatementSync): string => {
  const summary: Summary = parseSummaryData(stmt)
  const values = Object.entries(summary.os ?? {}).map(
    ([name, count]) => ({ os: name, c: count }),
  )

  return JSON.stringify({
    title: 'Operating Systems',
    description: 'Distribution of operating systems used by clients',
    data: {
      values: values,
    },
    ...genPie('container', 420, 'os', 'OS'),
  })
}

const musicFsPie = (stmt: StatementSync): string => {
  const summary: Summary = parseSummaryData(stmt)
  const values = Object.entries(summary.musicFS ?? {}).map(
    ([type, count]) => ({ fs: type, c: count }),
  )

  return JSON.stringify(
    {
      title: 'Music File Systems',
      description: 'Distribution of file systems used for music files',
      data: {
        values: values,
      },
      ...genPie('container', 420, 'fs', 'File System'),
    },
  )
}

const dataFsPie = (stmt: StatementSync): string => {
  const summary: Summary = parseSummaryData(stmt)
  const values = Object.entries(summary.dataFS ?? {}).map(
    ([type, count]) => ({ fs: type, c: count }),
  )

  return JSON.stringify(
    {
      title: 'Data File Systems',
      description: 'Distribution of file systems used for data files',
      data: {
        values: values,
      },
      ...genPie('container', 420, 'fs', 'File System'),
    },
  )
}

const playerTypePie = (stmt: StatementSync): string => {
  const summary: Summary = parseSummaryData(stmt)
  const values = Object.entries(summary.playerTypes ?? {}).map(
    ([name, count]) => ({ pt: name, c: count }),
  )

  return JSON.stringify(
    {
      title: 'Clients',
      description: 'Distribution of clients used',
      data: {
        values: values,
      },
      ...genPie('container', 420, 'pt', 'Client'),
    },
  )
}
const numInstanceLine = (stmt: StatementSync): string => {
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
    background: null,
    title: 'Number of Instances Over Time',
    description: 'Number of instances of the server over time, by version',
    data: {
      values: values,
    },
    height: 420,
    width: 'container',
    mark: {
      type: 'line',
      tooltip: true,
      point: true,
    },
    encoding: {
      color: {
        legend: {
          labelLimit: 250,
          symbolLimit: 13,
        },
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

export { dataFsPie, musicFsPie, numInstanceLine, osPie, playerTypePie }
