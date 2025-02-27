package main

import (
	"embed"
	"fmt"
	"log"
	"net/http"
)

//https://medium.com/@viktordev/socket-programming-in-go-write-a-simple-tcp-client-server-c9609edf3671

//go:embed frontend/*
var frontendFiles embed.FS

func startServing(pathToServe string) http.Handler {
	//Maybe we dont need mux?
	mux := http.NewServeMux()

	mux.Handle("/", http.StripPrefix("/", http.FileServer(http.FS(frontendFiles))))

	return mux
}

func setUpServer() {
	addr := "127.0.0.1"
	port := "8080"
	path := "."

	log.Print(fmt.Sprintf("Serving %s on http://%s:%s", path, addr, port))
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%s:%s", addr, port), startServing(path)))
}
