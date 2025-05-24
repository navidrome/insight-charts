package main

import (
	"database/sql"
	"encoding/json"
	"time"
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

type Sort struct {
	Field
	Op    string `json:"op,omitempty"`
	Order string `json:"order,omitempty"`
}

type Field struct {
	Field     string `json:"field,omitempty"`
	Type      string `json:"type,omitempty"`
	Sort      any    `json:"sort,omitempty"`
	TimeUnit  string `json:"timeUnit,omitempty"`
	Aggregate string `json:"aggregate,omitempty"`
	Title     string `json:"title,omitempty"`
}

type theta struct {
	Field
	Stack string `json:"stack,omitempty"`
}
type color struct {
	Field
}
type encoding struct {
	Theta *theta `json:"theta,omitempty"` // making it a pointer to avoid empty struct
	Color *color `json:"color,omitempty"`
	Order *Field `json:"order,omitempty"`
	X     *x     `json:"x,omitempty"`
	Y     *y     `json:"y,omitempty"`
}

type x struct {
	Field
}

type y struct {
	Field
}

type vega struct {
	Schema   string   `json:"$schema"`
	Height   int      `json:"height,omitempty"`
	Width    int      `json:"width,omitempty"`
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
			Theta: &theta{Field: Field{Field: "value", Type: "quantitative"}, Stack: "normalize"},
			Color: &color{Field{Field: "Operating System", Type: "nominal"}},
			Order: &Field{Field: "value", Type: "quantitative", Sort: "descending"},
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

func createLineGraph(rows *sql.Rows) ([]byte, error) {
	v := vega{
		Schema: vegaSchema,
		Height: 500,
		Width:  1000,
		Mark: mark{
			Type:    "line",
			Tooltip: true,
			Point:   true,
		},
		Encoding: encoding{
			X: &x{
				Field{
					Field: "d", Type: "temporal", Title: "Date", TimeUnit: "yearmonthdate",
				},
			},
			Y: &y{
				Field{
					Field: "n", Type: "quantitative", Title: "Number of Instances",
				},
			}, Color: &color{
				Field{
					Field: "v", Type: "nominal", Title: "Version", Sort: Sort{
						Field: Field{
							Field: "n",
						},
						Op:    "sum",
						Order: "descending",
					},
				},
			},
		},
	}
	var (
		dateTimeStr   string
		summaryString string
		s             summary
	)
	for rows.Next() {
		err := rows.Scan(&dateTimeStr, &summaryString)
		if err != nil {
			return nil, err
		}
		t, err := time.Parse(time.RFC3339, dateTimeStr)
		if err != nil {
			return nil, err
		}
		if summaryString == "{}" {
			continue
		}
		err = json.Unmarshal([]byte(summaryString), &s)
		if err != nil {
			return nil, err
		}
		all := 0
		for version, number := range s.Versions {
			v.Data.Values = append(v.Data.Values, map[string]any{
				"v": version,
				"n": number,
				"d": t.Format("2006-01-02"),
			})
			all += int(number)
		}
		v.Data.Values = append(v.Data.Values, map[string]any{
			"v": "all",
			"n": all,
			"d": t.Format("2006-01-02"),
		})
	}
	jsonString, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	return jsonString, nil
}
