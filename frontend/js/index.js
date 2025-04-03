d3.json("/metadata").then(metadata => {

    d3.csv("/data.csv", d3.autoType).then(data => {  
        const select = d3.select("#selectDiv")
                        .append("select")
                        .attr("class", "selectMenu")
                        .on("change", onChange)

        const primaryGroup = d3.group(data, d => d.repoPath)

        select.selectAll("option")
            .data(primaryGroup.keys())
            .enter()
            .append("option")
            .text(d => d)

        const firstData = primaryGroup.get(primaryGroup.keys().next().value)
        callDiv(firstData)

        function onChange() {
            cleanUp()

            const value = select.property("value")
            const selectedData = primaryGroup.get(value)

            callDiv(selectedData)

        }

        window.addEventListener("resize", onChange)
        
    })

    function callDiv(data) {
        reCalculateSizes()
        createTitle(data)
        drawGraph(data, metadata)
        createLegend(data)
    
    }
    
})

function cleanUp() {
    d3.select("#titleDiv").html(null)
    d3.select("#graphDiv").html(null)
    d3.select("#legendDiv").html(null)
}




   













