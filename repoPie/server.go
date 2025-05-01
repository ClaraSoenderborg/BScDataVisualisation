package main

import (
	"embed"
	"encoding/csv"
	"fmt"
	"io/fs"
	"log"
	"net/http"
)

//https://medium.com/@viktordev/socket-programming-in-go-write-a-simple-tcp-client-server-c9609edf3671

//go:embed frontend/*
var frontendFiles embed.FS

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

func setUpServer(data [][]string) {
	var addr = "127.0.0.1"
	var port = "8080"
	var path = "RepoPie" 

	log.Print(fmt.Sprintf("Serving %s on http://%s:%s", path, addr, port))
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%s:%s", addr, port), startServing(data)))
}
