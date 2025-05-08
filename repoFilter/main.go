package main

import (
	"path/filepath"
	"regexp"
)

func addFile(filePath string, regexFilters map[string]string) bool {
	if shouldExcludeFile(filePath, regexFilters["excludeFile"], regexFilters["excludePath"]) {
		return false
	}

	if !shouldIncludeFile(filePath, regexFilters["includeFile"], regexFilters["includePath"]) {
		return false
	}

	return true
}

func shouldExcludeFile(filePath string, excludeFile string, excludePath string) bool {
	if excludeFile != "" &&  matchRegex(excludeFile, filepath.Base(filePath)) {
		return true
	}

	if excludePath != "" && matchRegex(excludePath, filePath){
		return true
	}

	return false
}

func shouldIncludeFile(filePath string, includeFile string, includePath string) bool {
	var includeFileMatch = true
	var includePathMatch = true

	if includeFile != "" {
		var fileName = filepath.Base(filePath)
		includeFileMatch = matchRegex(includeFile, fileName)
	}

	if includePath != "" {
		includePathMatch = matchRegex(includePath, filePath)
	}

	return includeFileMatch && includePathMatch
}

func matchRegex(regex string, input string) bool {
	var match, _ = regexp.MatchString(regex, input)
	return match
}