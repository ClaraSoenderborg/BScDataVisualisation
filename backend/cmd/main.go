package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
)

var repoPath string 

func callGitLog() string{
	var script = `git -C %s log --pretty=format:"%%h %%as %%ae %%(trailers:key=Co-authored-by,valueonly,separator=%%x20)" --numstat --no-merges`

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
			result = append(list, item)
		}
	}
	return result
}


func parseGitLog (lines string) [][] string {
	var commitSha, timestamp, author, fileName, lineAdd, lineRemove string 
	var blockLineCount int 
	var result = [][]string{}
	var authors = []string{}

	for _, l := range strings.Split (lines, "\n") {
		var lineContent = strings.TrimSpace(l) 

		if lineContent != "" {
			if blockLineCount == 0 {
				var fields = strings.Fields(lineContent)
				commitSha, timestamp, author = fields[0], fields[1], fields[2]
				if len(fields) > 3 {
					var coAuthors = strings.Join(fields[3:], " ")
					authors = append(parseCoAuthors(coAuthors), author)
					authors = removeDuplicates(authors)
				}
			} else {
				var fields = strings.Fields(lineContent)
				lineAdd, lineRemove, fileName =  fields[0], fields[1], fields[2]
				for _, au := range authors {
					result = append (result, []string{commitSha, timestamp, au, lineAdd, lineRemove, fileName})
				}
			}
			blockLineCount++ 
		}
		

		if lineContent == "" {
			blockLineCount = 0

		}
	}
	return result
} 






func main() {
	repoPath  = os.Args[1]

	
	var rawData = callGitLog()
	parseGitLog(rawData)

	//fmt.Printf("%v", res)
	//fmt.Print(rawData)
}

