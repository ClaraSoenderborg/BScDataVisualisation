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
	var yAxis = flag.String("yAxis", "", "Mandatory: Metric for y-axis, must match with header in input CSV")
	var nodeSize = flag.String("nodeSize", "", "Mandatory: Metric for node size, must match with header in input CSV")
	var fileLimit = flag.String("fileLimit", "", "Optional: Limit for number of files per week")


	// usage documentation for tool
	flag.Usage = func() {
		fmt.Printf(`Usage:
... <CSV-formatted data with headers: repoPath,date,author,fileName,[at least 1 metric header]>
... -h --help
... --version

Options:` + "\n" + `
  -h --help
        Show this screen.` + "\n")
		flag.PrintDefaults()
		fmt.Printf("\nFor more documentation, see README at https://github.com/ClaraSoenderborg/BScDataVisualisation/")
	}

	flag.Parse()

	// in case of -version
	if *versionFlag {
		fmt.Println("Version:", version)
		os.Exit(0)
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

	// Read header
	var header, err = reader.Read()
	if err != nil {
		log.Fatalf("Error reading header: %v\n", err)
	}

	// validate argument y-axis and node size metric matches a header
	if !slices.Contains(header, yAxis) || !slices.Contains(header, nodeSize){
		log.Fatal("yAxis and nodeSize arguments must correlate to headers in input data")
	}

	// find column with y-axis and node size metric
	var yAxisIndex = slices.Index(header, yAxis)
	var nodeSizeIndex = slices.Index(header, nodeSize)

	// Iterate over each row in input csv
	for {
		var data, err = reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil{
			log.Fatalf("Error reading csv: %v", err)
		}

		// row in input csv should have at least 5 fields 
		if len(data) >= 5 {
			// first 4 fields contain repoPath,date,author,fileName
			var newData = make([]string,4)
			copy(newData, data[0:4])
			
			// convert strings to integers
			var yAxisValue, _ = strconv.Atoi(data[yAxisIndex])
			var nodeSizeValue, _ = strconv.Atoi(data[nodeSizeIndex])

			// exclude rows with negative or 0 metrics
			if yAxisValue < 1 || nodeSizeValue < 1 {
				continue
			}
			
			// append y-axis data
			newData = append(newData, data[yAxisIndex])
			// append y-axis metric
			newData = append(newData, yAxis)

		
			// append node size data
			newData = append(newData, data[nodeSizeIndex])
			// append node size metric
			newData = append(newData, nodeSize)
			
			
			// lastly, append fileLimit
			newData = append(newData, fileLimit)

			// add row to result csv
			result = append(result, newData)
			
		}
	}
	return result
}
