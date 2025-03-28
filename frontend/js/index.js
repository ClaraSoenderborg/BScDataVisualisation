d3.json("/metadata").then(metadata => {

    d3.csv("/data.csv", d3.autoType).then(data => {  
        const primaryGroup = d3.group(data, d => d.repoPath);

        primaryGroup.forEach((repoData, repoPath) => {
            reCalculateSizes();
            createContainer(repoData, metadata); // Pass only relevant data for the repo
        });
    });
    
})
   













