const width = 300
const height = 100
const margin = { top: 10, right: 0, bottom: 10, left: 20 }
const radius = Math.min(width, height) / 30
const donutHole = radius * 0.0
const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom
const max_width = 120
const line_height = 5
const tooltip_padding = 5
const tooltip_width = 130
const tooltip_height = 70
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



// Chapter 7 i bogen
const toolTip = svg
    .append("g")
    //.style("opacity", 0)
    .attr("class", "toolTip")
    .style("visibility", "hidden")

toolTip
    .append("rect")
    .attr("width", tooltip_width)
    .attr("height", tooltip_height)
    .attr("rx", 3)
    .attr("ry", 3)
    .style("fill-opacity", 1)
    .attr("fill", "white")
    .attr("stroke", "grey")
    .attr("stroke-width", "0.3px")

toolTip
    .append("text")
    .attr("x", tooltip_width / 2)
    .attr("y", 100)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .style("font-size", "4px")

const infoGroup = toolTip.append("g")
    .attr("class", "details")
    .attr("transform", "translate(65,20)")


const donutGroup = toolTip.append("g")
    .attr("class", "tooltip-donut")
    .attr("transform", `translate(${tooltip_width / 2},40)`)


// wrap text to next line in toolTip - very chatty
function wrapText(text, maxWidth) {
    const textElement = d3.select(".toolTip text")
    textElement.text("") // Set the full text initially

    let segments = text.split("/"); // Split at "/"
    let currentLine = "";
    let lineNumber = 0;
    let start_x = tooltip_padding
    let start_y = tooltip_padding

    segments.forEach((segment, index) => {
        let newLine = currentLine ? currentLine + "/" + segment : segment; // Keep adding segments

        // Create a temporary invisible text element to measure width
        let tempText = textElement.append("tspan").text(newLine);
        let textWidth = tempText.node().getComputedTextLength();
        tempText.remove(); // Remove temp element after measuring

        if (textWidth > maxWidth) {
            // If the current line exceeds max width, finalize the previous line and start a new one
            if (currentLine) {
                textElement.append("tspan")
                    .attr("x", start_x) // Center text
                    .attr("y", start_y + line_height * lineNumber)
                    .attr("text-anchor", "start")
                    .attr("alignment-baseline", "hanging")
                    .text(currentLine);
                lineNumber++;
            }
            currentLine = "/" + segment; // Start a new line with the current segment
        } else {
            currentLine = newLine; // Continue adding to the same line
        }
    });

    // Append the last remaining line
    textElement.append("tspan")
        .attr("x", start_x) // Center text
        .attr("y", start_y + line_height * lineNumber)
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "hanging")
        .text(currentLine);

    // Adjust tooltip height dynamically
    const newHeight = Math.max(70, (lineNumber + 1) * line_height + tooltip_padding * 2);
    d3.select(".toolTip rect").attr("height", newHeight);
}

const createVis = (data) => {

    authorColor(data)
    createLegend(data)
    //handleMouse()

    const primaryGroup = d3.rollup(data,
        (D) => [d3.sum(D, d => d.linesChanged), d3.sum(D, d => d.linesAdded), d3.sum(D, d => d.linesDeleted)],
        (w) => w.week,
        (d) => d.fileName,
        (d) => d.author)

    defineScales(primaryGroup)

    // x-axis
    const bottomAxis = d3.axisBottom(xScale)
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
        .tickFormat((d, i) => d === 1 ? "Least changes" : (d === 10 ? "Most changes" : ""))

    outerDonutGroup.append("g")
        .call(leftAxis)
        .selectAll("text") // Select all text elements within the axis
        .attr("transform", "rotate(-45)")
        .attr("text-anchor", "end")
        .style("font-size", "3px") // Sets the size of the text



    primaryGroup.forEach((fileMap, week) => {

        // sum changes for all files in week
        const fileArray = Array.from(fileMap, ([fileName, authorMap]) => {
            const totalLinesChanged = d3.sum(authorMap.values().map(x => x[0]))
            return { fileName, totalLinesChanged };
        })

        // find top ten changed files in week
        fileArray.sort((a, b) => b.totalLinesChanged - a.totalLinesChanged)
        const topTenFiles = fileArray.slice(0, 10).reverse() // reverse to have most changed files on top 
=======
        const topTenFiles = fileArray.slice(0, 10).reverse() // reverse to have most changed files on top
        console.log(topTenFiles)
>>>>>>> legend

        for (let i = 0; i < topTenFiles.length; i++) { // for loop for each file in a week
            const fileName = topTenFiles[i].fileName
            const authorMap = fileMap.get(fileName)


            const singleDonut = outerDonutGroup.append("g")
                .attr("transform", `translate(${xScale(week) + xScale.bandwidth() / 2},${yScale(i + 1) + yScale.bandwidth() / 2})`)
                .style("opacity", 1)
                .attr("class", "singleDonut")
                .on("click", (e, d) => {

                    d3.selectAll(".singleDonut")
                        .style("opacity", 1)

                    d3.selectAll(".details text")
                        .remove()
                    d3.selectAll(".tooltip-donut path").remove()
                    d3.selectAll(".labelLines").remove()
                    d3.selectAll(".labelText").remove()


                    e.stopPropagation() // something to do with closing the tooltip again

                    const [x, y] = d3.pointer(e, svg.node())
                    console.log(`x: ${x}`)
                    console.log(`y: ${y}`)

                    d3.select(".toolTip text")
                        .call(() => wrapText(fileName, max_width))


                    d3.select(".toolTip")
                        .attr("transform", `translate(${calculateTooltipX(x)}, ${calculateTooltipY()})`)
                        .style("visibility", "visible")
                        .raise()
                        .transition()
                        .duration(200)
                        .style("opacity", 1)

                    d3.select(".toolTip-donut")
                        .call(() => buildTooltipChart(d3.select(".tooltip-donut"), authorMap, 0, 20))

                    singleDonut.style("opacity", 0.5)


                })

            buildSingleDonut(singleDonut, authorMap, radius, donutHole)

        }

    });
}

