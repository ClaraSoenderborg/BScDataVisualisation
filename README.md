# RepoPie
?? is a tool for visualising version control history of small, time-framed repositories. 

## Installation

## Usage 

### RepoGitLog
Helper tool to generate data for RepoPie, based on Git log for one or more local repositories. 

Parsing co-authors:
When parsing co-authors, the process is to first check for a .mailmap file in the repository. Each co-author is checked for a corresponding proper name and email address with a `git check-mailmap` command. The output is given to Go package net/mail[https://pkg.go.dev/net/mail], which checks for an email address in the permitted syntax of the package. 

## Contributing

## License
[MIT](https://choosealicense.com/licenses/mit/)