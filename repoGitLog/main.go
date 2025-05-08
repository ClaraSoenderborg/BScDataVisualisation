package main

import (
	"encoding/csv"
	"flag"
	"fmt"
	"os"
	"strings"
)

// default version. Overridden at build time
var version = "dev"

func main() {
	var repoPath = flag.String("repoPath", "", "Mandatory: Path to repository. If more than one then seperate by comma without spacing")
	var versionFlag = flag.Bool("version", false, "Show version")

	flag.Usage = func() {
		fmt.Printf(`Usage:
... -repoPath <path to one or more repositories>
... -h --help
... --version

Options:` + "\n" + `
  -h --help
        Show this screen.` + "\n")
		flag.PrintDefaults()
		fmt.Printf("\nFor more documentation, see readme at https://github.com/ClaraSoenderborg/BScDataVisualisation/")
	}

	flag.Parse()

	if *versionFlag {
		fmt.Println("Version:", version)
		os.Exit(0)
	}


	var res [][]string
	if *repoPath != "" {
		var allRepos []string = strings.Split(*repoPath, ",")

		for _, item := range allRepos {
			var rawData = callGitLog(item)
			parsedData := parseGitLog(rawData, item)

			res = append(res, parsedData...)
		}

	}

	var writer = csv.NewWriter(os.Stdout)
	defer writer.Flush()

	writer.Write([]string{"repoPath", "date", "author", "fileName", "churn", "growth", "commit"})
	writer.WriteAll(res)

}



