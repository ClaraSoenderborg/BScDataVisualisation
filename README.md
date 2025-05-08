# RepoPie 🥧
RepoPie is a tool for visualising version control histories of small, time-framed repositories. 

With RepoPie, you can: 
- See which files have been worked on for each week throughout the entire history
- See author contributions for each file in each week
- Compare activities in files by multiple metrics
- Hover on file to see file activity in other weeks, along with specific activity data on this file
- Click on file to go more in depth with author contributions and activity data

## Installation
Download executables from build directory based on your hardware.

## Usage 
RepoPie takes 2 mandatory arguments and 1 optional. 

Mandatory arguments:
1. -yAxis, metric used to place pies on the y-axis
2. -nodeSize, metric used to calculate author-contributions for each pie, and to calculate size of the pie.

The metrics are:
1. Churn, which is lines added + lines deleted per file in each commit
2. Growth, which is lined added - lines deleted per file in each commit
3. Commit, which is 1 per file in each commit.

Optional argument:
1. -fileLimit, integer used to limit to n amount of files per week, where files are sorted descending by y-axis metric.

To execute RepoPie, pipeline CSV-formatted data into the executable file. 
```
cat <path to csv> | ./repoPie -yAxis <metric> -nodeSize <metric>
```
The data visualisation will be served locally, with a link in terminal. 

### RepoGitLog
Helper tool to generate data for RepoPie, based on Git log for one or more local repositories. 
Input is a absolute path to one or more repositories, given through the `-repoPath` argument. If providing multiple repositories, separate each path with a comma without spacing. 
Output is CSV-formatted data with the headers: repoPath,date,author,fileName,churn,growth,commit.

To run RepoGitLog, run the following command
```
./repoGitLog -repoPath <path to repositories>
```

Parsing co-authors:
When parsing co-authors, the process is to first check for a .mailmap file in the repository. Each co-author is checked for a corresponding proper name and email address with a `git check-mailmap` command. The output is given to Go package net/mail[https://pkg.go.dev/net/mail], which checks for an email address in the permitted syntax of the package. 

### RepoFilter
Helper tool to filter rows based on file path. 
Input is CSV-formatted data with headers: repoPath,date,author,fileName,churn,growth,commit.
Output is CSV-formatted data with headers: repoPath,date,author,fileName,churn,growth,commit. 

To filter certain file paths and names, provide RepoFilter with regular expressions in the following optional arguments: `-includePath`, `-includeFile`, `-excludePath`, `-excludeFile`

To run RepoFilter, pipeline CSV-formatted data into the executable file. 
```
cat <path to csv> | ./repoFilter -includePath <regex> -includeFile <regex> -excludePath <regex> -excludeFile <regex>
```
### Pipelining all tools
Both RepoGitLog and RepoFilter are optional helper tools, to easily pipeline filtered data from Git log into RepoPie. 
Example commands to pipeline tools:
With all tools:
```
./repoGitLog -repoPath <path to repositories> | ./repoFilter <regex arguments> | ./repoPie -yAxis <metric> -nodeSize <metric>
```

Only with RepoFilter and RepoPie:
```
cat <path to csv file> | ./repoFilter <regex arguments> | ./repoPie -yAxis <metric> -nodeSize <metric>
```

Only with RepoGitLog and RepoPie:
```
./repoGitLog -repoPath <path to repositories> | ./repoPie -yAxis <metric> -nodeSize <metric>
```

## Example 
1. Clone the following repository
```git clone https://github.com/ITU-BDSA23-GROUP8/Chirp.git```
2. Run the following command to execute repoPie and helper tools:
```./repoGitLog -repoPath <path to example repo>/Chirp | ./repoFilter -includeFile "Program\.cs$" | ./repoPie -yAxis commit -nodeSize churn```
3. Open link in browser to see following visualisation: 

<img width="800" alt="Screenshot 2025-05-08 at 14 44 11" src="https://github.com/user-attachments/assets/a9ad2279-5999-4dfd-8c92-a481de64a2f4" />

![ScreenRecording2025-05-08at14 44 53-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/020ffb4f-beea-474e-aced-deb924deac51)


## License
[MIT](https://choosealicense.com/licenses/mit/)
