package main

import (
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
	// argument flags
	var repoPath = flag.String("repoPath", "", "Mandatory: Path to repository")
	var dataLocation = flag.String("dataLocation", "", "Optional: Path to save data in csv-file.\nOtherwise serves data in memory")
	var versionFlag = flag.Bool("version", false, "Show version")
	var excludeFile = flag.String("excludeFile", "", "RegExp on file names to exclude")
	var excludePath = flag.String("excludePath", "", "RegExp on file paths to exclude")
	var excludeKind = flag.String("excludeKind", "", "RegExp on file kinds to exclude")
	var yAxis = flag.String("yAxis", "", "Mandatory: Metric for y-axis")
	var nodeSize = flag.String("nodeSize", "", "Mandatory: Metric for node size")
	var numberOfFiles = flag.String("numberOfFiles", "10", "Optional: Number of files per week")



	// usage documentation for tool
	flag.Usage = func() {
		fmt.Printf(`Usage:
... [-repoPath <path_to_repository>] [-dataLocation <path_to_data>]
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

	var metricOptions = [] string{"churn", "growth", "commit"}
	if(!slices.Contains(metricOptions, *yAxis)){
		log.Fatal("yAxis argument must be churn, growth or commit")
	}
	if(!slices.Contains(metricOptions, *nodeSize)){
		log.Fatal("nodeSize argument must be churn, growth or commit")
	}

	var metadata = map[string]string{"numberOfFiles":*numberOfFiles, "yAxis":*yAxis, "nodeSize":*nodeSize}
	

	var rawData = callGitLog(*repoPath)
	var res = parseGitLog(rawData, *excludeFile, *excludePath, *excludeKind, *yAxis, *nodeSize)

	// if data should be saved locally at specified path
	if *dataLocation != "" {
		var fixedPath = strings.TrimSuffix(*dataLocation, "/") + "/data.csv"
		fmt.Printf("Saving data file at: " + fixedPath + "\n")

		writeToCSVFile(res, fixedPath)
		setUpServer(fixedPath, nil, metadata)

	} else { // if data should be immediately served at /data.csv
		setUpServer("", res, metadata)
	}

}
