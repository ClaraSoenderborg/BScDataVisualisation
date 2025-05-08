# RepoPie
RepoPie is a tool for visualising version control histories of small, time-framed repositories. 

## Installation
Download executables from build directory based on your hardware.

## Usage 
To execute RepoPie, pipeline CSV-formatted data into the executable file. 
```
cat <path to csv> | ./repoPie -yAxis <metric> -nodeSize <metric>
```
The data visualisation will be served locally, with a link in terminal. 

### RepoGitLog
Helper tool to generate data for RepoPie, based on Git log for one or more local repositories. 

Parsing co-authors:
When parsing co-authors, the process is to first check for a .mailmap file in the repository. Each co-author is checked for a corresponding proper name and email address with a `git check-mailmap` command. The output is given to Go package net/mail[https://pkg.go.dev/net/mail], which checks for an email address in the permitted syntax of the package. 

## Example 
1. Clone the following repository
`git clone https://github.com/ITU-BDSA23-GROUP8/Chirp.git`
2. Run the following command to execute repoPie and helper tools:
`./repoGitLog -repoPath <path to example repo>/Chirp | ./repoFilter -includeFile "Program\.cs$" | ./repoPie -yAxis commit -nodeSize churn`



## Contributing

## License
[MIT](https://choosealicense.com/licenses/mit/)