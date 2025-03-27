d3.json("/metadata").then(metadata => {
    //const numberOfFiles = parseInt(response.numberOfFiles, 10)


    d3.csv("/data.csv", d3.autoType).then(data => {
        reCalculateSizes()
        //defineScales(data)
        createContainer(data, metadata)
    })
})













