package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"slices"
	"strconv"
	"strings"
)

// default version. Overridden at build time
var version = "dev"

func main() {
	// argument flags
	var repoPath = flag.String("repoPath", "", "Mandatory if dataPath is empty: Path to repository. If more than one then seperate by comma without spacing")
	var dataPath = flag.String("dataPath", "", "Mandatory if repoPath is empty: Path to csv file. \nThe csvfile needs the following syntax: repoPath,date,author,fileName,linesAdded,linesDeleted,yAxis,nodeSize\nExample: /Users/Desktop/Project,2024-10-19,mail@itu.dk,Program.cs,2,6,8,1")
	var savePath = flag.String("savePath", "", "Optional: Path to save data in csv-file.\nOtherwise serves data in memory")
	var versionFlag = flag.Bool("version", false, "Show version")
	var excludeFile = flag.String("excludeFile", "", "RegExp on file names to exclude")
	var excludePath = flag.String("excludePath", "", "RegExp on file paths to exclude")
	var excludeKind = flag.String("excludeKind", "", "RegExp on file kinds to exclude")
	var includeFile = flag.String("includeFile", "", "RegExp on file names to include")
	var includePath = flag.String("includePath", "", "RegExp on file paths to include")
	var includeKind = flag.String("includeKind", "", "RegExp on file kinds to include")
	var yAxis = flag.String("yAxis", "", "Mandatory: Metric for y-axis either churn, commit or growth")
	var nodeSize = flag.String("nodeSize", "", "Mandatory: Metric for node size either churn, commit or growth")
	var numberOfFiles = flag.String("numberOfFiles", "10", "Optional: Number of files per week. Default is 10, max is 20")




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

	// input validation
	if *repoPath == "" && *dataPath == "" || *repoPath != "" && *dataPath != ""{
		log.Fatal("Error: Either -repoPath or -dataPath must be provided.")
	}

	var metricOptions = [] string{"churn", "growth", "commit"}

	if(!slices.Contains(metricOptions, *yAxis)){
		log.Fatal("yAxis argument must be churn, growth or commit")
	}

	if(!slices.Contains(metricOptions, *nodeSize)){
		log.Fatal("nodeSize argument must be churn, growth or commit")
	}

	var filesCount, err = strconv.Atoi(*numberOfFiles)
	if (filesCount > 20 || filesCount < 1 || err != nil) {
		log.Fatal("numberOfFiles must be integer between 1 and 20")
	}

	var metadata = map[string]string{"numberOfFiles":*numberOfFiles, "yAxis":*yAxis, "nodeSize":*nodeSize}

	var res [][] string
	if *repoPath != "" {
		var allRepos[] string = strings.Split(*repoPath, ",")


		for _, item := range allRepos{
			var rawData = callGitLog(item)
			parsedData := parseGitLog(rawData, *excludeFile, *excludePath, *excludeKind, *includeFile, *includePath, *includeKind, *yAxis, *nodeSize, item)

			res = append(res, parsedData...)
		}

	}
	// if data should be saved locally at specified path
	if *savePath != "" {
		var fixedPath = strings.TrimSuffix(*savePath, "/") + "/data.csv"
		fmt.Printf("Saving data file at: " + fixedPath + "\n")

		writeToCSVFile(res, fixedPath)
		setUpServer(fixedPath, nil, metadata)

	} else if *dataPath != ""{
		setUpServer(*dataPath, nil, metadata)
	}else { // if data should be immediately served at /data.csv
		setUpServer("", res, metadata)
	}

}
