const buildPie = (node, svg) => {

    const { x, y, yearWeek, fileName, authorMap, nodeSize, yAxis, yAxisMetric, nodeSizeMetric } = node

    const leftAxisGroup = svg.select(".leftAxis")

    const singleDonut = leftAxisGroup.append("g")
        .attr("transform", `translate(${x}, ${y})`)
        .attr("class", `singleDonut ${sanitizeClassName(fileName)}`)
        .on("click", (e, d) => {

            showTooltipOnClick(
                {
                    e,
                    data: {
                        fileName: fileName,
                        authorMap: authorMap,
                        nodeSize: nodeSize
                    },
                    svg
                })
            singleDonut.style("opacity", 0.5)
            d3.select(".hoverTooltip").style("visibility", "hidden")

        })
        .on("mouseover", (e, d) => {
            if (d3.select(".clickTooltip").style("visibility") !== "visible") {
                showTooltipOnHover({
                    e,
                    data: {
                        fileName: fileName,
                        yAxis: yAxis,
                        yAxisMetric: yAxisMetric,
                        authorMap: authorMap,
                        nodeSize: nodeSize,
                        nodeSizeMetric: nodeSizeMetric,
                    },
                    svg
                })
                singleDonut.style("opacity", 0.5)

                const className = sanitizeClassName(fileName);

                // Select all matching single donuts
                d3.selectAll(`.${className}`)
                    .each(function () {
                        const pie = d3.select(this);
                        const bbox = this.getBBox();
                        pie.insert("circle", ":first-child")
                            .attr("class", "highlight-ring")
                            .attr("r", bbox.width * 0.75) // slightly bigger than donut
                            .attr("stroke", "magenta")
                            .attr("stroke-width", 2)
                    });
            }

        })
        .on("mouseout", (e, d) => {
            if (d3.select(".clickTooltip").style("visibility") !== "visible") {
                d3.select(".hoverTooltip").style("visibility", "hidden")
                singleDonut.style("opacity", 1)

                const className = sanitizeClassName(fileName);

                d3.selectAll(`.${className}`)
                    .style("opacity", 1)
                    .selectAll(".highlight-ring").remove();
            }

        })

    var pie = d3.pie().sort(null).value(([key, value]) => value.get("nodeSize"))

    const preparedPie = pie(authorMap)

    const drawPie = () => {
        var arcGen = d3.arc()
            .innerRadius(donutHole)
            .outerRadius(rScale(nodeSize))

        var arcs = singleDonut.selectAll()
            .data(preparedPie)
            .join("g")
            .attr("class", "pie-arc")

        arcs.selectAll("path").remove()

        arcs.append("path")
            .attr("d", arcGen)
            .attr("fill", d => colorScale(d.data[0]))
    }

    drawPie()

}

function sanitizeClassName(str) {
    return str.replace(/[^a-zA-Z0-9-_]/g, "_")
}


