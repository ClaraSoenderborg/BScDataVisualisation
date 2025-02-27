package main

import (
	"embed"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

//https://medium.com/@viktordev/socket-programming-in-go-write-a-simple-tcp-client-server-c9609edf3671

//go:embed frontend/*
var frontendFiles embed.FS

func serveCSV(w http.ResponseWriter, r *http.Request){
	var path = "/tmp/data.csv"

	file, err := os.Open(path)
	if err != nil {
		http.Error(w, "Could not open CSV file", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	
	// Set the correct content type for CSV
	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", "attachment; filename=data.csv")

	// Write the file contents to the response
	_, err = io.Copy(w, file)
	if err != nil {
		http.Error(w, "Could not read CSV file", http.StatusInternalServerError)
	}
}

func startServing() http.Handler {
	//Maybe we dont need mux?
	var mux = http.NewServeMux()

	mux.Handle("/", http.StripPrefix("/", http.FileServer(http.FS(frontendFiles))))
	mux.HandleFunc("/data.csv", serveCSV)

	return mux
}

func setUpServer() {
	var addr = "127.0.0.1"
	var port = "8080"
	var path = "cunt" //TODO fix this

	log.Print(fmt.Sprintf("Serving %s on http://%s:%s", path, addr, port))
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%s:%s", addr, port), startServing()))
}
