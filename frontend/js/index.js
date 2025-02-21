const width = 300
const height = 100
const margin = { top: 10, right: 0, bottom: 10, left: 20 }
const radius = Math.min(width, height) / 30
const donutHole = radius * 0.0
const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom
var color

const yScale = d3.scaleBand()
const xScale = d3.scaleBand()

const defineScales = (data) => {
    const sortedweeks = Array.from(data.keys()).sort()
    xScale
        .domain(sortedweeks) // key is week
        .range([0, innerWidth])
    yScale
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        .range([innerHeight, 0]) // start y-axis at zero
        .paddingInner(0.2)
        .paddingOuter(0.2)
}


d3.csv("../../data/data.csv", d3.autoType).then(data => {
    createVis(data)
});


const svg = d3.select("#vis")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)

const outerDonutGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)


const createVis = (data) => {

    authorColor(data)
    createLegend(data)

    const primaryGroup = d3.rollup(data,
        (D) => d3.sum(D, d => d.linesChanged),
        (w) => w.week,
        (d) => d.fileName,
        (d) => d.author)

    defineScales(primaryGroup)

    // x-axis
    const bottomAxis = d3.axisBottom(xScale)
        //.tickValues(d3.range([0,10]))
        .tickSize(0)

    outerDonutGroup.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(bottomAxis) // connect x-akse to outerDonut
        .selectAll("text") // Select all text elements within the axis
        .style("font-size", "4px") // Sets the size of the text



    // y-axis
    const leftAxis = d3.axisLeft(yScale)
        .tickSize(0)
        .ticks(2)
        .tickValues([1, 10])
        .tickFormat((d,i) => d === 1 ? "Least \n changes" : (d === 10 ? "Most \n changes": ""))

    outerDonutGroup.append("g")
        //.attr("transform", `translate(${margin.left})`)
        .call(leftAxis)
        .selectAll("text") // Select all text elements within the axis
        .attr("transform", "rotate(-45)")
        .attr("text-anchor", "end")

        .style("font-size", "3px") // Sets the size of the text



    primaryGroup.forEach((fileMap, week) => {

        // sum changes for all files in week
        const fileArray = Array.from(fileMap, ([fileName, authorMap]) => {
            const totalLinesChanged = d3.sum(authorMap.values())
            return { fileName, totalLinesChanged };
        })

        // find top ten changed files in week
        fileArray.sort((a, b) => b.totalLinesChanged - a.totalLinesChanged)
        const topTenFiles = fileArray.slice(0, 10).reverse() // reverse to have most changed files on top
        console.log(topTenFiles)

        for (let i = 0; i < topTenFiles.length; i++) { // for loop for each file in a week
            const fileName = topTenFiles[i].fileName
            const authorMap = fileMap.get(fileName)

            const singleDonut = outerDonutGroup.append("g")
                .attr("transform", `translate(${xScale(week) + xScale.bandwidth() / 2},${yScale(i + 1) + yScale.bandwidth() / 2})`)


            var pie = d3.pie().sort(null).value(([key, value]) => value);

            const preparedPie = pie(authorMap)

            var arcGen = d3.arc()
                .innerRadius(donutHole)
                .outerRadius(radius)

            var arcs = singleDonut.selectAll()
                .data(preparedPie)
                .join("g")
                .attr("stroke", "white")
                .attr("stroke-width", "0.1")
            //.attr("class", `arc-${fileName}`)

            arcs.append("path")
                .attr("d", arcGen)
                .attr("fill", d => color(d.data[0]))

        }

    });

}


/*
const buildDonut = (fileName, authorMap) => {
    const singleDonut = donutContainers.append("g")
    //todo: transform with yscale

    console.log("buildDonut")

    console.log(fileName)
    console.log(authorMap)


    var pie = d3.pie().sort(null).value(([key, value]) => value);

    const preparedPie = pie(authorMap)

    var arcGen = d3.arc()
        .innerRadius(donutHole)
        .outerRadius(radius)

    var arcs = singleDonut.selectAll(`.arc-${fileName}`)
        .data(preparedPie)
        .join("g")
        .attr("class", `arc-${fileName}`)

    arcs.append("path")
        .attr("d", arcGen)
        .attr("fill", d => color(d.data[0]))

}*/


const authorColor = (data) => {
    const authors = Array.from(d3.union(data.map(d => d.author)))
    color = d3.scaleOrdinal(d3.schemeCategory10).domain(authors)
}


const createLegend = (data) => {
    const authors = Array.from(d3.union(data.map(d => d.author)));

    const maxWidth = window.innerWidth - 20 // Max width before wrapping
    const rowHeight = 30 // Space for each row
    var usedRows = 1 
    let xPosition = 10  
    let yPosition = 12  

    // Create SVG for legend
    const legendSvg = d3.select("#vis")
        .append("svg")
        .attr("width", maxWidth)
        .attr("viewBox", `0 0 ${maxWidth} 0}`)
        .style("border", "1px solid black")
        .attr("transform", `translate(0, 80)`)

    // Bind data and create groups for each author
    const legendItems = legendSvg.selectAll(".legend-item")
        .data(authors)
        .join("g")
        .attr("class", "legend-item")
        .each(function (d) {
            const textElem = d3.select(this).append("text")
                .attr("x", 15)  // Space from circle
                .attr("y", 5)
                .text(d)
                .style("alignment-baseline", "middle")
                .style("fill", color(d))

            const textWidth = textElem.node().getComputedTextLength() // Measure text width

            // Check if the next item would exceed max width
            if (xPosition + textWidth + 30 > maxWidth) {
                xPosition = 10  // Move to new row
                yPosition += rowHeight
                usedRows++
            }

            d3.select(this).attr("transform", `translate(${xPosition}, ${yPosition})`)
            xPosition += textWidth + 50 // Update X position for next item
        });

    legendItems.append("circle")
        .attr("cx", 7)
        .attr("cy", 5)
        .attr("r", 4)
        .attr("fill", color)

    // Adjust SVG height dynamically based on rows
    legendSvg.attr("height", usedRows * rowHeight)
    
};
