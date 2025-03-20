d3.csv("/data.csv", d3.autoType).then(data => {
    reCalculateSizes()
    defineScales(data)
    createContainer(data)
});











