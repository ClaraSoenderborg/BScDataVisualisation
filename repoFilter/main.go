// repoFilter filters CSV input based on command-line regex filters for file names and paths.
//   - Reads CSV from stdin
//   - Applies include/exclude regex filters
//   - Outputs the filtered data to stdout.

package main

import (
	"encoding/csv"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"regexp"
)

// Default version. Overridden at build time
var version = "dev"

func main() {
	// commandline flags for version and optional flags for regex for excluding and including files
	var versionFlag = flag.Bool("version", false, "Show version")
	var excludeFile = flag.String("excludeFile", "", "Optional: RegExp on file names to exclude")
	var excludePath = flag.String("excludePath", "", "Optional: RegExp on file paths to exclude")
	var includeFile = flag.String("includeFile", "", "Optional: RegExp on file names to include")
	var includePath = flag.String("includePath", "", "Optional: RegExp on file paths to include")


	flag.Usage = func() {
		fmt.Printf(`Usage:
... <CSV-formatted data with headers: repoPath,date,author,fileName,churn,growth,commit> [-excludeFile <regex>] [-excludePath <regex>] [-includeFile <regex>] [-includePath <regex>]
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

	// Stores the provided regex filters in a map
	var regexFilters = map[string]string{
		"excludeFile": *excludeFile,
		"excludePath": *excludePath,
		"includeFile": *includeFile,
		"includePath": *includePath,
	}

	// Set up the csv reader from stdin and writer to stdout
	var reader = csv.NewReader(os.Stdin)
	var writer = csv.NewWriter(os.Stdout)
	defer writer.Flush()

	// Write csv header to stdout
	writer.Write([]string{"repoPath", "date", "author", "fileName", "churn", "growth", "commit"})

	// Read and discard the header
	 _, err := reader.Read()
	 if err != nil {
		 log.Fatalf("Error reading header: %v\n", err)
	 }

	// Filter for each csv row and write if it passes
	for {
		var data, err = reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil{
			log.Fatalf("Error reading csv: %v", err)
		}

		if len(data) >= 7 && addFile(data[3], regexFilters) {
			writer.Write(data)
		}
	}




}

// addFile determines if a file should be included or not based on the include/exclude filters
func addFile(filePath string, regexFilters map[string]string) bool {
	if shouldExcludeFile(filePath, regexFilters["excludeFile"], regexFilters["excludePath"]) {
		return false
	}

	if !shouldIncludeFile(filePath, regexFilters["includeFile"], regexFilters["includePath"]) {
		return false
	}

	return true
}

// shouldExcludeFile checks if a filepath matches the exclude regexes and returns true if they do
func shouldExcludeFile(filePath string, excludeFile string, excludePath string) bool {

	if excludeFile != "" &&  matchRegex(excludeFile, filepath.Base(filePath)) { return true }

	if excludePath != "" && matchRegex(excludePath, filePath) { return true }

	return false
}

// shouldIncluddeFile checks if a filepath matches the include regexes and returns true if they do
func shouldIncludeFile(filePath string, includeFile string, includePath string) bool {
	// Defaults to true to include if filters are not provided
	var includeFileMatch = true
	var includePathMatch = true

	if includeFile != "" {
		var fileName = filepath.Base(filePath)
		includeFileMatch = matchRegex(includeFile, fileName)
	}

	if includePath != "" {
		includePathMatch = matchRegex(includePath, filePath)
	}
	// Only include if both match
	return includeFileMatch && includePathMatch
}

// matchRegex checks if input string matches the regexpattern
func matchRegex(regex string, input string) bool {
	var match, _ = regexp.MatchString(regex, input)
	return match
}
