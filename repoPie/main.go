// RepoPie
// - takes CSV-formatted data in stdin, along with argument flags yAxis and nodeSize. 
// - reformats input data according to flags yAxis and nodeSize. 
// - starts local http server to serve static files with data visualisation.
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
	var yAxis = flag.String("yAxis", "", "Mandatory: Metric for y-axis either churn, commit or growth.\nChurn = linesAdded + linesDeleted\nGrowth = linesAdded - linesDeleted")
	var nodeSize = flag.String("nodeSize", "", "Mandatory: Metric for node size either churn, commit or growth.\nChurn = linesAdded + linesDeleted\nGrowth = linesAdded - linesDeleted")
	var fileLimit = flag.String("fileLimit", "", "Optional: Limit for number of files per week")


	// usage documentation for tool
	flag.Usage = func() {
		fmt.Printf(`Usage:
... <CSV-formatted data with headers: repoPath,date,author,fileName,churn,growth,commit>
... -h --help
... --version

Options:` + "\n" + `
  -h --help
        Show this screen.` + "\n")
		flag.PrintDefaults()
		fmt.Printf("\nFor more documentation, see readme at https://github.com/ClaraSoenderborg/BScDataVisualisation/")
	}

	flag.Parse()

	// in case of -version
	if *versionFlag {
		fmt.Println("Version:", version)
		os.Exit(0)
	}

	// Validate yAxis and nodeSize are given correct metric strings
	var metricOptions = []string{"churn", "growth", "commit"}

	if !slices.Contains(metricOptions, *yAxis) {
		log.Fatal("yAxis argument must be churn, growth or commit")
	}

	if !slices.Contains(metricOptions, *nodeSize) {
		log.Fatal("nodeSize argument must be churn, growth or commit")
	}


	setUpServer(reformatCSVWithMetrics(*yAxis, *nodeSize, *fileLimit))


}

// reformatCSV builds a new CSV based on input CSV and y-axis and node size metrics given in user arguments. 
// input will be format: repoPath, date, author, fileName, churn, growth, commit
// output will be format: repoPath, date, author, fileName, yAxis, yAxisMetric, nodeSize, nodeSizeMetric, fileLimit. 
func reformatCSVWithMetrics(yAxis, nodeSize, fileLimit string) [][]string {
	var reader = csv.NewReader(os.Stdin)
	
	// Add headers to output csv
	var result = [][]string{{"repoPath", "date", "author", "fileName", "yAxis", "yAxisMetric", "nodeSize", "nodeSizeMetric", "fileLimit"}}

	// Read and discard the header
	_, err := reader.Read()
	if err != nil {
		log.Fatalf("Error reading header: %v\n", err)
	}

	// Iterate over each row in input csv
	for {
		var data, err = reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil{
			log.Fatalf("Error reading csv: %v", err)
		}

		// row in input csv should have 7 fields 
		if len(data) == 7 {
			var newData = data[0:4]
			var churnVal, _ = strconv.Atoi(data[4])
			var growthVal, _ = strconv.Atoi(data[5])

			// if yAxisValue or nodeSizeValue is less than 1, skip row
			if !addRow(yAxis, nodeSize, churnVal, growthVal) {
				continue
			}

			// append yAxis value
			if yAxis == "churn" && churnVal>0{
				newData = append(newData, data[4]) 

			} else if yAxis == "growth" && growthVal > 0{
				newData = append(newData, data[5])

			} else if yAxis == "commit" {
				newData = append(newData, data[6])

			} 
			// append yAxisMetric
			newData = append(newData, yAxis)

			// append nodeSize value
			if nodeSize == "churn" && churnVal>0{
				newData = append(newData, data[4])

			} else if nodeSize == "growth" && growthVal > 0 {
				newData = append(newData, data[5])

			} else if nodeSize == "commit" {
				newData = append(newData, data[6])

			}

			// append nodeSizeMetric
			newData = append(newData, nodeSize)
			
			// lastly, append fileLimit
			newData = append(newData, fileLimit)

			// add row to result csv
			result = append(result, newData)
			
		}
	}
	return result
}

// addRow checks if row should be added based on the value of y-axis and node size
func addRow(yAxisMetric string, nodeSizeMetric string, churnVal int, growthVal int) bool {
	var addChurn = true
	var addGrowth = true
	
	if yAxisMetric == "churn" || nodeSizeMetric == "churn" {
		if churnVal < 1 {addChurn = false}
	}
	if yAxisMetric == "growth" || nodeSizeMetric == "growth" {
		if growthVal < 1 {addGrowth =  false}
	}
	
	return addChurn && addGrowth
}
