const drawGraph = (data, div, metadata) => {

    const svg = div
        .append("svg")
        .attr("class", "graphSVG")

    createClickTooltip(svg, metadata)
    createHoverTooltip(svg)

    const createGraph = () => {
        const primaryGroup = d3.rollup(data,
            (D) => new Map([
                ["yAxis", d3.sum(D, d => d.yAxis)], 
                ["nodeSize", d3.sum(D, d => d.nodeSize)],
                ["linesAdded", d3.sum(D, d => d.linesAdded)], 
                ["linesDeleted", d3.sum(D, d => d.linesDeleted)],
            ]),
            (w) => w.week,
            (d) => d.fileName,
            (d) => d.author)

        var nodes = []

        primaryGroup.forEach((fileMap, week) => {

            // sum changes for all files in week
            const fileArray = Array.from(fileMap, ([fileName, authorMap]) => {
                const totalNodeSize = d3.sum(authorMap.values().map(x => x.get("nodeSize")))
                const totalyAxis = d3.sum(authorMap.values().map(x => x.get("yAxis")))
                return { fileName, totalyAxis, totalNodeSize };

            })

            // find top ten changed files in week
            fileArray.sort((a, b) => b.totalyAxis - a.totalyAxis)
            const topFiles = fileArray.slice(0, metadata.numberOfFiles).reverse() // reverse to have most changed files on top

            const yAxisMin = d3.min(topFiles, d => d.totalyAxis)
            const yAxisMax = d3.max(topFiles, d => d.totalyAxis)
            const nodeSizeMin = d3.min(topFiles, d => d.totalNodeSize)
            const nodeSizeMax = d3.max(topFiles, d => d.totalNodeSize)


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

            for (let i = 0; i < topFiles.length; i++) { // for loop for each file in a week
                const fileName = topFiles[i].fileName
                const authorMap = fileMap.get(fileName)

                nodes.push({
                    x: week,
                    y: topFiles[i].totalyAxis,
                    week: week,
                    fileName: fileName,
                    authorMap: authorMap,
                    nodeSize: topFiles[i].totalNodeSize
                })

            }

        })

        defineScales(data, globalyMax, globalyMin, globalNodeMax, globalNodeMin)

        //Sets the width of the graph to be as wide as the container(from chat)
        const containerWidth = div.node().getBoundingClientRect().width;

        svg.attr("viewBox", `0 0 ${containerWidth} ${graph_height + legendPadding}`)
        //svg.attr("width", containerWidth);

        svg.selectAll(".bottomAxis").remove()
        svg.selectAll(".leftAxis").remove()
        svg.selectAll(".xAxisBackground").remove()
        svg.selectAll(".xAxisLabel").remove()
        svg.selectAll(".yAxisLabel").remove()

        // x-axis
        const bottomAxis = d3.axisBottom(xScale)
            .tickSize(10)
            .tickPadding(5)
            .tickSizeOuter(0)

        const xAxisBackground = svg.append("g")
            .attr("class", "xAxisBackground");

        xAxisBackground.selectAll("rect")
            .data(xScale.domain())
            .enter()
            .append("rect")
            .attr("x", d => xScale(d) + margin.left)
            .attr("y", 0)
            .attr("width", xScale.bandwidth())
            .attr("height", graph_height)
            .attr("fill", (d, i) => i % 2 === 0 ? backgroundColor1 : backgroundColor2)
            .attr("opacity", 0.2)

        // Append x-axis
        const bottomAxisGroup = svg.append("g")
            .attr("class", "bottomAxis")
            .attr("transform", `translate(${margin.left},${graph_height})`)
            .call(bottomAxis)

        // x-axis label
        svg.append("text")
            .attr("class", "xAxisLabel")
            .attr("x", margin.left + width / 2)
            .attr("y", graph_height + bottomAxisGroup.node().getBBox().height + margin.bottom * 0.5)
            .text("Weeks")


        // y-axis
        const leftAxis = d3.axisLeft(yScale)
            .tickSize(0)
            .tickPadding(20)

        svg.append("g")
            .attr("class", "leftAxis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(leftAxis)

        svg.append("text")
            .attr("class", "yAxisLabel")
            //.attr("x", margin.left)
            //.attr("y", graph_height / 2)
            .attr("transform", `translate(${margin.left * 0.25}, ${graph_height * 0.5}) rotate(-90)`)
            .text(String(metadata.yAxis).charAt(0).toUpperCase() + String(metadata.yAxis).slice(1))


        // Chapter 12, Helge book.
        const simulation = d3.forceSimulation(nodes)
            .force("x", d3.forceX(d => xScale(d.x) + xScale.bandwidth() / 2).strength(0.8))
            .force("y", d3.forceY(d => yScale(d.y)).strength(1))
            .force("boundary", forceBoundary(
                (d) => xScale(d.x) + rScale(d.nodeSize) + graph_bandwidth_padding,  // Min X boundary
                (d) => 0 + rScale(d.nodeSize) + graph_bandwidth_padding,  // Min Y (top)
                (d) => xScale(d.x) + xScale.bandwidth() - rScale(d.nodeSize) - graph_bandwidth_padding,  // Max X boundary
                (d) => graph_height - rScale(d.nodeSize) - graph_bandwidth_padding))  // Max Y (bottom)
            .force("collide", d3.forceCollide().radius(d => rScale(d.nodeSize)))


        for (let i = 0; i < 300; i++) {
            simulation.tick()

        }

        nodes.forEach(d => buildPie(d, svg))

    }

    createGraph()


    window.addEventListener("resize", createGraph)


}

