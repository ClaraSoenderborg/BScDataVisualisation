package main

import (
	"os"
)

func main() {
	repoPath = os.Args[1]

	var rawData = callGitLog()
	var res = parseGitLog(rawData)
	//parseToCSV(res)
	writeToCSVFile(res)
	//fmt.Printf("%v", res)
	//fmt.Print(rawData)

	setUpServer()
}
