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
	
	var excludeFile = ""
	var excludePath = ""
	var includeFile = ""
	var includePath = ""
	var yAxis = "churn"
	var nodeSize = "growth"
	var repoPath = "test/repo"


	var expected = [][]string{
		{repoPath, "2023-10-16", "auso@itu.dk", "src/Car.cs", "9", "churn", "1", "growth"},
		{repoPath, "2023-10-16", "sscv@itu.dk", "src/Car.cs", "9", "churn", "1", "growth"},
		{repoPath, "2023-10-16", "astb@itu.dk", "src/Car.cs", "9", "churn", "1", "growth"},
		{repoPath, "2023-10-16", "jukl@itu.dk", "src/Car.cs", "9", "churn", "1", "growth"},
	}

	var regexFilters = map[string]string{
		"excludeFile": excludeFile,
		"excludePath": excludePath,
		"includeFile": includeFile,
		"includePath": includePath,
	}

	var actual = parseGitLog(input, regexFilters, yAxis, nodeSize, repoPath)

	if !cmp.Equal(expected, actual) {
		t.Errorf("Expected %s,\n but got %s\n", expected, actual)
	}
}

func TestParseGitLogGrowthCommit(t *testing.T) {
	// discard log messages for testing
	log.SetOutput(io.Discard)

	var input = `2023-10-16 auso@itu.dk Sarah <sscv@itu.dk>|Astrid <astb@itu.dk>|Julia <jukl@itu.dk>
5       4       src/Car.cs`
	
	var excludeFile = ""
	var excludePath = ""
	var includeFile = ""
	var includePath = ""
	var yAxis = "growth"
	var nodeSize = "commit"
	var repoPath = "test/repo"

	var regexFilters = map[string]string{
		"excludeFile": excludeFile,
		"excludePath": excludePath,
		"includeFile": includeFile,
		"includePath": includePath,
	}


	var expected = [][]string{
		{repoPath, "2023-10-16", "auso@itu.dk", "src/Car.cs", "1", "growth", "1", "commit"},
		{repoPath, "2023-10-16", "sscv@itu.dk", "src/Car.cs", "1", "growth", "1", "commit"},
		{repoPath, "2023-10-16", "astb@itu.dk", "src/Car.cs", "1", "growth", "1", "commit"},
		{repoPath, "2023-10-16", "jukl@itu.dk", "src/Car.cs", "1", "growth", "1", "commit"},
	}

	var actual = parseGitLog(input, regexFilters, yAxis, nodeSize, repoPath)

	if !cmp.Equal(expected, actual) {
		t.Errorf("Expected %s,\n but got %s\n", expected, actual)
	}
}

