package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

type summary struct {
	NumInstances   int64             `json:"numInstances,omitempty"`
	NumActiveUsers int64             `json:"numActiveUsers,omitempty"`
	Versions       map[string]uint64 `json:"versions,omitempty"`
	OS             map[string]uint64 `json:"os,omitempty"`
	Distros        map[string]uint64 `json:"distros,omitempty"`
	PlayerTypes    map[string]uint64 `json:"playerTypes,omitempty"`
	Players        map[string]uint64 `json:"players,omitempty"`
	Users          map[string]uint64 `json:"users,omitempty"`
	Tracks         map[string]uint64 `json:"tracks,omitempty"`
	MusicFS        map[string]uint64 `json:"musicFS,omitempty"`
	DataFS         map[string]uint64 `json:"dataFS,omitempty"`
	LibSizeAverage int64             `json:"libSizeAverage,omitempty"`
	LibSizeStdDev  float64           `json:"libSizeStdDev,omitempty"`
}

const chartsDir string = "./charts/"
const pieQuery = "select data from summary order by time desc limit 1"
const lineQuery = `select time, data from summary where data not like '{}' and time > '2024-12-21' and time < (select max(time) from summary)`

func main() {
	db, err := sql.Open("sqlite3", "./insights.db")
	if err != nil {
		log.Fatalln(err)
	}
	osChartSnippet, err := genOsPie(db, pieQuery)
	if err != nil {
		log.Fatalln(err)
	}
	lineGraphSnippet, err := genNumInstanceLine(db, lineQuery)
	if err != nil {
		log.Fatalln(err)
	}

	err = os.Mkdir(chartsDir, 0755)
	if err != nil && !os.IsExist(err) {
		log.Fatalln(err)
	}
	outPath := fmt.Sprintf("%s%s", chartsDir, "pie.json")
	f, _ := os.Create(outPath)
	_, err = f.WriteString(osChartSnippet.Option)
	if err != nil {
		log.Fatalln(err)
	}
	outPath = fmt.Sprintf("%s%s", chartsDir, "line.json")
	f, _ = os.Create(outPath)
	_, err = f.WriteString(lineGraphSnippet.Option)
	if err != nil {
		log.Fatalln(err)
	}
}
