package main

import (
	"flag"
	"fmt"
	"os"
	"strings"
)

// default version. Overwritten at buildtime
var version = "dev"

func main() {

	var repoPath = flag.String("repoPath", "", "Mandatory: Path to repository")
	var dataLocation = flag.String("dataLocation", "", "Optional: Path to save data in csv-file.\nOtherwise serves data in memory")
	var versionFlag = flag.Bool("version", false, "Show version")
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
	if *versionFlag {
		//printVersion()
		fmt.Println("Version:", version)
		os.Exit(0)
	}
	var rawData = callGitLog(*repoPath)
	var res = parseGitLog(rawData)
	//parseToCSV(res)
	if *dataLocation != "" {
		var fixedPath = strings.TrimSuffix(*dataLocation, "/") + "/data.csv"
		fmt.Printf("Saving data file at: " + fixedPath + "\n")

		writeToCSVFile(res, fixedPath)
		setUpServer(fixedPath, nil)

	} else {
		setUpServer("", res)
	}

	//fmt.Printf("%v", res)
	//fmt.Print(rawData)

}
