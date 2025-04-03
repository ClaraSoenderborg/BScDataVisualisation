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
	var repoPath = flag.String("repoPath", "", "Mandatory: Path to repository. If more than one then seperate by comma without spacing")
	var dataPath = flag.String("dataPath", "", "Mandatory: Path to csv file. If more than one then seperate by comma without spacing.\nThe csvfile needs the following syntax: commitSHA,date,week,author,linesAdded,linesDeleted,yAxis,nodeSize,fileName,repoPath\nExample: b55a306,2023-09-12,37,mail@itu.dk,2,6,8,1,Project/Program.cs,/Users/Desktop/")
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

	var metadata = map[string]string{"numberOfFiles":*numberOfFiles, "yAxis":*yAxis, "nodeSize":*nodeSize}




	var res [][] string
	if *repoPath != "" && *dataPath == ""{
		var allRepos[] string = strings.Split(*repoPath, ",")


		for _, item := range allRepos{
			var rawData = callGitLog(item)
			parsedData := parseGitLog(rawData, *excludeFile, *excludePath, *excludeKind, *yAxis, *nodeSize, item)
			fmt.Println("hej1")

			for _, row := range parsedData {
				res = append(res, row)
			}
		}

	} /*else if *repoPath == "" && *dataPath != ""{
		var allData[] string = strings.Split(*dataPath, ",")

		for _, item := range allData {
			f, err := os.Open(item)
			if err != nil {
				log.Fatal("Unable to read input file " + item, err)
			}

			fmt.Println("Reading file:", item)

			csvReader := csv.NewReader(f)
			records, err := csvReader.ReadAll()

			if err != nil {
				log.Printf("Warning: Unable to parse file as CSV for " + item, err)
			}


			defer f.Close()

			// If valid, append the records to the result
			for _, record := range records {
				res = append(res, record)
				fmt.Println(record)

			}
		}
	}*/


		// if data should be saved locally at specified path
		if *dataLocation != "" {
			var fixedPath = strings.TrimSuffix(*dataLocation, "/") + "/data.csv"
			fmt.Printf("Saving data file at: " + fixedPath + "\n")

			writeToCSVFile(res, fixedPath)
			setUpServer(fixedPath, nil, metadata)

		} else if *dataPath != ""{
			setUpServer(*dataPath, nil, metadata)
		}else { // if data should be immediately served at /data.csv
			setUpServer("", res, metadata)
		}

}
