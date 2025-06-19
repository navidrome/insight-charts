# insight‑charts

## Overview

`insight‑charts` processes insight records from
[Navidrome](https://www.navidrome.org) and generates
[Vega-Lite](https://vega.github.io/vega-lite/) charts.

### Charts implemented so far

- **Operating system distribution**
- **Number of instances over time**
- **File systems used for music files**
- **File systems used for data files**
- **Player types/clients used**

## Requirements

- [Deno](https://deno.land/) runtime
- SQLite database with Navidrome insights data

## Installation

```bash
git clone https://github.com/yourusername/insight-charts.git
cd insight-charts
```

### Using Deno tasks (recommended)

```bash
# development; auto‑reloads on file change
deno task dev

# produce a standalone native binary in ./insight‑charts
deno task build
```

## Configuration

### Environment variables

| Variable             | Purpose                                                                      | Example                            |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| `INSIGHT_DB_PATH`    | Path to the SQLite database. **Required** if `--db-path` flag is not passed. | `INSIGHT_DB_PATH=./db/insights.db` |
| `INSIGHT_OUTPUT_DIR` | Folder where chart JSON files will be written.                               | `INSIGHT_OUTPUT_DIR=./charts`      |
| `INSIGHT_VERBOSE`    | Enable timestamped log lines (`1`, `true`, `yes`).                           | `INSIGHT_VERBOSE=1`                |

A sample file (`.env.example`) is provided; copy it to `.env` and adjust:

```bash
cp .env.example .env
# ...edit as needed...
```

## Usage

### Using only environment variables

```bash
INSIGHT_DB_PATH=./db/insights.db \
INSIGHT_OUTPUT_DIR=./charts \
deno run -ERW main.ts
```

### Compiled binary

After `deno task build`:

```bash
./insight-charts -d ./db/insights.db -o ./charts -v
```

### Options

| Flag                      | Description                           | Default |
| ------------------------- | ------------------------------------- | ------- |
| `-d, --db-path <path>`    | Path to the SQLite database           | —       |
| `-o, --output-dir <path>` | Output directory for chart JSON files | `.`     |
| `-v, --verbose`           | Prepend date & time to log messages   | off     |
| `--help`                  | Show built‑in help                    | —       |

### View the visualisations

```bash
deno task serve
```

## Docker

### Build

```bash
docker build -t insight-charts .
```
