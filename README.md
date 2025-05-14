# RepoPie 🥧
RepoPie is a tool for visualising version control histories of time-framed repositories.

With RepoPie, you can:
- See which files have been worked on for each week throughout the entire history of the repository
- See author contributions for each file in each week
- Compare activities in files by multiple metrics
- Hover on file to see activity data and highlight matching files across other weeks
- Click on file to go more in depth with author contributions and activity data

![ScreenRecording2025-05-08at14 44 53-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/020ffb4f-beea-474e-aced-deb924deac51)

## Installation
Download executables from build directory based on your hardware.

## Usage
RepoPie takes 2 mandatory arguments and 1 optional, along with mandatory CSV-formatted data.

Input data example:
```
repoPath,date,author,fileName,churn,growth,commit
home/repo,2025-05-09,jane@doe.com,test.md,5,1,1
```
CSV data must contain headers: repoPath,date,author,fileName,[at least 1 metric header]

Mandatory arguments:
1. yAxis, metric used to place pie charts on the y-axis. Metric must match with metric header in input data. 
2. nodeSize, metric used to calculate author-contributions for each pie chart, and to calculate size of the pie charts. Metric must match with metric header in input data. 

Optional argument:
1. fileLimit, integer used to limit amount of files per week, where files are sorted descending by y-axis metric.

To execute RepoPie, pipeline CSV-formatted data into the executable file.
```
cat <path to csv> | ./repoPie -yAxis <metric> -nodeSize <metric>
```
The data visualisation will be served in a local HTTP server, with a link in terminal to open in browser.

### RepoGitLog
Helper tool to generate data for RepoPie, based on Git log for one or more local repositories.

Input is an absolute path to one or more repositories, given through the `-repoPath` argument. If providing multiple repositories, separate each path with a comma without spacing.
Output is CSV-formatted data with the headers: repoPath,date,author,fileName,churn,growth,commit.

The metric headers are:
1. Churn, which is lines added + lines deleted per file in each commit
2. Growth, which is lines added - lines deleted per file in each commit
3. Commit, which is one per file in each commit.

To run RepoGitLog, run the following command
```
./repoGitLog -repoPath <path to repositories>
```

Parsing co-authors:
When parsing co-authors, the process is to first check for a .mailmap file in the repository. Each co-author is checked for a corresponding proper name and email address with a `git check-mailmap` command. The output is given to Go package [net/mail](https://pkg.go.dev/net/mail), which checks for an email address in the permitted syntax of the package.

### RepoFilter
Helper tool to filter rows based on file path.

Input and output are both CSV-formatted data with headers: repoPath,date,author,fileName,churn,growth,commit.

To filter certain file paths and names, provide RepoFilter with regular expressions in the following optional arguments: `-includePath`, `-includeFile`, `-excludePath`, `-excludeFile`

To run RepoFilter, pipeline CSV-formatted data into the executable file.
```
cat <path to csv> | ./repoFilter -includePath <regex> -includeFile <regex> -excludePath <regex> -excludeFile <regex>
```
### Pipelining all tools
Both RepoGitLog and RepoFilter are optional helper tools, to easily pipeline filtered data from Git log into RepoPie.

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


## License
[MIT](https://choosealicense.com/licenses/mit/)
