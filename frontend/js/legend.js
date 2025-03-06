const createLegend = (data, div) => {
    const authors = Array.from(d3.union(data.map(d => d.author)));

    const rowHeight = 30 // Space for each row
    var usedRows = 1
    let xPosition = margin.left
    let yPosition = margin.top + 5


    // add legend to svg
    const legend = div
        .append("svg")
        .attr("class", "legendSVG")
        .attr("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`) 


    const background = legend
        .append("rect")
        .attr("class", "legend-background")
        .attr("x", margin.left)
        .attr("width", width)
        .attr("height", legendHeight)
        //.attr("fill", "#E8ADAA")
        //.attr("fill", "#FFA07A")
        //.attr("fill", "#D2B48C")
        //.attr("fill", "#EBF4FA")


    // Bind data and create groups for each author
    const legendItems = legend.selectAll(".legend-item")
        .data(authors)
        .join("g")
        .attr("class", "legend-item")
        .each(function (d) {
            const textElem = d3.select(this).append("text")
                .attr("class", "legend-text")
                .attr("x", 15)  // Space from circle
                .attr("y", 5)
                .text(d)
                .style("fill", colorScale)

            const textWidth = textElem.node().getComputedTextLength() // Measure text width

            // Check if the next item would exceed max width
            if (xPosition + textWidth + 20 > width) {
                xPosition = margin.left  // Move to new row
                yPosition += rowHeight
                usedRows++
            }

            d3.select(this).attr("transform", `translate(${xPosition}, ${yPosition})`)
            xPosition += textWidth + 35 // Update X position for next item and aligns item
        });

    legendItems.append("circle")
        .attr("class", "legend-circle")
        .attr("fill", colorScale)

    var legendHeight = usedRows * rowHeight
    background.attr("height", legendHeight + 5) // make sure rect follows height of legend

}