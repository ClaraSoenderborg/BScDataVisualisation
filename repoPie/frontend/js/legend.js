/**
 * Creates and displays a legend, showing each unique author and their corresponding color.
 * Source: E. Meeks, and A. Dafour, “D3.js in action”, Third edition, chapter 5.3., 2024.
 */
const createLegend = () => {
    const authors = colorScale.domain()
    const rowHeight = 30 

    const div = d3.select("#legendDiv")
    const legend = div.append("svg")

    /**
     * Draws the legend dynamically based on authors
     */
    const drawLegend = () => {
        let usedRows = 1
        let xPosition = margin.left * 1.25
        let yPosition = margin.top + 5

        legend.selectAll(".legend-item").remove()
        legend.selectAll(".legend-background").remove()

        // Bind data to legend items (authors) and create groups for each
        const legendItems = legend.selectAll(".legend-item")
            .data(authors)
            .join("g")
            .attr("class", "legend-item")
            .each(function (d) {
                const textElem = d3.select(this).append("text")
                    .attr("class", "legend-text")
                    .style("dominant-baseline", "middle")
                    .attr("x", 15) // Space from circle
                    .attr("y", 5)
                    .text(d)
                    .style("fill", colorScale)

                const textWidth = textElem.node().getComputedTextLength()

                // Check if the next item would exceed max width
                if (xPosition + textWidth + 20 > width) {
                    xPosition = margin.left * 1.25 
                    yPosition += rowHeight
                    usedRows++ // Wrap to new line
                }

                // Position the legend
                d3.select(this).attr("transform", `translate(${xPosition}, ${yPosition})`)
                xPosition += textWidth + 55 
            })

        const background = legend.append("rect")
            .attr("class", "legend-background")
            .attr("x", margin.left)
            .attr("rx", 8) 
            .attr("ry", 8) 

        // Append circles 
        legendItems.append("circle")
            .attr("class", "legend-circle")
            .attr("cx", 5) 
            .attr("cy", 5) 
            .attr("r", 3)
            .attr("fill", colorScale)
            

        // Update legend background height according to used rows
        const legendHeight = usedRows * rowHeight
        background
            .attr("height", legendHeight + 5)
            .attr("width", width)

        // Sets the width of the legend to be as wide as the container
        // Source: https://medium.com/@belloquadriolawale/the-getboundingclientrect-method-5cd13e206bcf
        const containerWidth = div.node().getBoundingClientRect().width
        legend.attr("viewBox", `0 0 ${containerWidth} ${legendHeight + legendPadding}`)

    }

    drawLegend()

}
