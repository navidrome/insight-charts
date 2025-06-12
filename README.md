## Overview

gen-charts processes insight records from [Navidrome](https://www.navidrome.org) and generates [Vega-Lite](https://vega.github.io/vega-lite/) charts.

Charts implemented so far:

- Operating system distribution
- Number of instances over time
- File systems used for music files
- File systems used for data files
- Player types/clients used

## Requirements

- [Deno](https://deno.land/) runtime
- SQLite database with Navidrome insights data
- Node (only if you want to use parcel to view charts in browser)

## Installation

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/yourusername/gen-charts.git
cd gen-charts
```

## Usage

### Command Line

Run the chart generator by specifying the SQLite database path and optional output directory:

```bash
deno run -WR main.ts --db-path=./db/insights.db --output-dir=./data
```

Or use the compiled binary:

```bash
./gen-charts -d ./db/insights.db -o ./data
```

#### Options

- `-d, --db-path <path>`: Path to the SQLite database (required)
- `-o, --output-dir <path>`: Output directory for visualization files (default: '.')
- `--help`: Display help message

### View Visualizations

The charts can be viewed in a web browser by using a zero-config bundler like [parcel](https://parceljs.org/):
```bash
npx parcel index.html
```

## Development

### Deno Tasks

The project includes several Deno tasks defined in `deno.json`:

```bash
# Run in development mode with auto-reload
deno task dev

# Build the executable
deno task build
```

## Docker

### Build the Docker image

```bash
docker build -t gen-charts .
```

### Run with Docker

```bash
docker run -v ./db/insights.db:/app/insights.db -v ./charts:/app/charts gen-charts -d /app/insights.db -o /app/charts
```

