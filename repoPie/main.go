package main

import (
	"encoding/csv"
	"flag"
	"fmt"
	"log"
	"os"
	"github.com/google/go-cmp/cmp"
)

// default version. Overridden at build time
var version = "dev"



func main() {
	// argument flags
	
	var versionFlag = flag.Bool("version", false, "Show version")

	// usage documentation for tool
	flag.Usage = func() {
		fmt.Printf(`Usage:
... -h --help
... --version

Options:` + "\n" + `
  -h --help
        Show this screen.` + "\n")
		flag.PrintDefaults()
	}

	flag.Parse()

	// in case of -version
	if *versionFlag {
		fmt.Println("Version:", version)
		os.Exit(0)
	}

	var reader = csv.NewReader(os.Stdin)
	var data, err = reader.ReadAll()
	if err != nil{
		log.Fatalf("Error reading csv: %v", err)
	}
	
	var headers = []string{"repoPath", "date", "author", "fileName", "yAxis", "yAxisMetric", "nodeSize", "nodeSizeMetric"}

	if !cmp.Equal(data[0], headers){
		log.Fatalf("Headers should be %v but received headers %v", headers, data[0])
	}

	setUpServer(data)
	

}
