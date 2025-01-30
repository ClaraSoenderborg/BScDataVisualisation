package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
)

var repoPath string 

func callGitLog() string{
	var script = `git -C %s log --pretty=format:"%%h %%as %%ae %%(trailers:key=Co-authored-by,valueonly,separator="-")" --numstat --no-merges`

	var cmd = exec.Command("bash", "-c", fmt.Sprintf(script, repoPath))

	var output, err = cmd.CombinedOutput()
	if (err != nil){
		fmt.Printf("Could not execute command")
	}

	return string(output)
}

/* func parseCoAuthors (author string){

} */


func parseGitLog (lines string) [][] string {
	var commitSha, timestamp, author, fileName, lineAdd, lineRemove string 
	var blockLineCount int 
	var result = [][]string{}

	for _, l := range strings.Split (lines, "\n") {
		var lineContent = strings.TrimSpace(l) 

		if lineContent != "" {
			if blockLineCount == 0 {
				var fields = strings.Fields(lineContent)
				commitSha, timestamp, author = fields[0], fields[1], fields[2]
			} else {
				var fields = strings.Fields(lineContent)
				lineAdd, lineRemove, fileName =  fields[0], fields[1], fields[2]
				result = append (result, []string{commitSha, timestamp, author, lineAdd, lineRemove, fileName})

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

	fmt.Print(rawData)
}

