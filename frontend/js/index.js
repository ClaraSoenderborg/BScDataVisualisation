d3.json("/metadata").then(metadata => {
    //const numberOfFiles = parseInt(metadata.numberOfFiles, 10)

    //nst repoNames = metadata.allRepos
    //console.log(repoNames)

    //const splitRepoNames = repoNames.split(',')
    //console.log(splitRepoNames)

    d3.csv("/data.csv", d3.autoType).then(data => {  
        // Group data by repoPath
        const primaryGroup = d3.group(data, d => d.repoPath);

        primaryGroup.forEach((repoData, repoPath) => {
            console.log(`Processing repo: ${repoPath}`);
            reCalculateSizes();
            createContainer(repoData, metadata); // Pass only relevant data for the repo
        });
    });
    
})
   













