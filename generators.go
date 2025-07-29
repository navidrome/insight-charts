package main

import (
	"database/sql"
	"encoding/json"
	"github.com/go-echarts/go-echarts/v2/charts"
	"github.com/go-echarts/go-echarts/v2/opts"
	"github.com/go-echarts/go-echarts/v2/render"
	"sort"
	"strconv"
	"time"
)

func genOsPie(db *sql.DB, stmt string) (render.ChartSnippet, error) {
	pie := charts.NewPie()
	pie.SetGlobalOptions(
		charts.WithTitleOpts(opts.Title{
			Title: "OS Distribution",
			Left:  "center",
		}), charts.WithLegendOpts(opts.Legend{
			Show:   nil,
			Left:   "left",
			Top:    "middle",
			Orient: "vertical",
		}), charts.WithTooltipOpts(opts.Tooltip{Formatter: "{b}: {c} ({d}%)"}),
	)
	var (
		summaryString string
		s             summary
	)
	err := db.QueryRow(stmt).Scan(&summaryString)
	if err != nil {
		return render.ChartSnippet{}, err
	}
	err = json.Unmarshal([]byte(summaryString), &s)
	if err != nil {
		return render.ChartSnippet{}, err
	}
	data := make([]opts.PieData, 0)
	for name, value := range s.OS {
		data = append(data, opts.PieData{Name: name, Value: value})
	}
	sort.Slice(data, func(i, j int) bool {
		return (data[i].Value).(uint64) > (data[j].Value).(uint64)
	})

	pie.AddSeries("pie", data).SetSeriesOptions(charts.WithLabelOpts(opts.Label{Show: opts.Bool(false)}))
	return pie.RenderSnippet(), nil
}

func genNumInstanceLine(db *sql.DB, stmt string) (render.ChartSnippet, error) {

	var numSummaries uint64
	err := db.QueryRow(`select count(id) from summary where data not like '{}' and time > '2024-12-21' and time < (select max(time) from summary)`).Scan(&numSummaries)
	if err != nil {
		return render.ChartSnippet{}, err
	}

	rawData, err := func() (map[string][]opts.LineData, error) {
		rows, err := db.Query(`select distinct key from summary, json_each(summary.data, '$.versions') order by key;`)
		if err != nil {
			return nil, err
		}
		rawData := make(map[string][]opts.LineData)
		for rows.Next() {
			var tag string
			err = rows.Scan(&tag)
			if err != nil {
				return nil, err
			}
			if _, ok := rawData[tag]; !ok {
				rawData[tag] = make([]opts.LineData, numSummaries)
				for i := range rawData[tag] {
					rawData[tag][i].Value = "-"
				}
			}
		}
		return rawData, nil
	}()
	if err != nil {
		return render.ChartSnippet{}, err
	}
	var dateSlice []string

	rows, err := db.Query(stmt)
	if err != nil {
		return render.ChartSnippet{}, err
	}
	for count := 0; rows.Next(); count++ {
		var (
			dateTimeString string
			summaryString  string
			s              summary
		)

		err = rows.Scan(&dateTimeString, &summaryString)
		if err != nil {
			return render.ChartSnippet{}, err
		}

		err = json.Unmarshal([]byte(summaryString), &s)
		if err != nil {
			return render.ChartSnippet{}, err
		}

		d, err := time.Parse(time.RFC3339, dateTimeString)
		if err != nil {
			return render.ChartSnippet{}, err
		}
		dateSlice = append(dateSlice, d.Format("2006-01-02"))
		for tag, amount := range s.Versions {
			rawData[tag][count].Value = strconv.FormatUint(amount, 10)
		}
	}

	line := charts.NewLine()
	line.SetGlobalOptions(charts.WithTitleOpts(opts.Title{Title: "Instances by Version", Left: "center"}))
	line.SetXAxis(dateSlice)
	for tag, data := range rawData {
		line.AddSeries(tag, data)
	}

	return line.RenderSnippet(), nil
}
