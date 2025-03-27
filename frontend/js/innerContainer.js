const createContainer = (data, metadata) => {

    const container = d3.select("#container")

    const innerContainer = container.append("div")
        .attr("class", "innerContainer")

    const graphDiv = innerContainer.append("div")
        .attr("class","graphDiv")

    const legendDiv = innerContainer.append("div")
        .attr("class","legendDiv")

    drawGraph(data, graphDiv, metadata)
    createLegend(data, legendDiv)



}