func TestParseGitLogCommitChurn(t *testing.T) {
	// discard log messages for testing
	log.SetOutput(io.Discard)

	var input = `2023-10-16 auso@itu.dk Sarah <sscv@itu.dk>|Astrid <astb@itu.dk>|Julia <jukl@itu.dk>
5       4       src/Car.cs`
	
	var excludeFile = ""
	var excludePath = ""
	var includeFile = ""
	var includePath = ""
	var yAxis = "commit"
	var nodeSize = "churn"
	var repoPath = "test/repo"

	var regexFilters = map[string]string{
		"excludeFile": excludeFile,
		"excludePath": excludePath,
		"includeFile": includeFile,
		"includePath": includePath,
	}


	var expected = [][]string{
		{repoPath, "2023-10-16", "auso@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
		{repoPath, "2023-10-16", "sscv@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
		{repoPath, "2023-10-16", "astb@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
		{repoPath, "2023-10-16", "jukl@itu.dk", "src/Car.cs", "1", "commit", "9", "churn"},
	}

	var actual = parseGitLog(input, regexFilters, yAxis, nodeSize, repoPath)

	if !cmp.Equal(expected, actual) {
		t.Errorf("Expected %s,\n but got %s\n", expected, actual)
	}


}

/*
------------------ addFile tests -----------------------
*/

func TestAddFileIncludeFileTrue(t *testing.T) {
	var filePath = "src/core/Program.cs"

	var excludeFile = ""
	var excludePath = ""
	var includeFile = ""
	var includePath = `Program\.cs$`

	var regexFilters = map[string]string{
		"excludeFile": excludeFile,
		"excludePath": excludePath,
		"includeFile": includeFile,
		"includePath": includePath,
	}

	var expected = true

	var actual = addFile(filePath, regexFilters)

	if expected != actual {
		t.Errorf("Expected %t, but got %t\n", expected, actual)
	}
}

func TestAddFileExcludeFileFalse(t *testing.T) {
	var filePath = "src/core/Program.cs"

	var excludeFile = `Program\.cs$`
	var excludePath = ""
	var includeFile = ""
	var includePath = ""
	
	var regexFilters = map[string]string{
		"excludeFile": excludeFile,
		"excludePath": excludePath,
		"includeFile": includeFile,
		"includePath": includePath,
	}

	var expected = false

	var actual = addFile(filePath, regexFilters)

	if expected != actual {
		t.Errorf("Expected %t, but got %t\n", expected, actual)
	}
}

func TestAddFileIncludePathTrue(t *testing.T) {
	var filePath = "src/Pages/something.cshtml"

	var excludeFile = ""
	var excludePath = ""
	var includeFile = ""
	var includePath = `Pages\/`

	var regexFilters = map[string]string{
		"excludeFile": excludeFile,
		"excludePath": excludePath,
		"includeFile": includeFile,
		"includePath": includePath,
	}

	var expected = true

	var actual = addFile(filePath, regexFilters)

	if expected != actual {
		t.Errorf("Expected %t, but got %t\n", expected, actual)
	}
}

func TestAddFileIncludePathFalse(t *testing.T) {
	var filePath = "src/Car.cs"

	var excludeFile = ""
	var excludePath = ""
	var includeFile = ""
	var includePath = `Pages\/`

	var regexFilters = map[string]string{
		"excludeFile": excludeFile,
		"excludePath": excludePath,
		"includeFile": includeFile,
		"includePath": includePath,
	}

	var expected = false

	var actual = addFile(filePath, regexFilters)

	if expected != actual {
		t.Errorf("Expected %t, but got %t\n", expected, actual)
	}
}

func TestAddFileExcludePathFalse(t *testing.T) {
	var filePath = "src/core/CarRepository.cs"

	
	var excludeFile = ""
	var excludePath = `Repository`
	var includeFile = ""
	var includePath = ""

	var regexFilters = map[string]string{
		"excludeFile": excludeFile,
		"excludePath": excludePath,
		"includeFile": includeFile,
		"includePath": includePath,
	}

	var expected = false

	var actual = addFile(filePath, regexFilters)

	if expected != actual {
		t.Errorf("Expected %t,but got %t\n", expected, actual)
	}
}

func TestAddFileCombiFalse(t *testing.T) {
	var filePath = "src/core/CarRepository.cs"

	var excludeFile = ""
	var excludePath = `Repository`
	var includeFile = `\.cs$`
	var includePath = ""

	var regexFilters = map[string]string{
		"excludeFile": excludeFile,
		"excludePath": excludePath,
		"includeFile": includeFile,
		"includePath": includePath,
	}

	var expected = false

	var actual = addFile(filePath, regexFilters)

	if expected != actual {
		t.Errorf("Expected %t, but got %t\n", expected, actual)
	}
}

func TestAddFileCombiTrue(t *testing.T) {
	var filePath = "src/core/Car.cs"

	var excludeFile = ""
	var excludePath = `Repository`
	var includeFile = `\.cs$`
	var includePath = ""

	var regexFilters = map[string]string{
		"excludeFile": excludeFile,
		"excludePath": excludePath,
		"includeFile": includeFile,
		"includePath": includePath,
	}

	var expected = true

	var actual = addFile(filePath, regexFilters)

	if expected != actual {
		t.Errorf("Expected %t, but got %t\n", expected, actual)
	}
}