function calculateTooltipX(x) {
    if (x > (width / 2 + (margin.left * 0.5))) { // clicked object is on right side
        return x - tooltip_width - 10
    } else {
        return x + 10 // clicked object is on left side
    }

}

function calculateTooltipY() {
    return height - tooltip_height - margin.top * 1.5
}

function buildSingleDonut(singleDonut, authorMap, radius, donuthole) {
    var pie = d3.pie().sort(null).value(([key, value]) => value[0]);

    const preparedPie = pie(authorMap)

    var arcGen = d3.arc()
        .innerRadius(donuthole)
        .outerRadius(radius)



    var arcs = singleDonut.selectAll()
        .data(preparedPie)
        .join("g")
        .attr("stroke", "white")
        .attr("stroke-width", "0.1")

    arcs.append("path")
        .attr("d", arcGen)
        .attr("fill", d => color(d.data[0]))
}


//source: https://gist.github.com/dbuezas/9306799

function buildTooltipChart(singleDonut, authorMap, radius, donuthole) {

    var pie = d3.pie().sort(null).value(([key, value]) => value[0])
    const preparedPie = pie(authorMap);


    var arcGen = d3.arc()
        .innerRadius(donuthole)
        .outerRadius(radius)


    var outerArc = d3.arc().innerRadius(0).outerRadius(radius * 1.2);

    var arcs = singleDonut.selectAll(".arc")
        .data(preparedPie)
        .join("g")
        .attr("class", "arc")
        .attr("stroke", "white")
        .attr("stroke-width", "0.1");

    arcs.append("path")
        .attr("d", arcGen)
        .attr("fill", d => color(d.data[0]));

    var lastAddedEndPoint = [9999, 9999]

    function calculateLinePoints(d) {
        const posStart = arcGen.centroid(d); // Center of segment

        const posMid = [posStart[0] * 2.5, posStart[1] * 2.5]; // Extend position outward

        const posEnd = [posMid[0] + (posMid[0] > 0 ? 10 : -10), posMid[1]]; // Shift label

        // check if x and y will overlap with last added end point
        if ((Math.abs(lastAddedEndPoint[1] - posEnd[1]) <= 10) && Math.sign(lastAddedEndPoint[0]) === Math.sign(posEnd[0])) {
            posEnd[1] = posEnd[1] - 3 //shift y-value by 3 if overlapping
        }

        lastAddedEndPoint = posEnd

        return [posStart, posMid, posEnd];
    }


    // Add polylines for labels
    arcs.append("polyline")
        .attr("class", "labelLines")
        .attr("points", d => calculateLinePoints(d).map(p => p.join(",")).join(" "))
        .style("fill", "none")
        .style("stroke", "grey")
        .style("stroke-width", "0.2px");



    // Add labels outside segments
    arcs.append("text")
        .attr("class", "labelText")
        .attr("transform", d => {
            const points = calculateLinePoints(d)
            const posEnd = points[2]

            posEnd[0] += (posEnd[0] > 0 ? 2 : -2); // padding between line and label

            return `translate(${posEnd})`;
        })
        .attr("text-anchor", function (d) {
            const points = calculateLinePoints(d)
            const posEnd = points[2]


            return posEnd[0] > 0 ? "start" : "end"
        })
        .style("font-size", "3px")
        .attr("font-weight", "bold")
        .attr("stroke", "none")
        .attr("fill", d => color(d.data[0]))
        .each(function (d) {
            const textElement = d3.select(this);
            const lines = [
                `Lines added: ${d.data[1][1]}`,
                `Lines deleted: ${d.data[1][2]}`
            ];
            textElement.selectAll("tspan")
                .data(lines)
                .enter()
                .append("tspan")
                .attr("x", 0)
                .attr("dy", (d, i) => i === 0 ? "0em" : "1.2em") // Space between lines
                .text(d => d);
        })

}



// Hide the tooltip when clicking anywhere on the page except on the donuts
d3.select(document).on("click", (e, d) => {

    d3.select(".tooltip")
        .style("visibility", "hidden")

    d3.selectAll(".singleDonut")
        .style("opacity", 1)


})
d3.select(".toolTip")
    .on("click", (e) => {
        e.stopPropagation()
    })



const authorColor = (data) => {
    const authors = Array.from(d3.union(data.map(d => d.author)))
    color = d3.scaleOrdinal(d3.schemeSet2).domain(authors)
}


// Create the legend
const createLegend = (data) => {
    const authors = Array.from(d3.union(data.map(d => d.author)))

    const legendWidth = Math.max(...(authors.map(a => a.length))) * 8
    const legendHeight = authors.length * 25;

    var legendSvg = d3.select("#vis")
        .append("svg")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("border", "1px solid black")
        .attr("transform", "translate(0, 0)")

    // Add rectangles for each author with a corresponding color
    legendSvg.selectAll("circle")
        .data(authors)
        .join("circle")
        .attr("cx", 10)
        .attr("cy", (d, i) => 20 + i * 20)
        .attr("r", 7)
        .attr("fill", (d) => color(d))

    // Add text for each author
    legendSvg.selectAll("text")
        .data(authors)
        .join("text")
        .attr("x", 25)
        .attr("y", function (d, i) { return 20 + i * 20 })
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("fill", function (d) { return color(d) })

};

