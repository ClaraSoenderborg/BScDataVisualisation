d3.csv("/data.csv", d3.autoType).then(data => {
    defineScales(data)
    drawGraph(data)
    createTooltip()
    createLegend(data)
});











