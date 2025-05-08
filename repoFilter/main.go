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

// default version. Overridden at build time
var version = "dev"

func main() {
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

	// in case of -version
	if *versionFlag {
		fmt.Println("Version:", version)
		os.Exit(0)
	}

	var regexFilters = map[string]string{
		"excludeFile": *excludeFile,
		"excludePath": *excludePath,
		"includeFile": *includeFile,
		"includePath": *includePath,
	}

	var reader = csv.NewReader(os.Stdin)

	var writer = csv.NewWriter(os.Stdout)
	defer writer.Flush()

	writer.Write([]string{"repoPath", "date", "author", "fileName", "churn", "growth", "commit"})
	
	 // Read and discard the header
	 _, err := reader.Read()
	 if err != nil {
		 log.Fatal(os.Stderr, "Error reading header: %v\n", err)
	 }
	
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

func addFile(filePath string, regexFilters map[string]string) bool {
	if shouldExcludeFile(filePath, regexFilters["excludeFile"], regexFilters["excludePath"]) {
		return false
	}

	if !shouldIncludeFile(filePath, regexFilters["includeFile"], regexFilters["includePath"]) {
		return false
	}

	return true
}

func shouldExcludeFile(filePath string, excludeFile string, excludePath string) bool {
	if excludeFile != "" &&  matchRegex(excludeFile, filepath.Base(filePath)) {
		return true
	}

	if excludePath != "" && matchRegex(excludePath, filePath){
		return true
	}

	return false
}

func shouldIncludeFile(filePath string, includeFile string, includePath string) bool {
	var includeFileMatch = true
	var includePathMatch = true

	if includeFile != "" {
		var fileName = filepath.Base(filePath)
		includeFileMatch = matchRegex(includeFile, fileName)
	}

	if includePath != "" {
		includePathMatch = matchRegex(includePath, filePath)
	}

	return includeFileMatch && includePathMatch
}

func matchRegex(regex string, input string) bool {
	var match, _ = regexp.MatchString(regex, input)
	return match
}