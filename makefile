.PHONY: build clean

REPOGITLOG_VERSION=0.1.0
REPOPIE_VERSION=0.1.0

build: build/repoGitLog build/repoPie

build/repoGitLog: 
	echo "Compiling RepoGitLog for every OS and Platform"
	GOARCH=amd64 GOOS=linux go build -ldflags="-X main.version=${REPOGITLOG_VERSION}" -o build/linux-amd64/repoGitLog ./repoGitLog/.
	GOARCH=arm64 GOOS=darwin go build -ldflags="-X main.version=${REPOGITLOG_VERSION}" -o build/darwin-arm64/repoGitLog ./repoGitLog/.

build/repoPie: 
	echo "Compiling RepoPie for every OS and Platform"
	GOARCH=amd64 GOOS=linux go build -ldflags="-X main.version=${REPOPIE_VERSION}" -o build/linux-amd64/repoPie ./repoPie/.
	GOARCH=arm64 GOOS=darwin go build -ldflags="-X main.version=${REPOPIE_VERSION}" -o build/darwin-arm64/repoPie ./repoPie/.

clean:
	rm build/*