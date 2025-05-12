/**
 * Creates and draw the graph based on the data given. Prepares each element within the graph 
 * and positions them.
 */
const drawGraph = (data, metadata) => {
    var maxNumberOfFiles = 0

    const div = d3.select("#graphDiv")
    const svg = div
        .append("svg")
        .attr("class", "graphSVG")

    createClickTooltip(svg, metadata)
    createHoverTooltip(svg)

    const createGraph = () => {
        /**
         * d3.rollup() aggregates the data into a nested structure. Grouping the data.
         * 1. Outer groups: weeks
         * 2. Within each week, groups by fileName
         * 3. Within each fileName, groups by author. 
         * Each author map, contains a map with: yAxis, nodeSize, linesadded and linesDeleted. 
         */
        const primaryGroup = d3.rollup(data,
            (D) => new Map([
                ["yAxis", d3.sum(D, d => d.yAxis)],
                ["nodeSize", d3.sum(D, d => d.nodeSize)],
                ["linesAdded", d3.sum(D, d => d.linesAdded)],
                ["linesDeleted", d3.sum(D, d => d.linesDeleted)],
            ]),
            (w) => formatISOWeek(w.date),
            (d) => d.fileName,
            (d) => d.author)

        var nodes = []
        var uniqueAuthors = new Set([])

        
        primaryGroup.forEach((fileMap, yearWeek) => {
            var files = getFiles(fileMap)

            // If a fileLimit is given, the array only keeps the files within the limit. 
            if (metadata.fileLimit != null) {
                files = files.slice(0, metadata.fileLimit)
            }
            
            // Tracks largest number of files within a week.
            if(maxNumberOfFiles < files.length) {
                maxNumberOfFiles = files.length
            }

            updateGlobalMinMax(files)

            /**
             * Loops through all files in a week, extracting fileName and authorMap.
             * Adding authors to the Set of uniqueAuthors. 
             * Pushing a node for each file, containing all nessasary information.
             */
            for (let i = 0; i < files.length; i++) { 
                const fileName = files[i].fileName
                const authorMap = fileMap.get(fileName)

                // Making it work on Safari
                var arrAuthorMap = [...authorMap.keys()].forEach(item => uniqueAuthors.add(item)) 

                nodes.push({
                    x: 0, // placeholder
                    y: 0, // placeholder
                    yearWeek: yearWeek,
                    fileName: fileName,
                    authorMap: authorMap,
                    nodeSize: files[i].totalNodeSize,
                    nodeSizeMetric: metadata.nodeSize,
                    yAxis: files[i].totalyAxis,
                    yAxisMetric: metadata.yAxis
                })

            }

        })

        defineScales({
                data,
                globalyMax,
                globalyMin,
                globalNodeMax,
                authors: Array.from(uniqueAuthors).sort(d3.ascending),
                maxNumberOfFiles
            })

        // Sets the width of the graph to be as wide as the container
        // Source: https://medium.com/@belloquadriolawale/the-getboundingclientrect-method-5cd13e206bcf
        const containerWidth = div.node().getBoundingClientRect().width;
        svg.attr("viewBox", `0 0 ${containerWidth} ${graph_height + margin.bottom + line_height_two * 2}`)

        removeGraph(svg)

        buildXAxis(svg) // x-axis

        buildYAxis(svg, metadata, globalyMin, globalyMax) // y-axis

        //Initializes a forced simulation
        const simulation = createSimulation(nodes) 

            for (let i = 0; i < 300; i++) {
                simulation.tick() // Updates position node
            }

            nodes.forEach(d => { // Draws nodes as pie charts
                buildPie(d,svg)} 
            )

    }

   /**
    * Updates the global values based on the given files. 
    */
    const updateGlobalMinMax = (files) => {
        const yAxisMin = d3.min(files, d => d.totalyAxis)
        const yAxisMax = d3.max(files, d => d.totalyAxis)
        const nodeSizeMin = d3.min(files, d => d.totalNodeSize)
        const nodeSizeMax = d3.max(files, d => d.totalNodeSize)

        if (yAxisMin < globalyMin) {
            globalyMin = yAxisMin;
        }
        if (yAxisMax > globalyMax) {
            globalyMax = yAxisMax;
        }

        if (nodeSizeMin < globalNodeMin) {
            globalNodeMin = nodeSizeMin;
        }
        if (nodeSizeMax > globalNodeMax) {
            globalNodeMax = nodeSizeMax;
        }
    }

    createGraph()
}

/**
 * Computes totalNodeSize and totalyAxis for each file, by summing values from all its authors.
 * Sorts the array of files in descending order, by y-axis metric.  
 */
