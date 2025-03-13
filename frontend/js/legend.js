const createLegend = (data, div) => {
    const authors = Array.from(new Set(data.map(d => d.author))); // Use Set for unique values
    const rowHeight = 30; // Space for each row

    // Create the SVG legend container
    const legend = div.append("svg")
        .attr("class", "legendSVG");

    // Background rectangle for legend

    // Function to draw the legend
    const drawLegend = () => {
        let usedRows = 1;
        let xPosition = margin.left;
        let yPosition = margin.top + 5;

        // Remove existing legend items before redrawing
        legend.selectAll(".legend-item").remove();
        legend.selectAll(".legend-background").remove();

        // Bind data and create groups for each author
        const legendItems = legend.selectAll(".legend-item")
            .data(authors)
            .join("g")
            .attr("class", "legend-item")
            .each(function (d) {
                const textElem = d3.select(this).append("text")
                    .attr("class", "legend-text")
                    .attr("x", 15) // Space from circle
                    .attr("y", 5)
                    .text(d)
                    .style("fill", colorScale);

                const textWidth = textElem.node().getComputedTextLength(); // Measure text width

                // Check if the next item would exceed max width
                if (xPosition + textWidth + 20 > width) {
                    xPosition = margin.left; // Move to new row
                    yPosition += rowHeight;
                    usedRows++;
                }

                d3.select(this).attr("transform", `translate(${xPosition}, ${yPosition})`);
                xPosition += textWidth + 35; // Update X position for next item
            });

        const background = legend.append("rect")
            .attr("class", "legend-background")
            .attr("x", margin.left)
             //.attr("width", width)
              //.attr("height", legendHeight)

        // Append circles for legend markers
        legendItems.append("circle")
            .attr("class", "legend-circle")
            .attr("fill", colorScale);

        // Update legend background height
        const legendHeight = usedRows * rowHeight;
        background
            .attr("height", legendHeight + 5)
            .attr("width", width)

        //Sets the width of the legend to be as wide as the container(from chat)
        const containerWidth = div.node().getBoundingClientRect().width;

        // Update viewBox dynamically based on window size
        legend.attr("viewBox", `0 0 ${containerWidth} ${legendHeight + margin.bottom}`);

    };

    // Initial draw
    drawLegend();

    // Redraw legend when window resizes
    window.addEventListener("resize", drawLegend);
};
