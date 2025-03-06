package main

import (
	"embed"
	"encoding/csv"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

//https://medium.com/@viktordev/socket-programming-in-go-write-a-simple-tcp-client-server-c9609edf3671

//go:embed frontend/*
var frontendFiles embed.FS

func serveCSV(w http.ResponseWriter, r *http.Request, dataLocation string, data [][]string) {
	//var path = "/tmp/data.csv"

	// Set the correct content type for CSV
	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", "attachment; filename=data.csv")

	if dataLocation != "" {
		file, err := os.Open(dataLocation)
		if err != nil {
			http.Error(w, "Could not open CSV file", http.StatusInternalServerError)
			return
		}
		defer file.Close()

		// Write the file contents to the response
		_, err = io.Copy(w, file)
		if err != nil {
			http.Error(w, "Could not read CSV file", http.StatusInternalServerError)
		}
	} else if data != nil {
		if len(data) == 0 {
			http.Error(w, "No CSV data available", http.StatusInternalServerError)
			return
		}
		
		var writer = csv.NewWriter(w)
		defer writer.Flush()
		
		writer.Write([]string{"commitSHA", "date", "week", "author", "linesAdded", "linesDeleted", "linesChanged", "fileName"})
		var err = writer.WriteAll(data)
		if err != nil {
			http.Error(w, "Could not write CSV data", http.StatusInternalServerError)
		}
	}

}

func startServing(dataLocation string, data [][]string) http.Handler {
	//Maybe we dont need mux?
	var mux = http.NewServeMux()

	mux.Handle("/", http.StripPrefix("/", http.FileServer(http.FS(frontendFiles))))

	mux.HandleFunc("/data.csv", func(w http.ResponseWriter, r *http.Request) {
		serveCSV(w, r, dataLocation, data)
	})

	return mux
}

func setUpServer(dataLocation string, data [][]string) {
	var addr = "127.0.0.1"
	var port = "8080"
	var path = "cunt" //TODO fix this

	log.Print(fmt.Sprintf("Serving %s on http://%s:%s", path, addr, port))
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%s:%s", addr, port), startServing(dataLocation, data)))
}
