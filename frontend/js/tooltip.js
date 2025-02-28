const createTooltip = (svg) => {

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
        .attr("rx", 10)
        .attr("ry", 10)
        .style("fill-opacity", 1)
        .attr("fill", "white")
        .attr("stroke", "grey")
        .attr("stroke-width", "1px")

    toolTip
        .append("text")
        .attr("class", "tooltipTitle")
        .attr("x", tooltip_width / 2)
        .attr("y", 100)
        //.attr("text-anchor", "middle")
        .attr("alignment-baseline", "hanging")
        //.style("font-size", "4px")
    
    toolTip.append("g")
        .attr("class", "tooltip-donut")
        .attr("transform", `translate(${tooltip_width/2},${tooltip_height/2 + tooltip_padding})`)
    
    // Hide the tooltip when clicking anywhere on the page except on the donuts
    d3.select(document).on("click", (e, d) => {

        d3.select(".toolTip")
        .style("visibility", "hidden")

        d3.selectAll(".singleDonut")
        .style("opacity", 1)


    })

    d3.select(".toolTip")
    .on("click", (e) => {
        e.stopPropagation()
    })

}



// wrap text to next line in toolTip - very chatty
function wrapText(text) {
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

        if (textWidth > tooltip_max_width
        ) {
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
    //d3.select(".toolTip rect").attr("height", newHeight);
}

function showTooltipOnClick(e, d, fileName, authorMap, svg) {

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
        //.text(fileName)
    .call(() => wrapText(fileName))


    d3.select(".toolTip")
        .attr("transform", `translate(${calculateTooltipX(x)}, ${calculateTooltipY()})`)
        .style("visibility", "visible")
        .raise()
        .transition()
        .duration(200)
        .style("opacity", 1)

    

    d3.select(".toolTip-donut")
        .call(() => buildTooltipChart(d3.select(".tooltip-donut"), authorMap))

    console.log(d3.select(".toolTip"));
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

//source: https://gist.github.com/dbuezas/9306799
function buildTooltipChart(singleDonut, authorMap) {

    var pie = d3.pie().sort(null).value(([key, value]) => value[0])
    const preparedPie = pie(authorMap);

    var arcGen = d3.arc()
        .innerRadius(donutHole)
        .outerRadius(toolTip_radius)

    var arcs = singleDonut.selectAll(".arc")
        .data(preparedPie)
        .join("g")
        .attr("class", "arc")
        .attr("stroke", "white")
        .attr("stroke-width", "1");

    arcs.append("path")
        .attr("d", arcGen)
        .attr("fill", d => colorScale(d.data[0]));

    var lastAddedEndPoint = [9999, 9999]

    function calculateLinePoints(d) {
        const posStart = arcGen.centroid(d); // Center of segment

        const posMid = [posStart[0] * 2.5, posStart[1] * 2.5]; // Extend position outward

        const posEnd = [posMid[0] + (posMid[0] > 0 ? 25 : -25), posMid[1]]; // Shift label

        // check if x and y will overlap with last added end point
        if ((Math.abs(lastAddedEndPoint[1] - posEnd[1]) <= 60) && Math.sign(lastAddedEndPoint[0]) === Math.sign(posEnd[0])) {
            posEnd[1] = posEnd[1] - 10 //shift y-value by 3 if overlapping
            posMid[1] = posMid[1] - 10
        }

        lastAddedEndPoint = posEnd

        return [posStart, posMid, posEnd];
    }


    // Add polylines for labels
    arcs.append("polyline")
        .attr("class", "labelLines")
        .attr("points", d => calculateLinePoints(d).map(p => p.join(",")).join(" "))
        .style("fill", "none")
        .style("stroke", "dimgrey")
        .style("stroke-width", "1px");



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
        .attr("fill", d => colorScale(d.data[0]))
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




