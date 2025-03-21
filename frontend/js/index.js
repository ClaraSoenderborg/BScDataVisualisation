d3.text("/files").then(response => {
    const numberOfFiles = parseInt(response.trim(), 10)

    d3.csv("/data.csv", d3.autoType).then(data => {
        reCalculateSizes()
        //defineScales(data)
        createContainer(data, numberOfFiles)
    })
})













