package main

import (
	"database/sql"
	"encoding/json"
	"log"
)

const vegaSchema = "https://vega.github.io/schema/vega-lite/v5.json"

type data struct {
	Values []map[string]any `json:"values,omitempty"`
}

type mark struct {
	Type    string `json:"type,omitempty"`
	Point   bool   `json:"point,omitempty"`
	Tooltip bool   `json:"tooltip,omitempty"`
}

type Field struct {
	Field     string `json:"field,omitempty"`
	Type      string `json:"type,omitempty"`
	Sort      string `json:"sort,omitempty"`
	TimeUnit  string `json:"timeUnit,omitempty"`
	Aggregate string `json:"aggregate,omitempty"`
}

type theta struct {
	Field
	Stack string `json:"stack,omitempty"`
}
type color struct {
	Field
}
type encoding struct {
	Theta theta `json:"theta,omitempty"`
	Color color `json:"color,omitempty"`
	Order Field `json:"order,omitempty"`
	X     x     `json:"x,omitempty"`
	Y     y     `json:"y,omitempty"`
}

type x struct {
	Field
}

type y struct {
	Field
}

type vega struct {
	Schema   string   `json:"$schema"`
	Data     data     `json:"data,omitempty"`
	Mark     mark     `json:"mark,omitempty"`
	Encoding encoding `json:"encoding,omitempty"`
}

func createPieChart(row *sql.Row) ([]byte, error) {

	var (
		summaryString string
		s             summary
	)

	err := row.Scan(&summaryString)
	err = json.Unmarshal([]byte(summaryString), &s)
	if err != nil {
		return nil, err
	}

	v := vega{
		Schema: vegaSchema,
		Mark: mark{
			Type:    "arc",
			Tooltip: true,
		},
		Encoding: encoding{
			Theta: theta{Field: Field{Field: "value", Type: "quantitative"}, Stack: "normalize"},
			Color: color{Field{Field: "Operating System", Type: "nominal"}},
			Order: Field{Field: "value", Type: "quantitative", Sort: "descending"},
		},
	}

	for name, number := range s.OS {
		v.Data.Values = append(v.Data.Values, map[string]any{
			"Operating System": name,
			"value":            number,
		})
	}
	jsonString, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}

	return jsonString, nil
}

//{
//  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
//  "description": "Stock prices of 5 Tech Companies over Time.",
//  "data": {"url": "data/stocks.csv"},
//  "mark": {"type": "line", "tooltip": true, "point": true},
//  "encoding": {
//    "x": {"timeUnit": "year", "field": "date"},
//    "y": {"aggregate": "mean", "field": "price", "type": "quantitative"},
//    "color": {"field": "symbol", "type": "nominal"}
//  }
//}

func createLineGraph(rows *sql.Rows) ([]byte, error) {
	var (
		summaryString string
		s             summary
	)
	//v := vega{
	//	Schema: vegaSchema,
	//	Mark: mark{
	//		Type:    "line",
	//		Tooltip: true,
	//		Point:   true,
	//	},
	//	Encoding: encoding{X: x{Field{Field: "Date", TimeUnit: "year", Type: "temporal"}},
	//		Y: y{Field{Field: "Number of Instances", Type: "quantitative"}}},
	//}
	for rows.Next() {

		err := rows.Scan(&summaryString)
		if err != nil {
			log.Fatal(err)
		}
		if summaryString == "{}" {
			continue
		}
		err = json.Unmarshal([]byte(summaryString), &s)
		if err != nil {
			log.Fatal(err)
		}

		//for name, number := range s.Versions {
		//	v.Data.Values = append(v.Data.Values, map[string]any{
		//		"Date":
		//	})
		//}
	}
	return nil, nil
}
