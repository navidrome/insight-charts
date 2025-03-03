package main

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"log"
	"os"
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

func main() {
	db, err := sql.Open("sqlite3", "./db/insights.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	jsonString, err := createPieChart(db.QueryRow(`select data from summary order by time desc limit 1`))

	//jsonString, err := createLineGraph()

	if err != nil {
		log.Fatal(err)
	}
	f, err := os.Create("data.json")
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()

	_, err = f.Write(jsonString)
	if err != nil {
		log.Fatal(err)
	}

}
