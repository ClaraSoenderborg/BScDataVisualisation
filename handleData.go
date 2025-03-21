package main

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

func callGitLog(repoPath string) string {
	var script = `git -C %s log --pretty=format:"%%h %%as %%aE %%(trailers:key=Co-authored-by,valueonly,separator=%%x20)" --numstat --no-merges --no-renames --diff-filter=x`

	var cmd = exec.Command("bash", "-c", fmt.Sprintf(script, repoPath))

	var output, err = cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Could not execute command")
	}

	return string(output)
}

func parseCoAuthors(author string) []string {
	var listCoAuthor []string

	if strings.Contains(author, "<") {
		for {
			var start = strings.Index(author, "<")
			var end = strings.Index(author, ">")
			if start != -1 && end != -1 {
				listCoAuthor = append(listCoAuthor, author[start+1:end])
				author = author[end+1:]
			} else {
				break
			}
		}
	} else {
		log.Printf("Warning: Co-author %s could not be parsed, skipping co-author \n", author)
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

func parseGitLog(lines string, excludeFile string, excludePath string, excludeKind string, yAxis string, nodeSize string) [][]string {
	var commitSha, timestamp, author, fileName, lineAdd, lineRemove string
	var blockLineCount int
	var result = [][]string{}
	var authors = []string{}
	var timeLayout = "2006-01-02"

	for _, l := range strings.Split(lines, "\n") {
		var lineContent = strings.TrimSpace(l)

		if lineContent != "" {
			if blockLineCount == 0 {
				var fields = strings.Fields(lineContent)
				commitSha, timestamp, author = fields[0], fields[1], fields[2]
				authors = append(authors, author)
				if len(fields) > 3 {
					var coAuthors = strings.Join(fields[3:], " ")
					authors = append(authors, parseCoAuthors(coAuthors)...)
					authors = removeDuplicates(authors)
				}
			} else {
				var fields = strings.Fields(lineContent)
				lineAdd, lineRemove, fileName = fields[0], fields[1], fields[2]
				if addFile(fileName, excludeFile, excludePath, excludeKind) {
					var lineAddInt, _ = strconv.Atoi(lineAdd)
					var lineRemoveInt, _ = strconv.Atoi(lineRemove)
					var parseTime, _ = time.Parse(timeLayout, timestamp)
					var _, weekNumber = parseTime.ISOWeek()
					var yAxisValue string
					var nodeSizeValue string


					if (yAxis == "churn"){
						yAxisValue = strconv.Itoa(lineAddInt + lineRemoveInt)
					} else if (yAxis == "growth"){
						yAxisValue = strconv.Itoa(lineAddInt - lineRemoveInt)
					} else if(yAxis == "commit"){
						yAxisValue = "1"
					}

					if (nodeSize == "churn"){
						nodeSizeValue = strconv.Itoa(lineAddInt + lineRemoveInt)
					} else if (nodeSize == "growth"){
						nodeSizeValue = strconv.Itoa(lineAddInt - lineRemoveInt)
					} else if(nodeSize == "commit"){
						nodeSizeValue = "1"
					}

					for _, au := range authors {
						result = append(result, []string{commitSha, timestamp, strconv.Itoa(weekNumber), au, lineAdd, lineRemove, yAxisValue, nodeSizeValue, fileName})
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

func addFile(filePath string, excludeFile string, excludePath string, excludeKind string) bool {
	var addFile = true

	if excludeFile != "" {
		var fileName = filepath.Base(filePath)
		if matchExcludeExp(excludeFile, fileName) {
			addFile = false
		}
	}

	if excludePath != "" {
		if matchExcludeExp(excludePath, filePath) {
			addFile = false
		}
	}

	if excludeKind != "" {
		if matchExcludeExp(excludeKind, getFileKind(filePath)) {
			addFile = false
		}
	}

	return addFile
}

func writeToCSVFile(list [][]string, location string) {
	var file, err = os.Create(location)

	if err != nil {
		log.Fatal("Data file could not be created at path: " + location)
	}

	defer file.Close()

	var writer = csv.NewWriter(file)
	writer.Write([]string{"commitSHA", "date", "week", "author", "linesAdded", "linesDeleted", "yAxis", "nodeSize", "fileName"})
	writer.WriteAll(list)

}
