package main

import (
	"fmt"
	"log"
	"net/mail"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

var failedCheckMailmap = map[string]bool{}
var failedParseEmail = map[string]bool{}


func callGitLog(repositoryPath string) string {

	var script = `git -C %s log --pretty=format:"%%as %%aE %%(trailers:key=Co-authored-by,valueonly,separator=%%x7c)" --numstat --no-merges --no-renames --diff-filter=x`

	var cmd = exec.Command("bash", "-c", fmt.Sprintf(script, repositoryPath))

	var output, err = cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Could not execute command")
	}

	return string(output)

}

func parseGitLog(lines string, regexFilters map[string]string, yAxis string, nodeSize string, repoPath string) [][]string {
	var date string
	var isBeginCommit = true
	var authors = []string{}

	var result = [][]string{}

	for _, l := range strings.Split(lines, "\n") {
		var lineContent = strings.TrimSpace(l)

		if lineContent != "" {
			if isBeginCommit {
				date, authors = parseCommitHeader(lineContent, repoPath)
				isBeginCommit = false
			} else {
				// following lines of commit contains lines added, lines deleted and filename
				var rowsForFile = parseCommitFile(lineContent, yAxis, nodeSize, repoPath, date, authors, regexFilters)
				if rowsForFile != nil {
					result = append(result, rowsForFile...)
				}
			}
		}

		if lineContent == "" {
			isBeginCommit = true
			authors = nil
		}
	}
	return result
}

func parseCommitHeader(lineContent string, repoPath string) (string, []string) {
	var fields = strings.Fields(lineContent)
	var date, mainAuthor = fields[0], fields[1]
	var allAuthors = []string{mainAuthor}

	// parse co-authors
	if len(fields) > 3 {
		var coAuthors = strings.Join(fields[2:], " ")
		allAuthors = append(allAuthors, parseCoAuthors(coAuthors, repoPath)...)
		allAuthors = removeDuplicates(allAuthors)
	}

	return date, allAuthors
}

func checkMailMap(author string, repoPath string) string {
	var script = `git -C %s check-mailmap "%s"`
	var cmd = exec.Command("bash", "-c", fmt.Sprintf(script, repoPath, author))

	var output, err = cmd.CombinedOutput()
	var trimmedOutput = strings.TrimSpace(string(output))

	if err != nil {
		// only log warning if specific author has not failed before
		if !failedCheckMailmap[author] {
			log.Printf("Warning: 'git check-mailmap' gave error: '" + trimmedOutput + "'")
			failedCheckMailmap[author] = true
		}
		// author was not found in mailmap, so we will attempt to parse email from original co-author string
		trimmedOutput = strings.TrimSpace(author)
	}

	var emailAddress, emailErr = mail.ParseAddress(trimmedOutput)
	if emailErr != nil {
		// only log warning if specific author has not failed before
		if !failedParseEmail[author] {
			log.Printf("Warning: net/mail could not parse email from author: '" + trimmedOutput + "'")
			failedParseEmail[author] = true
		}
		return ""
	}

	return emailAddress.Address
}

func parseCoAuthors(coAuthorString string, repoPath string) []string {
	var listCoAuthor []string

	var splitCoAuthor = strings.Split(coAuthorString, "|")

	for _, author := range splitCoAuthor {
		var properEmail = checkMailMap(author, repoPath)
		if properEmail != "" {
			listCoAuthor = append(listCoAuthor, properEmail)
		}
	}

	return listCoAuthor

}

func removeDuplicates(list []string) []string {
	var keyMap = make(map[string]bool)
	var result = []string{}
	for _, item := range list {
		var _, exists = keyMap[item]
		if !exists {
			keyMap[item] = true
			result = append(result, item)
		}
	}
	return result
}

func parseCommitFile(
	lineContent, yAxis, nodeSize, repoPath, date string,
	authors []string,
	regexFilters map[string]string) [][]string {

	var result = [][]string{}

	var fields = strings.Fields(lineContent)
	var linesAddStr, linesDelStr, fileName = fields[0], fields[1], fields[2]

	if !addFile(fileName, regexFilters) {
		return nil
	}

	var linesAdd, _ = strconv.Atoi(linesAddStr)
	var linesDel, _ = strconv.Atoi(linesDelStr)

	var yAxisValue = getMetric(linesAdd, linesDel, yAxis)
	var nodeSizeValue = getMetric(linesAdd, linesDel, nodeSize)

	// no support for negative values
	if yAxisValue <= 0 || nodeSizeValue <= 0 {
		return nil
	}

	// add row for each author on commit for this file
	for _, author := range authors {
		result = append(result,
			[]string{
				repoPath,
				date,
				author,
				fileName,
				strconv.Itoa(yAxisValue),
				yAxis,
				strconv.Itoa(nodeSizeValue),
				nodeSize,
			})
	}

	return result
}

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

func getMetric(linesAdd int, linesDel int, metric string) int {
	if metric == "churn" {
		return linesAdd + linesDel
	} else if metric == "growth" {
		return linesAdd - linesDel
	} else if metric == "commit" {
		return 1
	}
	return -1
}
