package main

import (
	"flag"
	"fmt"

)



func main() {

	var repoPath = flag.String( "repoPath", "default", "help message hihi")
	flag.String( "dataLocation", "default", "help message hihi")

	flag.Usage = func () {
	fmt.Printf("usage \n")
	flag.PrintDefaults()
	}
	flag.Parse()

	var rawData = callGitLog(*repoPath)
	var res = parseGitLog(rawData)
	//parseToCSV(res)
	writeToCSVFile(res)
	//fmt.Printf("%v", res)
	//fmt.Print(rawData)

	setUpServer()
}
