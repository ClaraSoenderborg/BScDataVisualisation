package main

import (
	"fmt"
	"os"
	"os/exec"
)

var repoPath string 

func callGitLog() string{
	var script = `git -C %s log --pretty=format:"%%h %%an %%as " --numstat`

	var cmd = exec.Command("bash", "-c", fmt.Sprintf(script, repoPath))

	var output, err = cmd.CombinedOutput()
	if (err != nil){
		fmt.Printf("Could not execute command")
	}

	return string(output)
}

func main() {
	repoPath  = os.Args[1]

	var rawData = callGitLog()

	fmt.Print(rawData)
}