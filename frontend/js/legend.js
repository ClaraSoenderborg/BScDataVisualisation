const createLegend = (data, div) => {
    const authors = Array.from(d3.union(data.map(d => d.author)));

    const maxWidth = width // Max width before wrapping
    const rowHeight = 10 // Space for each row
    var usedRows = 1
    let xPosition = margin.left
    let yPosition = 12


    // add legend to svg
    const legend = div
        .append("svg")
        .attr("class", "legendSVG")
        //.append("g")
        //.attr("viewBox", `0 0 ${width} ${height}}`) //set to width

        //.attr("transform", `translate(0, ${margin.top + 80})`)


    const background = legend
        .append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top + 2)
        .attr("width", maxWidth)
        .attr("height", legendHeight)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("fill", "#DCD0FF")
        //.attr("fill", "#E8ADAA")
        //.attr("fill", "#FFA07A")
        //.attr("fill", "#D2B48C")
        //.attr("fill", "#EBF4FA")
        .attr("fill-opacity", 0.2)


    // Bind data and create groups for each author
    const legendItems = legend.selectAll(".legend-item")
        .data(authors)
        .join("g")
        .attr("class", "legend-item")
        .each(function (d) {
            const textElem = d3.select(this).append("text")
                .attr("x", 10)  // Space from circle
                .attr("y", 5)
                .text(d)
                .style("alignment-baseline", "middle")
                .style("fill", colorScale)
                //.attr("font-size", "4px")

            const textWidth = textElem.node().getComputedTextLength() // Measure text width

            // Check if the next item would exceed max width
            if (xPosition + textWidth + 30 > maxWidth) {
                xPosition = margin.left  // Move to new row
                yPosition += rowHeight
                usedRows++
            }

            d3.select(this).attr("transform", `translate(${xPosition}, ${yPosition})`)
            xPosition += textWidth + 15 // Update X position for next item and aligns item
        });

    legendItems.append("circle")
        .attr("cx", 7)
        .attr("cy", 5)
        .attr("r", 1)
        .attr("fill", colorScale)

    var legendHeight = usedRows * rowHeight
    background.attr("height", legendHeight) // make sure rect follows height of legend

    // Adjust SVG height dynamically based on rows
    //legend.attr("height", legendHeight)



}