

const drawGraph = (data, div) => {

    const svg = div
        .append("svg")
        .attr("class", "graphSVG")
        .attr("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`)
    
    createTooltip(svg)

    /*const innerGraph = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)*/

    const primaryGroup = d3.rollup(data,
        (D) => [d3.sum(D, d => d.linesChanged), d3.sum(D, d => d.linesAdded), d3.sum(D, d => d.linesDeleted)],
        (w) => w.week,
        (d) => d.fileName,
        (d) => d.author)

    // x-axis
    const bottomAxis = d3.axisBottom(xScale)
        .tickSize(10)
        .tickPadding(5)
        .tickSizeOuter(0)

    svg.append("g")
        .attr("class", "bottomAxis")
        .attr("transform", `translate(${margin.left},${innerHeight})`)
        .call(bottomAxis) // connect x-akse to outerDonut
        .selectAll("text") // Select all text elements within the axis

        //.style("font-size", "4px") // Sets the size of the text


    // y-axis
    const leftAxis = d3.axisLeft(yScale)
        .tickSize(0)
        .ticks(2)
        .tickPadding(20)
        .tickValues([1, 10])
        .tickFormat((d, i) => d === 1 ? "Least changes" : (d === 10 ? "Most changes" : ""))

    svg.append("g")
        .attr("class", "leftAxis")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(leftAxis)
        .selectAll("text") // Select all text elements within the axis
        .attr("transform", "rotate(-45)")
        .attr("text-anchor", "end")
        //.style("font-size", "3px") // Sets the size of the text



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

            buildPie(authorMap, week, i, fileName, svg)

        }

    })




}

