package main

import (
	"encoding/csv"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"slices"
	"strconv"
)

// default version. Overridden at build time
var version = "dev"



func main() {
	// argument flags

	var versionFlag = flag.Bool("version", false, "Show version")
	var yAxis = flag.String("yAxis", "", "Mandatory: Metric for y-axis either churn, commit or growth. churn = linesAdded + linesDeleted, growth = linesAdded - linesDeleted")
	var nodeSize = flag.String("nodeSize", "", "Mandatory: Metric for node size either churn, commit or growth")
	var fileLimit = flag.String("fileLimit", "", "Optinal: Limit for number of files per week")


	// usage documentation for tool
	flag.Usage = func() {
		fmt.Printf(`Usage:
... <CSV-formatted data>
... -h --help
... --version

Options:` + "\n" + `
  -h --help
        Show this screen.` + "\n")
		flag.PrintDefaults()
	}

	flag.Parse()

	// in case of -version
	if *versionFlag {
		fmt.Println("Version:", version)
		os.Exit(0)
	}

	var metricOptions = []string{"churn", "growth", "commit"}

	if !slices.Contains(metricOptions, *yAxis) {
		log.Fatal("yAxis argument must be churn, growth or commit")
	}

	if !slices.Contains(metricOptions, *nodeSize) {
		log.Fatal("nodeSize argument must be churn, growth or commit")
	}


	var reader = csv.NewReader(os.Stdin)

	var result = [][]string{{"repoPath", "date", "author", "fileName", "yAxis", "yAxisMetric", "nodeSize", "nodeSizeMetric","fileLimit"}}


	for {
		var data, err = reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil{
			log.Fatalf("Error reading csv: %v", err)
		}

		if len(data) >= 8 {
			var newData = data[0:4]
			var churnVal, _ = strconv.Atoi(data[4])
			var growthVal, _ = strconv.Atoi(data[4])

			if *yAxis == "churn" && churnVal>0{
				newData = append(newData, data[4])

			} else if *yAxis == "growth" && growthVal > 0{
				newData = append(newData, data[5])

			} else if *yAxis == "commit" {
				newData = append(newData, data[6])

			}

			newData = append(newData, *yAxis)

			if *nodeSize == "churn" && churnVal>0{
				newData = append(newData, data[4])

			} else if *nodeSize == "growth" && growthVal > 0 {
				newData = append(newData, data[5])

			} else if *nodeSize == "commit" {
				newData = append(newData, data[6])

			}

			newData = append(newData, *nodeSize)
			newData = append(newData, *fileLimit)

			result = append(result, newData)
		}
	}


	setUpServer(result)


}
