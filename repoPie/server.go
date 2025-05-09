// server.go in RepoPie is responsible for setting up local server, and serving data and static files 
// Source for embedding and serving static files: https://hakk.dev/blog/posts/go-embed-example/
package main

import (
	"embed"
	"encoding/csv"
	"fmt"
	"io/fs"
	"log"
	"net/http"
)


//go:embed frontend/*
var frontendFiles embed.FS

// serveCSV serves provided csv-data
func serveCSV(w http.ResponseWriter, r *http.Request, data [][]string) {
	// Set the correct content type for CSV
	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", "attachment; filename=data.csv")

	if len(data) == 0 {
		http.Error(w, "No CSV data available", http.StatusInternalServerError)
		return
	}

	var writer = csv.NewWriter(w)
	defer writer.Flush()

	var err = writer.WriteAll(data)
	if err != nil {
		http.Error(w, "Could not write CSV data", http.StatusInternalServerError)
	}
}

// startServing sets up endpoints:
// - "/" for serving static html files
// - "/data.csv" for serving csv-data in memory 
func startServing(data [][]string) http.Handler {
	var mux = http.NewServeMux()

	// source: https://hakk.dev/blog/posts/go-embed-example/
	var htmlContent, err = fs.Sub(frontendFiles, "frontend")
	if err != nil {
		log.Fatal(err)
	}
	mux.Handle("/", http.FileServer(http.FS(htmlContent)))

	mux.HandleFunc("/data.csv", func(w http.ResponseWriter, r *http.Request) {
		serveCSV(w, r, data)
	})

	return mux
}

// setUpServer starts the local http server
func setUpServer(data [][]string) {
	var addr = "127.0.0.1"
	var port = "8080"
	var path = "RepoPie" 

	log.Print(fmt.Sprintf("Serving %s on http://%s:%s", path, addr, port))
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%s:%s", addr, port), startServing(data)))
}
