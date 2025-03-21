const drawGraph = (data, div) => {

    const svg = div
        .append("svg")
        .attr("class", "graphSVG")

    createTooltip(svg)

    const createGraph = () => {
        defineScales(data)

        //Sets the width of the graph to be as wide as the container(from chat)
        const containerWidth = div.node().getBoundingClientRect().width;

        svg.attr("viewBox", `0 0 ${containerWidth} ${graph_height + legendPadding}`)
        //svg.attr("width", containerWidth);

        svg.selectAll(".bottomAxis").remove()
        svg.selectAll(".leftAxis").remove()
        svg.selectAll(".xAxisBackground").remove()

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
            .attr("opacity", 0.2);

        // Append x-axis
        svg.append("g")
            .attr("class", "bottomAxis")
            .attr("transform", `translate(${margin.left},${graph_height})`)
            .call(bottomAxis)


        // y-axis
        const leftAxis = d3.axisLeft(yScale)
            .tickSize(0)
            .tickPadding(20)

        svg.append("g")
            .attr("class", "leftAxis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(leftAxis)


            const primaryGroup = d3.rollup(data,
                (D) => [d3.sum(D, d => d.yAxis), d3.sum(D, d => d.nodeSize), d3.sum(D, d => d.linesAdded), d3.sum(D, d => d.linesDeleted)],
                (w) => w.week,
                (d) => d.fileName,
                (d) => d.author)

            var nodes = []
            primaryGroup.forEach((fileMap, week) => {

                // sum changes for all files in week
                const fileArray = Array.from(fileMap, ([fileName, authorMap]) => {
                    const totalyAxis = d3.sum(authorMap.values().map(x => x[0]))
                    return { fileName, totalyAxis };
                })

                // find top ten changed files in week
                fileArray.sort((a, b) => b.totalyAxis - a.totalyAxis)
                const topTenFiles = fileArray.slice(0, 10).reverse() // reverse to have most changed files on top


                for (let i = 0; i < topTenFiles.length; i++) { // for loop for each file in a week
                    const fileName = topTenFiles[i].fileName
                    const authorMap = fileMap.get(fileName)

                    //buildPie(authorMap, week, i, fileName, svg)
                    nodes.push({
                        x: week,
                        y: topTenFiles[i].totalLinesChanged,
                        week: week,
                        fileName: fileName,
                        authorMap: authorMap,
                        //totalLinesChanged: totalLinesChanged
                    })

                }

            })

            // Chapter 12, Helge book.
            //const tick = () => {
            //    d3.selectAll(".singleDonut")
            //        .data(nodes)
            //        .attr("transform", d => `translate(${d.x}, ${d.y})`)
            //
            //}

            const end = () => {
                var updated = false; // Flag to track if an update is needed

                nodes.forEach(d => {
                    const limitRight = xScale(d.week) + (xScale.bandwidth())
                    const limitLeft = xScale(d.week)
                    console.log("R: " + limitRight)
                    console.log("L: " + limitLeft)

                    if ((limitRight < (d.x) + graph_radius) || (limitLeft > (d.x) - graph_radius))  {
                        console.log(`x: ${d.x},\nweek: ${d.week},\nfilename: ${d.fileName},\nxscale(week): ${xScale(d.week) + xScale.bandwidth() / 2}`)
                        updated = true; // Mark update as needed

                    }

                })

            /*if(updated) {

                svg.selectAll(".bottomAxis").remove()
                        svg.selectAll(".xAxisBackground").remove()

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
                            .attr("opacity", 0.2);

                        // Append x-axis
                        svg.append("g")
                            .attr("class", "bottomAxis")
                            .attr("transform", `translate(${margin.left},${graph_height})`)
                            .call(bottomAxis)

                         // **Update Nodes' x Positions**
                        nodes.forEach(d => {
                            d.x = d.x * 1.2;

                        });

                        d3.selectAll(".singleDonut")
                            .data(nodes)
                            .attr("transform", d => `translate(${d.x}, ${d.y})`)


            }*/
            }

            const simulation = d3.forceSimulation(nodes)
                .force("x", d3.forceX(d => xScale(d.x) + xScale.bandwidth()/2).strength(0.8))
                .force("y", d3.forceY(d => yScale(d.y)).strength(1))
                .force("collide", d3.forceCollide().radius(graph_radius))
                //.on("tick", tick)
                .on("end", end)

            for (let i = 0; i < 300; i++) {
                simulation.tick()

            }

            nodes.forEach(d => buildPie(d, svg))



    }

    createGraph()


    window.addEventListener("resize", createGraph)


}

