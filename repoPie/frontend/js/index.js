/**
 * Loads CVS data converting strings in the CSV to appropriate datatypes. 
 * Builds dropdown menu to select different repositories to render a corresponding title, 
 * graph and legend.  
 */
d3.csv("/data.csv", d3.autoType).then(data => {

    // Extract metadata from the first row in CSV file. 
    const metadata = {
        yAxis: data[0].yAxisMetric,
        nodeSize: data[0].nodeSizeMetric,
        fileLimit: data[0].fileLimit,
    }

    // Create a dropdown element 
    const select = d3.select("#selectDiv")
        .append("select")
       .attr("class", "selectMenu")
        .on("change", onChange)

    select.append("option")
        .attr("disabled", true)
        .attr("selected", true)
        .attr("value", "") // Placeholder in dropdown
        .text("Select repo") 
    
    // Group data by repoPath
    const primaryGroup = d3.group(data, d => d.repoPath)

    // Gets repoPath's for dropdown 
    const keys = [...primaryGroup.keys()]
    keys.forEach(element => {
        select.append("option")
            .text(element)
    })

    // Initially draws the graph for the first repoPath
    const firstData = primaryGroup.get(primaryGroup.keys().next().value)
    callDiv(firstData)

    // Eventhandler for dropdown.
    function onChange() {
        const value = select.property("value")

        if (value === "") return// Ignore placeholder selection

        cleanUp()

        const selectedData = primaryGroup.get(value)

        callDiv(selectedData) // Draw selected repoPath

    }

    
    //Builds the graph for a given dataset.
    function callDiv(data) {
        reCalculateSizes()
        createTitle(data)
        drawGraph(data, metadata)
        createLegend()
    
    }
    
    
    // Removes previous data before redrawing. 
    function cleanUp() {
        d3.select("#titleDiv").html(null)
        d3.select("#graphDiv").html(null)
        d3.select("#legendDiv").html(null)
    }

    window.addEventListener("resize", onChange)
    

})
