package main

import (
	"io"
	"log"
	"testing"
	"github.com/google/go-cmp/cmp"
)

/*
------------------ parseGitLog tests -----------------------
*/
func TestParseGitLogChurnGrowth(t *testing.T) {
	// discard log messages for testing
	log.SetOutput(io.Discard)

	var input = `2023-10-16 auso@itu.dk Sarah <sscv@itu.dk>|Astrid <astb@itu.dk>|Julia <jukl@itu.dk>
5       4       src/Car.cs`

	var repoPath = "test/repo"


	var expected = [][]string{
		{repoPath, "2023-10-16", "auso@itu.dk", "src/Car.cs", "9", "churn", "1", "growth"},
		{repoPath, "2023-10-16", "sscv@itu.dk", "src/Car.cs", "9", "churn", "1", "growth"},
		{repoPath, "2023-10-16", "astb@itu.dk", "src/Car.cs", "9", "churn", "1", "growth"},
		{repoPath, "2023-10-16", "jukl@itu.dk", "src/Car.cs", "9", "churn", "1", "growth"},
	}


	var actual = parseGitLog(input, repoPath)

	if !cmp.Equal(expected, actual) {
		t.Errorf("Expected %s,\n but got %s\n", expected, actual)
	}
}

func TestParseGitLogGrowthCommit(t *testing.T) {
	// discard log messages for testing
	log.SetOutput(io.Discard)

	var input = `2023-10-16 auso@itu.dk Sarah <sscv@itu.dk>|Astrid <astb@itu.dk>|Julia <jukl@itu.dk>
5       4       src/Car.cs`



	var repoPath = "test/repo"




	var expected = [][]string{
		{repoPath, "2023-10-16", "auso@itu.dk", "src/Car.cs", "1", "growth", "1", "commit"},
		{repoPath, "2023-10-16", "sscv@itu.dk", "src/Car.cs", "1", "growth", "1", "commit"},
		{repoPath, "2023-10-16", "astb@itu.dk", "src/Car.cs", "1", "growth", "1", "commit"},
		{repoPath, "2023-10-16", "jukl@itu.dk", "src/Car.cs", "1", "growth", "1", "commit"},
	}

	var actual = parseGitLog(input, repoPath)

	if !cmp.Equal(expected, actual) {
		t.Errorf("Expected %s,\n but got %s\n", expected, actual)
	}
}

func TestParseGitLogCommitChurn(t *testing.T) {
	// discard log messages for testing
	log.SetOutput(io.Discard)

	var input = `2023-10-16 auso@itu.dk Sarah <sscv@itu.dk>|Astrid <astb@itu.dk>|Julia <jukl@itu.dk>
5       4       src/Car.cs`


	var repoPath = "test/repo"




	var expected = [][]string{
		{repoPath, "2023-10-16", "auso@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
		{repoPath, "2023-10-16", "sscv@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
		{repoPath, "2023-10-16", "astb@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
		{repoPath, "2023-10-16", "jukl@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
	}

	var actual = parseGitLog(input, repoPath)

	if !cmp.Equal(expected, actual) {
		t.Errorf("Expected %s,\n but got %s\n", expected, actual)
	}


}


