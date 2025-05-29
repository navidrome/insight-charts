export interface Summary {
  numInstances?: number
  numActiveUsers?: number
  versions?: { [key: string]: number }
  os?: { [key: string]: number }
  distros?: { [key: string]: number }
  playerTypes?: { [key: string]: number }
  players?: { [key: string]: number }
  users?: { [key: string]: number }
  tracks?: { [key: string]: number }
  musicFS?: { [key: string]: number }
  dataFS?: { [key: string]: number }
  libSizeAverage?: number
  libSizeStdDev?: number
}
