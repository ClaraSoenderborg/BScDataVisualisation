package main

import (
	"flag"
	"fmt"
	"strings"
)



func main() {

	var repoPath = flag.String( "repoPath", "default", "help message hihi")
	var dataLocation = flag.String( "dataLocation", "", "help message hihi")

	flag.Usage = func () {
		fmt.Printf("usage \n")
		flag.PrintDefaults()
	}
	flag.Parse()

	var rawData = callGitLog(*repoPath)
	var res = parseGitLog(rawData)
	//parseToCSV(res)
	if (*dataLocation != ""){
		var fixedPath = strings.TrimSuffix(*dataLocation, "/") + "/data.csv"
		fmt.Printf("Saving data file at: " + fixedPath + "\n")

		writeToCSVFile(res, fixedPath)
		setUpServer(fixedPath, nil)
		
	} else {
		setUpServer("", res)
	}
	
	//fmt.Printf("%v", res)
	//fmt.Print(rawData)

	
}
