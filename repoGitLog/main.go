// repoGitLog takes git commit data from one or more repositories and outputs it as CSV with the headers
// - Input is one or more git repository paths
// - Fetches and parses the commit data
// - Outputs the CSV with headers: "repoPath", "date", "author", "fileName", "churn", "growth", "commit"

package main

import (
	"encoding/csv"
	"flag"
	"fmt"
	"os"
	"strings"
)

// Default version. Overridden at build time
var version = "dev"

func main() {
	// Flags for repository path and version display
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

	// Print version in case of -version
	if *versionFlag {
		fmt.Println("Version:", version)
		os.Exit(0)
	}


	// Process each repository if provided
	var res [][]string
	if *repoPath != "" {
		var allRepos []string = strings.Split(*repoPath, ",")

		for _, item := range allRepos {

			// Calls `callGitLog` to fetch the raw git log data
			var rawData = callGitLog(item)

			// Calls `parseGitLog` to parse the raw data and append it to `res`
			parsedData := parseGitLog(rawData, item)
			res = append(res, parsedData...)

		}
		
	}

	// Set up the csv writer to write data to stdout
	var writer = csv.NewWriter(os.Stdout)
	defer writer.Flush()

	writer.Write([]string{"repoPath", "date", "author", "fileName", "churn", "growth", "commit"})
	writer.WriteAll(res)

}