function getFiles(fileMap) {
    const fileArray = Array.from(fileMap, ([fileName, authorMap]) => {
        const totalNodeSize = d3.sum([...authorMap.values()].map(x => x.get("nodeSize")))
        const totalyAxis = d3.sum([...authorMap.values()].map(x => x.get("yAxis")))
        return { fileName, totalyAxis, totalNodeSize };

    })

    return fileArray.sort((a, b) => b.totalyAxis - a.totalyAxis)
     
}

// Removes existing graph elements when redrawing. 
function removeGraph(svg) {
    svg.selectAll(".bottomAxis").remove()
    svg.selectAll(".leftAxis").remove()
    svg.selectAll(".xAxisBackground").remove()
    svg.selectAll(".xAxisLabel").remove()
    svg.selectAll(".yAxisLabel").remove()
}

/**
 * Build x-axis and positions it.
 * Adds ticks and their values
 * Calculates and adds rectangle background color for each week.
 * Add label of x-axis
 */
function buildXAxis(svg) {
    //Adds the ticks and their values
    const bottomAxis = d3.axisBottom(xScale)
            .tickSize(10)
            .tickPadding(5)
            .tickSizeOuter(0)
            .tickFormat(d => d.split("-")[1]); // "year-week" extract only week 
    
    // Position the x-axis
    const bottomAxisGroup = svg.append("g")
        .attr("class", "bottomAxis")
        .attr("transform", `translate(${margin.left},${graph_height})`)
        .call(bottomAxis) // Draws the x-axis
    
    const xAxisBackground = svg.append("g")
        .attr("class", "xAxisBackground");

    //Adds background rectangles behind each week to visually seperate them.
    xAxisBackground.selectAll("rect")
        .data(xScale.domain())
        .enter()
        .append("rect")
        .attr("x", d => xScale(d) + margin.left)
        .attr("y", 0)
        .attr("width", xScale.bandwidth())
        .attr("height", graph_height)
        .attr("fill", (d, i) => i % 2 === 0 ? backgroundColor1 : backgroundColor2)
    

    // x-axis label
    svg.append("text")
        .attr("class", "xAxisLabel")
        .attr("x", margin.left + width / 2)
        .attr("y", graph_height + bottomAxisGroup.node().getBBox().height + margin.bottom * 0.5)
        .text("Weeks")

}

/**
 * Build y-axis xxxxx
 */
function buildYAxis(svg, metadata, globalyMin, globalyMax) {
    //Adds the ticks and their values. Displa
    const leftAxis = d3.axisLeft(yScale)
            .tickValues(getLogTicks(globalyMin, globalyMax))
            .tickSize(-width)
            .tickSizeOuter(0)
            .tickPadding(20)

        // Position the y-axis
        svg.append("g")
            .attr("class", "leftAxis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(leftAxis) // Draws the y-axis
            .selectAll(".tick line")

        // y-axis label from given metadata.
        svg.append("text")
            .attr("class", "yAxisLabel")
            .attr("transform", `translate(${margin.left * 0.25}, ${graph_height * 0.5}) rotate(-90)`)
            .text(String(metadata.yAxis).charAt(0).toUpperCase() + String(metadata.yAxis).slice(1))


}
 /**
  * Displays the nodes using d3 force simulation. 
  * When placing the nodes, it favores the y value over the x value. 
  * 
  * Source: E. Meeks, and A. Dafour, “D3.js in action”, Third edition, chapter 12.4, 2024.
  * Source: https://observablehq.com/@john-guerra/d3-force-boundary
  */
function createSimulation(nodes) {
    const sim = d3.forceSimulation(nodes)
        .force("x", d3.forceX(d => xScale(d.yearWeek) + xScale.bandwidth() / 2).strength(0.5))
        .force("y", d3.forceY(d =>  yScale(d.yAxis)).strength(1)) 
        .force("boundary", forceBoundary(
            (d) => xScale(d.yearWeek) + rScale(d.nodeSize) + graph_bandwidth_padding,  // Min X boundary
            (d) => 0 + rScale(d.nodeSize) + graph_bandwidth_padding,  // Min Y (top)
            (d) => xScale(d.yearWeek) + xScale.bandwidth() - rScale(d.nodeSize) - graph_bandwidth_padding, // Max X boundary
            (d) => graph_height - rScale(d.nodeSize) - graph_bandwidth_padding))  // Max Y (bottom)
        .force("collide", d3.forceCollide().radius(d => rScale(d.nodeSize)))

    return sim
}

/**
 * Generate an array of logarithmic ticks based on min and max values. 
 * In the case of no ticks, we push min. 
 */
function getLogTicks(min, max) {
    var ticks = []
    const base = yScale.base() // Log base of either 2 or 10.

    var value = 1
    while (value <= max) {
        if (value >= min) ticks.push(value)
        value *= base
    }

    if (ticks.length == 0){
        ticks.push(min)
    }

    return ticks
}

