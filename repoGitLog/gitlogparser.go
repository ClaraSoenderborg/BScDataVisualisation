// gitlogparser.go is responsible for calling and parsing git log.

package main

import (
	"fmt"
	"log"
	"net/mail"
	"os/exec"
	"strconv"
	"strings"
)

// maps to keep track of which unparsed co-authors have been warned about
var failedCheckMailmap = map[string]bool{}
var failedParseEmail = map[string]bool{}

// callGitLog uses `git log` command
func callGitLog(repositoryPath string) string {

	// Documentation for pretty format: https://git-scm.com/docs/git-log#_pretty_formats 
	// co-authors will be separated by "|"
	// --numstat flag gives numerical values for added and deleted lines
	// --no-merges excludes merges
	// --no-renames excludes renames in commits
	// --diff-filter=x excludes unknown files
	var script = `git -C %s log --pretty=format:"%%as %%aE %%(trailers:key=Co-authored-by,valueonly,separator=%%x7c)" --numstat --no-merges --no-renames --diff-filter=x`

	var cmd = exec.Command("bash", "-c", fmt.Sprintf(script, repositoryPath))

	var output, err = cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Could not execute command")
	}

	return string(output)

}

// parseGitLog parses the output from 'git log' command and transforms it to csv-formatted data. 
func parseGitLog(lines string, repoPath string) [][]string {
	var date string
	var isBeginCommit = true
	var authors = []string{}

	var result = [][]string{}

	// iterate over each line of git log 
	for _, l := range strings.Split(lines, "\n") {
		var lineContent = strings.TrimSpace(l)

		// parse commit header
		if lineContent != "" {
			if isBeginCommit {
				date, authors = parseCommitHeader(lineContent, repoPath)
				isBeginCommit = false
			} else { 
				// parse file row under commit header
				// each file row contains: lines added, lines deleted and filename
				var rowsForFile = parseCommitFile(lineContent, repoPath, date, authors)
				if rowsForFile != nil {
					result = append(result, rowsForFile...)
				}
			}
		}

		// empty line, new commit begins next line
		if lineContent == "" {
			isBeginCommit = true
			authors = nil
		}
	}
	return result
}

// parseCommitHeader parses the header row of a commit from git log. 
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

// parseCoAuthors parses the raw list of co-authors and returns a slice of parsed emails
func parseCoAuthors(coAuthorString string, repoPath string) []string {
	var listCoAuthor []string

	var splitCoAuthor = strings.Split(coAuthorString, "|")

	for _, author := range splitCoAuthor {
		var properEmail = parseEmail(author, repoPath)
		
		if properEmail != "" {
			// if parseEmail could find email-address, append it to parsed co-authors
			listCoAuthor = append(listCoAuthor, properEmail)
		}
	}

	return listCoAuthor

}

// parseEmail takes a raw author string and returns the proper email, by doing following:
// - calling 'git check-mailmap' to find a proper e-mail, if possible
// - then parsing the email-address using Go net/mail package
func parseEmail(author string, repoPath string) string {
	var script = `git -C %s check-mailmap "%s"`
	var cmd = exec.Command("bash", "-c", fmt.Sprintf(script, repoPath, author))

	var output, err = cmd.CombinedOutput()
	var trimmedOutput = strings.TrimSpace(string(output))

	// check-mailmap 
	if err != nil {
		// only log warning if specific author has not failed before
		if !failedCheckMailmap[author] {
			log.Printf("\nWarning: 'git check-mailmap' in repository " + repoPath + " gave error: '" + trimmedOutput + "'\n")
			failedCheckMailmap[author] = true
		}
		// author was not found in mailmap, so we will attempt to parse email from original co-author string
		trimmedOutput = strings.TrimSpace(author)
	}

	// parse for email
	var emailAddress, emailErr = mail.ParseAddress(trimmedOutput)
	if emailErr != nil {
		// only log warning if specific author has not failed before
		if !failedParseEmail[author] {
			log.Printf("\nWarning: net/mail could not parse email from author: '" + trimmedOutput + "' in repository " + repoPath + "\n")
			failedParseEmail[author] = true
		}
		return ""
	}

	return emailAddress.Address
}

// removeDuplicates removes duplicates from a slice, and returns the clean slice
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

// parseCommitFile parses a row for a file in a commit,
// and returns [][]string, with a new row for each author on the commit. 
func parseCommitFile(
	lineContent, repoPath, date string,
	authors []string) [][]string {

	var result = [][]string{}

	var fields = strings.Fields(lineContent)
	var linesAddStr, linesDelStr, fileName = fields[0], fields[1], fields[2]

	var linesAdd, _ = strconv.Atoi(linesAddStr)
	var linesDel, _ = strconv.Atoi(linesDelStr)

	var churnValue = getMetric(linesAdd, linesDel, "churn")
	var commitValue = getMetric(linesAdd, linesDel, "commit")
	var growthValue = getMetric(linesAdd, linesDel, "growth")


	// add row for each author on commit for this file
	for _, author := range authors {
		result = append(result,
			[]string{
				repoPath,
				date,
				author,
				fileName,
				strconv.Itoa(churnValue),
				strconv.Itoa(growthValue),
				strconv.Itoa(commitValue),
			})
	}

	return result
}


// getMetric returns metric value based on specific metric, lines added and lines deleted
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
