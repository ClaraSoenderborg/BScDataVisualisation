package main

import (
	"encoding/csv"
	"fmt"
	"log"
	"net/mail"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

var repoPath string

func callGitLog(repositoryPath string) string {

		repoPath = repositoryPath

		var script = `git -C %s log --pretty=format:"%%as %%aE %%(trailers:key=Co-authored-by,valueonly,separator=%%x7c)" --numstat --no-merges --no-renames --diff-filter=x`

		var cmd = exec.Command("bash", "-c", fmt.Sprintf(script, repoPath))

		var output, err = cmd.CombinedOutput()
		if err != nil {
			fmt.Printf("Could not execute command")
		}

		return string(output)


}

func checkMailMap(author string) string {
	var script = `git -C %s check-mailmap "%s"`
	var cmd = exec.Command("bash", "-c", fmt.Sprintf(script, repoPath, author))

	var output, err = cmd.CombinedOutput()
	if err != nil {
		log.Printf("Could not execute git check-mailmap" + string(output))
	}

	var trimmedOutput = strings.TrimSpace(string(output))

	var emailAddress, emailErr = mail.ParseAddress(trimmedOutput)
	if emailErr != nil {
		log.Printf("Warning email not found from " + trimmedOutput)
		return ""
	}

	return emailAddress.Address
}

func parseCoAuthors(coAuthorString string) []string {
	var listCoAuthor []string

	var splitCoAuthor = strings.Split(coAuthorString, "|")

	for _, author := range splitCoAuthor {
		var properEmail = checkMailMap(author)
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

func parseGitLog(lines string, excludeFile string, excludePath string, excludeKind string, includeFile string, includePath string, includeKind string, yAxis string, nodeSize string, repoPath string) [][]string {
	//fmt.Printf(lines)

	var timestamp, author, fileName, lineAdd, lineRemove string
	var blockLineCount int
	var result = [][]string{}
	var authors = []string{}
	var timeLayout = "2006-01-02"

	for _, l := range strings.Split(lines, "\n") {
		var lineContent = strings.TrimSpace(l)

		if lineContent != "" {
			if blockLineCount == 0 {
				var fields = strings.Fields(lineContent)
				timestamp, author = fields[0], fields[1]
				authors = append(authors, author)
				if len(fields) > 3 {
					var coAuthors = strings.Join(fields[2:], " ")
					authors = append(authors, parseCoAuthors(coAuthors)...)
					authors = removeDuplicates(authors)
				}
			} else {
				var fields = strings.Fields(lineContent)
				lineAdd, lineRemove, fileName = fields[0], fields[1], fields[2]
				if addFile(fileName, excludeFile, excludePath, excludeKind, includeFile, includePath, includeKind) {
					var lineAddInt, _ = strconv.Atoi(lineAdd)
					var lineRemoveInt, _ = strconv.Atoi(lineRemove)
					var parseTime, _ = time.Parse(timeLayout, timestamp)
					var _, weekNumber = parseTime.ISOWeek()
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
						result = append(result, []string{repoPath, strconv.Itoa(weekNumber), au, fileName, lineAdd, lineRemove, strconv.Itoa(yAxisValue), strconv.Itoa(nodeSizeValue)})
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
	fmt.Println(len(result))
	return result
}

func matchExcludeExp(regex string, input string) bool {
	var match, _ = regexp.MatchString(regex, input)
	return match
}

func getFileKind(filepath string) string {
	var cmd = exec.Command("file", "--brief", filepath)

	var output, err = cmd.CombinedOutput()
	if err != nil {
		log.Printf("Could not find file kind for file: %s", filepath)
	}

	return string(output)
}

func shouldExcludeFile(filePath string, excludeFile string, excludePath string, excludeKind string) bool {

    if excludeFile != "" {
        var fileName = filepath.Base(filePath)
        if matchExcludeExp(excludeFile, fileName) {
            return true
        }
    }

    // Exclude by file path
    if excludePath != "" {
        if matchExcludeExp(excludePath, filePath) {
            return true // Exclude if filePath matches excludePath pattern
        }
    }

    // Exclude by file kind
    if excludeKind != "" {
        if matchExcludeExp(excludeKind, getFileKind(filePath)) {
            return true // Exclude if file kind matches excludeKind pattern
        }
    }

    return false
}

func shouldIncludeFile(filePath string, includeFile string, includePath string, includeKind string) bool {

    // Include by file name
    if includeFile != "" {
        var fileName = filepath.Base(filePath)
        if !matchExcludeExp(includeFile, fileName) {
            return false // Exclude if fileName does NOT match includeFile pattern
        }
    }

    // Include by file path
    if includePath != "" {
        if !matchExcludeExp(includePath, filePath) {
            return false // Exclude if filePath does NOT match includePath pattern
        }
    }

    // Include by file kind
    if includeKind != "" {
        if !matchExcludeExp(includeKind, getFileKind(filePath)) {
            return false // Exclude if file kind does NOT match includeKind pattern
        }
    }

    return true
}

func addFile(filePath string, excludeFile string, excludePath string, excludeKind string, includeFile string, includePath string, includeKind string) bool {
    if shouldExcludeFile(filePath, excludeFile, excludePath, excludeKind) {
        return false
    }

	if !shouldIncludeFile(filePath, includeFile, includePath, includeKind) {
		return false
	}

    return true
}


func writeToCSVFile(list [][]string, location string) {
	var file, err = os.Create(location)

	if err != nil {
		log.Fatal("Data file could not be created at path: " + location)
	}

	defer file.Close()

	var writer = csv.NewWriter(file)
	writer.Write([]string{"repoPath", "week", "author", "fileName", "linesAdded", "linesDeleted", "yAxis", "nodeSize"})
	writer.WriteAll(list)

}
