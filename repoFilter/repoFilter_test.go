package main

import (
	"testing"
)

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
