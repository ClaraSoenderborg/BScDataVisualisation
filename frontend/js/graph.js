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


        // x-axis
        const bottomAxis = d3.axisBottom(xScale)
        .tickSize(10)
        .tickPadding(5)
        .tickSizeOuter(0)

        svg.append("g")
            .attr("class", "bottomAxis")
            .attr("transform", `translate(${margin.left},${graph_height})`)
            .call(bottomAxis) // connect x-akse to outerDonut
            .attr("fill", "green")


        // y-axis
        const leftAxis = d3.axisLeft(yScale)
            .tickSize(0)
           // .ticks(2)
            .tickPadding(20)
            //.tickValues([1, 10])
            //.tickFormat((d, i) => d === 1 ? "Least changes" : (d === 10 ? "Most changes" : ""))

            

        svg.append("g")
            .attr("class", "leftAxis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(leftAxis)
           // .selectAll("text") // Select all text elements within the axis
           // .attr("transform", "rotate(-45)")
           // .attr("text-anchor", "end")

            const primaryGroup = d3.rollup(data,
                (D) => [d3.sum(D, d => d.linesChanged), d3.sum(D, d => d.linesAdded), d3.sum(D, d => d.linesDeleted)],
                (w) => w.week,
                (d) => d.fileName,
                (d) => d.author)

            var nodes = []
            primaryGroup.forEach((fileMap, week) => {

                // sum changes for all files in week
                const fileArray = Array.from(fileMap, ([fileName, authorMap]) => {
                    const totalLinesChanged = d3.sum(authorMap.values().map(x => x[0]))
                    return { fileName, totalLinesChanged };
                })

                // find top ten changed files in week
                fileArray.sort((a, b) => b.totalLinesChanged - a.totalLinesChanged)
                const topTenFiles = fileArray.slice(0, 10).reverse() // reverse to have most changed files on top


                for (let i = 0; i < topTenFiles.length; i++) { // for loop for each file in a week
                    const fileName = topTenFiles[i].fileName
                    const authorMap = fileMap.get(fileName)

                    //buildPie(authorMap, week, i, fileName, svg)
                    nodes.push({
                        x: week, 
                        y: topTenFiles[i].totalLinesChanged, 
                        fileName: fileName, 
                        authorMap: authorMap,
                        //totalLinesChanged: totalLinesChanged
                    })

                }

            })

            nodes.forEach(d => buildPie(d, svg))

            const tick = () => {
                d3.selectAll(".singleDonut")
                    .data(nodes)
                    .attr("transform", d => `translate(${d.x}, ${d.y})`)
            }

            d3.forceSimulation(nodes)
                .force("x", d3.forceX(d => xScale(d.x) + xScale.bandwidth()/2).strength(0.8))
                .force("y", d3.forceY(d => yScale(d.y)).strength(1))
                .force("collide", d3.forceCollide().radius(graph_radius))
                .on("tick", tick)
                
            
            /*for (let i = 0; i < 100; i++) {
                simulation.tick()   
            }*/

            

            
        
    }

    createGraph()


    window.addEventListener("resize", createGraph)


}

