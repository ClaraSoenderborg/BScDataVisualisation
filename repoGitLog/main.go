package main

import (
	"encoding/csv"
	"flag"
	"fmt"
	"log"
	"net/mail"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"slices"
	"strconv"
	"strings"
)

// default version. Overridden at build time
var version = "dev"

func main(){
	var repoPath = flag.String("repoPath", "", "Mandatory if dataPath is empty: Path to repository. If more than one then seperate by comma without spacing")
	var versionFlag = flag.Bool("version", false, "Show version")
	var excludeFile = flag.String("excludeFile", "", "RegExp on file names to exclude")
	var excludePath = flag.String("excludePath", "", "RegExp on file paths to exclude")
	var includeFile = flag.String("includeFile", "", "RegExp on file names to include")
	var includePath = flag.String("includePath", "", "RegExp on file paths to include")

	var yAxis = flag.String("yAxis", "", "Mandatory: Metric for y-axis either churn, commit or growth. churn = linesAdded + linesDeleted, growth = linesAdded - linesDeleted")
	var nodeSize = flag.String("nodeSize", "", "Mandatory: Metric for node size either churn, commit or growth")


	flag.Parse()

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


	var res [][] string
	if *repoPath != "" {
		var allRepos[] string = strings.Split(*repoPath, ",")


		for _, item := range allRepos{
			var rawData = callGitLog(item)
			parsedData := parseGitLog(rawData, *excludeFile, *excludePath, *includeFile, *includePath, *yAxis, *nodeSize, item)

			res = append(res, parsedData...)
		}

	}

	var writer = csv.NewWriter(os.Stdout)
	defer writer.Flush()
	
	writer.Write([]string{"repoPath", "date", "author", "fileName", "yAxis", "yAxisMetric", "nodeSize", "nodeSizeMetric"})
	writer.WriteAll(res)

	

}

func callGitLog(repositoryPath string) string {

	var script = `git -C %s log --pretty=format:"%%as %%aE %%(trailers:key=Co-authored-by,valueonly,separator=%%x7c)" --numstat --no-merges --no-renames --diff-filter=x`

	var cmd = exec.Command("bash", "-c", fmt.Sprintf(script, repositoryPath))

	var output, err = cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Could not execute command")
	}

	return string(output)

}

func checkMailMap(author string, repoPath string) string {
	var script = `git -C %s check-mailmap "%s"`
	var cmd = exec.Command("bash", "-c", fmt.Sprintf(script, repoPath, author))

	var output, err = cmd.CombinedOutput()
	if err != nil {
		log.Printf("Warning: git check-mailmap gave error: " + string(output))
		// author was not found in mailmap, so we will attempt to parse email from original co-author string
		output = []byte(author)
	} 
	
	var trimmedOutput = strings.TrimSpace(string(output))
	
	var emailAddress, emailErr = mail.ParseAddress(trimmedOutput)
	if emailErr != nil {
		
		log.Printf("Warning: email not parsed from " + trimmedOutput)
		return ""
	}

	return emailAddress.Address
}

func parseCoAuthors(coAuthorString string, repoPath string) []string {
	var listCoAuthor []string

	var splitCoAuthor = strings.Split(coAuthorString, "|")

	for _, author := range splitCoAuthor {
		var properEmail = checkMailMap(author, repoPath)
		if properEmail != "" {
			listCoAuthor = append(listCoAuthor, properEmail)
		}
	}

	return listCoAuthor

}

func removeDuplicates(list []string) []string {
	var keyMap = make(map[string]bool)
	var result = []string{}
	for _, item := range list {
		var _, exists = keyMap[item]
		if !exists {
			keyMap[item] = true
			result = append(result, item)
		}
	}
	return result
}

func parseGitLog(lines string, excludeFile string, excludePath string, includeFile string, includePath string, yAxis string, nodeSize string, repoPath string) [][]string {
	var timestamp, author, fileName, lineAdd, lineRemove string
	var blockLineCount int
	var result = [][]string{}
	var authors = []string{}

	for _, l := range strings.Split(lines, "\n") {
		var lineContent = strings.TrimSpace(l)

		if lineContent != "" {
			if blockLineCount == 0 {
				var fields = strings.Fields(lineContent)
				timestamp, author = fields[0], fields[1]
				authors = append(authors, author)
				if len(fields) > 3 {
					var coAuthors = strings.Join(fields[2:], " ")
					authors = append(authors, parseCoAuthors(coAuthors, repoPath)...)
					authors = removeDuplicates(authors)
				}
			} else {
				var fields = strings.Fields(lineContent)
				lineAdd, lineRemove, fileName = fields[0], fields[1], fields[2]
				if addFile(fileName, excludeFile, excludePath, includeFile, includePath) {
					var lineAddInt, _ = strconv.Atoi(lineAdd)
					var lineRemoveInt, _ = strconv.Atoi(lineRemove)
					var yAxisValue int
					var nodeSizeValue int


					if (yAxis == "churn"){
						yAxisValue = lineAddInt + lineRemoveInt
					} else if (yAxis == "growth"){
						yAxisValue = lineAddInt - lineRemoveInt
					} else if(yAxis == "commit"){
						yAxisValue = 1
					}

					if (nodeSize == "churn"){
						nodeSizeValue = lineAddInt + lineRemoveInt
					} else if (nodeSize == "growth"){
						nodeSizeValue = lineAddInt - lineRemoveInt
					} else if(nodeSize == "commit"){
						nodeSizeValue = 1
					}

					if(yAxisValue > 0 && nodeSizeValue > 0){
					for _, au := range authors {
						result = append(result, []string{repoPath, timestamp, au, fileName, strconv.Itoa(yAxisValue), yAxis, strconv.Itoa(nodeSizeValue), nodeSize})
					}
				}
				}
			}
			blockLineCount++
		}

		if lineContent == "" {
			blockLineCount = 0
			authors = nil
		}
	}
	return result
}

func matchExcludeExp(regex string, input string) bool {
	var match, _ = regexp.MatchString(regex, input)
	return match
}

func shouldExcludeFile(filePath string, excludeFile string, excludePath string) bool {

    if excludeFile != "" {
        var fileName = filepath.Base(filePath)
        if matchExcludeExp(excludeFile, fileName) {
            return true
        }
    }

    if excludePath != "" {
        if matchExcludeExp(excludePath, filePath) {
            return true
        }
    }


    return false
}

func shouldIncludeFile(filePath string, includeFile string, includePath string) bool {

    if includeFile != "" {
        var fileName = filepath.Base(filePath)
        if !matchExcludeExp(includeFile, fileName) {
            return false
        }
    }

    if includePath != "" {
        if !matchExcludeExp(includePath, filePath) {
            return false
        }
    }

    return true
}

func addFile(filePath string, excludeFile string, excludePath string, includeFile string, includePath string) bool {
    if shouldExcludeFile(filePath, excludeFile, excludePath) {
        return false
    }

	if !shouldIncludeFile(filePath, includeFile, includePath) {
		return false
	}

    return true
}


