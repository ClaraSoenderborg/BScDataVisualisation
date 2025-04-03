var setMetadata
var tooltipColorScale

const createClickTooltip = (svg, metadata, cs) => {

    setMetadata = metadata
    tooltipColorScale = cs

    // Chapter 7 i bogen
    const toolTip = svg
        .append("g")
        .attr("class", "clickTooltip")
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
        .attr("x", tooltip_padding)
        .attr("y", tooltip_padding)

    // group for pie chart
    toolTip.append("g")
        .attr("class", "tooltip-donut")
        .attr("transform", `translate(${tooltip_width / 2},${tooltip_height / 2 + tooltip_padding})`)

    toolTip.append("text")
        .attr("class", "tooltipTotal")
        .attr("text-anchor", "end")
        .style("dominant-baseline", "hanging")


    // Hide the tooltip when clicking anywhere on the page except on the donuts
    d3.select(document).on("click", (e, d) => {

        d3.select(".clickTooltip")
            .style("visibility", "hidden")

        d3.selectAll(".singleDonut")
            .style("opacity", 1)


    })

    d3.select(".clickTooltip")
        .on("click", (e) => {
            e.stopPropagation()
        })


    window.addEventListener("resize", function (e) {
        closeTooltip(e)
    })


}

function closeTooltip(e) {
    d3.selectAll(".singleDonut")
        .style("opacity", 1)

    d3.select(".clickTooltip")
        .style("visibility", "hidden")

    d3.selectAll(".details text").remove()
    d3.selectAll(".tooltip-donut path").remove()
    d3.selectAll(".labelLines").remove()
    d3.selectAll(".labelText").remove()


    e.stopPropagation()
}


// When text is wrapped, make tooltip larger
function adjustTooltipHeight(lineNumber) {
    // Update the tooltip background size
    d3.select(".clickTooltip rect")
        .attr("height", tooltip_height + (lineNumber * click_line_height))
        .attr("width", tooltip_width)

    // Ensure the donut chart remains centered within the new tooltip height
    d3.select(".tooltip-donut")
        .attr("transform", `translate(${tooltip_width / 2},${tooltip_height / 2 + (click_line_height * lineNumber) + tooltip_padding})`)

}


function showTooltipOnClick(e, fileName, authorMap, svg, nodeSize) {

    // close previous tooltip and recalculate shared variables
    closeTooltip(e)
    reCalculateSizes()

    const [x, y] = d3.pointer(e, svg.node())


    const totalText = d3.select(".tooltipTotal")
        .text(`Total ${setMetadata.nodeSize}: ${nodeSize}`)
        .attr("x", tooltip_width - tooltip_padding)
        .attr("y", tooltip_padding)


    const totalTextLength = totalText.node().getComputedTextLength()

    const element = d3.select(".tooltipTitle")

    const retLineNumber = wrapText(
        element,
        fileName,
        tooltip_max_width - totalTextLength - tooltip_padding,
        click_line_height
    )

    adjustTooltipHeight(retLineNumber)

    d3.select(".clickTooltip")
        .attr("transform", `translate(${calculateTooltipX(x, tooltip_width)}, ${calculateTooltipY(y, tooltip_height)})`)
        .style("visibility", "visible")
        .raise()
        .transition()
        .duration(200)
        .style("opacity", 1)

    d3.select(".toolTip-donut")
        .call(() => buildTooltipChart(d3.select(".tooltip-donut"), authorMap))
}



//source: https://gist.github.com/dbuezas/9306799
function buildTooltipChart(singleDonut, authorMap) {

    var pie = d3.pie().sort(null).value(([key, value]) => value.get("nodeSize"))
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
        .attr("fill", d => tooltipColorScale(d.data[0]));

    var lastAddedEndPoint = [9999, 9999]

    function calculateLinePoints(d) {
        const posStart = arcGen.centroid(d); // Center of segment

        const posMid = [posStart[0] * 2.5, posStart[1] * 2.5]; // Extend position outward

        const posEnd = [posMid[0] + (posMid[0] > 0 ? 25 : -25), posMid[1]]; // Shift label

        // check if x and y will overlap with last added end point
        if ((Math.abs(lastAddedEndPoint[1] - posEnd[1]) <= label_height * 2) && Math.sign(lastAddedEndPoint[0]) === Math.sign(posEnd[0])) {
            posEnd[1] = posEnd[1] - label_height  //shift y-value by 3 if overlapping
            posMid[1] = posMid[1] - label_height
        }

        lastAddedEndPoint = posEnd

        return [posStart, posMid, posEnd];
    }


    // Add polylines for labels
    arcs.append("polyline")
        .attr("class", "labelLines")
        .attr("points", function (d) {
            d.calcPoints = calculateLinePoints(d)
            return d.calcPoints.map(p => p.join(",")).join(" ")
        })
        .style("fill", "none")
        .style("stroke", "dimgrey")
        .style("stroke-width", "1px");



    // Add labels outside segments
    arcs.append("text")
        .attr("class", "labelText")
        .attr("transform", d => {
            const points = d.calcPoints
            const posEnd = points[2]

            posEnd[0] += (posEnd[0] > 0 ? 2 : -2); // padding between line and label

            return `translate(${posEnd})`;
        })
        .attr("text-anchor", function (d) {
            const points = d.calcPoints
            const posEnd = points[2]

            return posEnd[0] > 0 ? "start" : "end"
        })
        .style("dominant-baseline", "middle")
        .attr("fill", d => tooltipColorScale(d.data[0]))
        .each(function (d) {
            console.log(d.data)
            if (setMetadata.nodeSize === "churn") {
                const textElement = d3.select(this)

                const lines = [
                    `Lines added: ${d.data[1].get("linesAdded")}`,
                    `Lines deleted: ${d.data[1].get("linesDeleted")}`
                ];
                textElement.selectAll("tspan")
                    .data(lines)
                    .enter()
                    .append("tspan")
                    .attr("x", 0)
                    .attr("dy", (d, i) => i === 0 ? "0em" : "1.2em") // Space between lines
                    .text(d => d);
            } else if (setMetadata.nodeSize === "growth") {
                const textElement = d3.select(this)
                textElement.text(`Growth: ${d.data[1].get("nodeSize")}`)
            } else if (setMetadata.nodeSize === "commit") {
                const textElement = d3.select(this)
                textElement.text(`Commits: ${d.data[1].get("nodeSize")}`)
            }
        })

}

