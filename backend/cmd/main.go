package main

import (
	"encoding/csv"
	"fmt"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"time"
)

var repoPath string

func callGitLog() string{
	var script = `git -C %s log --pretty=format:"%%h %%as %%ae %%(trailers:key=Co-authored-by,valueonly,separator=%%x20)" --numstat --no-merges --no-renames --diff-filter=x`

	var cmd = exec.Command("bash", "-c", fmt.Sprintf(script, repoPath))

	var output, err = cmd.CombinedOutput()
	if (err != nil){
		fmt.Printf("Could not execute command")
	}

	return string(output)
}

func parseCoAuthors (author string) []string {
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
		fmt.Errorf("No parsable co-authors")
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


func parseGitLog (lines string) [][] string {
	var commitSha, timestamp, author, fileName, lineAdd, lineRemove string
	var blockLineCount int
	var result = [][]string{}
	var authors = []string{}
	var timeLayout = "2006-01-02"

	for _, l := range strings.Split (lines, "\n") {
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
				lineAdd, lineRemove, fileName =  fields[0], fields[1], fields[2]
				if addFile(fileName){
					var lineAddInt, _ = strconv.Atoi(lineAdd)
					var lineRemoveInt, _ = strconv.Atoi(lineRemove)
					var parseTime, _ = time.Parse(timeLayout, timestamp)
					var _, weekNumber = parseTime.ISOWeek()

					for _, au := range authors {
					result = append (result, []string{commitSha, timestamp, strconv.Itoa(weekNumber), au, lineAdd, lineRemove, strconv.Itoa(lineAddInt+lineRemoveInt), fileName})
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

func addFile(fileName string) bool{
	var match, _ = regexp.MatchString("^.*(md|gitignore|png|pdf|drawio)$", fileName)

	return !match
}


func parseToCSV(list [][]string){
	for _, line := range list {
		fmt.Println(strings.Join(line, ","))
	}
}

func writeToCSVFile(list [][]string) {
	//var file, err = os.Create("/tmp/data.csv")
	var file, err = os.Create("../../data/data.csv")
	if err != nil {
		fmt.Errorf("Could not create file :(")
	} 

	defer file.Close() 

	var writer = csv.NewWriter(file)
	writer.Write([]string {"commitSHA", "date", "week", "author", "linesAdded", "linesDeleted", "linesChanged", "fileName"})
	writer.WriteAll(list) 

}



func main() {
	repoPath  = os.Args[1]


	var rawData = callGitLog()
	var res = parseGitLog(rawData)
	//parseToCSV(res)
	writeToCSVFile(res)
	//fmt.Printf("%v", res)
	//fmt.Print(rawData)
}

