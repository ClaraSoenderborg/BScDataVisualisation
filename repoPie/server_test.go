// server_test.go tests that the two endpoints "/" and "/data.csv" work as expected
// Source for testing http in Go: https://speedscale.com/blog/testing-golang-with-httptest/
package main

import (
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestServeCSVFromMemory(t *testing.T){
	var data = [][]string{
		{"repoPath", "date", "author", "fileName", "yAxis", "yAxisMetric", "nodeSize", "nodeSizeMetric"},
		{"test/repo", "2023-10-16", "auso@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
		{"test/repo", "2023-10-16", "sscv@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
		{"test/repo", "2023-10-16", "astb@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
		{"test/repo", "2023-10-16", "jukl@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
	}


	var expected = `repoPath,date,author,fileName,yAxis,yAxisMetric,nodeSize,nodeSizeMetric
test/repo,2023-10-16,auso@itu.dk,src/Car.cs,1,commit,9,churn
test/repo,2023-10-16,sscv@itu.dk,src/Car.cs,1,commit,9,churn
test/repo,2023-10-16,astb@itu.dk,src/Car.cs,1,commit,9,churn
test/repo,2023-10-16,jukl@itu.dk,src/Car.cs,1,commit,9,churn
`

	var handler = startServing(data)

	var w = httptest.NewRecorder()
	var req = httptest.NewRequest("GET","/data.csv", nil)

	handler.ServeHTTP(w, req)

	var response = w.Result()

	if response.StatusCode != http.StatusOK {
		t.Errorf("Expected status code 200, got %d", response.StatusCode)
	}

	var actual, err = io.ReadAll(response.Body)
	if err != nil {
		t.Fatal(err)
	}

	if string(actual) != expected{
		t.Errorf("Expected \n%s, got \n%s", expected, string(actual))
	}


}

func TestServeStaticFiles(t *testing.T){
	var data = [][]string{
		{"repoPath", "date", "author", "fileName", "yAxis", "yAxisMetric", "nodeSize", "nodeSizeMetric"},
		{"test/repo", "2023-10-16", "auso@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
		{"test/repo", "2023-10-16", "sscv@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
		{"test/repo", "2023-10-16", "astb@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
		{"test/repo", "2023-10-16", "jukl@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
	}

	var expected = `<div id="container">`

	var handler = startServing(data)

	var w = httptest.NewRecorder()
	var req = httptest.NewRequest("GET","/", nil)

	handler.ServeHTTP(w, req)

	var response = w.Result()

	if response.StatusCode != http.StatusOK {
		t.Errorf("Expected status code 200, got %d", response.StatusCode)
	}

	var actual, err = io.ReadAll(response.Body)
	if err != nil {
		t.Fatal(err)
	}

	fmt.Println(string(actual))

	if strings.Contains(string(actual), expected){
		t.Errorf("Expected \n%s, got \n%s", expected, string(actual))
	}


}