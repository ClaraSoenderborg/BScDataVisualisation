package main

import (
	"encoding/csv"
	"flag"
	"fmt"
	"log"
	"os"
	"slices"
	"strings"
)

// default version. Overridden at build time
var version = "dev"

func main() {
	var repoPath = flag.String("repoPath", "", "Mandatory if dataPath is empty: Path to repository. If more than one then seperate by comma without spacing")
	var versionFlag = flag.Bool("version", false, "Show version")

	var yAxis = flag.String("yAxis", "", "Mandatory: Metric for y-axis either churn, commit or growth. churn = linesAdded + linesDeleted, growth = linesAdded - linesDeleted")
	var nodeSize = flag.String("nodeSize", "", "Mandatory: Metric for node size either churn, commit or growth")

	flag.Parse()

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

	

	var res [][]string
	if *repoPath != "" {
		var allRepos []string = strings.Split(*repoPath, ",")

		for _, item := range allRepos {
			var rawData = callGitLog(item)
			parsedData := parseGitLog(rawData, *yAxis, *nodeSize, item)

			res = append(res, parsedData...)
		}

	}

	var writer = csv.NewWriter(os.Stdout)
	defer writer.Flush()

	writer.Write([]string{"repoPath", "date", "author", "fileName", "yAxis", "yAxisMetric", "nodeSize", "nodeSizeMetric"})
	writer.WriteAll(res)

}



