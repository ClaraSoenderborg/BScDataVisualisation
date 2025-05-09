package main

import (
	"io"
	"log"
	"testing"
	"github.com/google/go-cmp/cmp"
)

func TestParseGitLog(t *testing.T) {
	// discard log messages for testing
	log.SetOutput(io.Discard)

	var input = `2023-10-16 auso@itu.dk Sarah <sscv@itu.dk>|Astrid <astb@itu.dk>|Julia <jukl@itu.dk>
5       4       src/Car.cs`

	var repoPath = "test/repo"


	var expected = [][]string{
		{repoPath, "2023-10-16", "auso@itu.dk", "src/Car.cs", "9", "1", "1"},
		{repoPath, "2023-10-16", "sscv@itu.dk", "src/Car.cs", "9", "1", "1"},
		{repoPath, "2023-10-16", "astb@itu.dk", "src/Car.cs", "9", "1", "1"},
		{repoPath, "2023-10-16", "jukl@itu.dk", "src/Car.cs", "9", "1", "1"},
	}

	var actual = parseGitLog(input, repoPath)

	if !cmp.Equal(expected, actual) {
		t.Errorf("Expected %s,\n but got %s\n", expected, actual)
	}
}



