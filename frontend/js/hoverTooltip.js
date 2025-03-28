const createHoverTooltip = (svg) => {
    const toolTip = svg
        .append("g")
        .attr("class", "hoverToolTip")
        .style("visibility", "hidden")
        .style("opacity", 0)

    toolTip
        .append("rect")
        .attr("class", "hoverTooltipBox")
        .attr("width", hover_tooltip_width)
        .attr("height", hover_tooltip_height)
        .attr("rx", 5)
        .attr("ry", 5)
        //.style("fill", "periwinkle")


    toolTip
        .append("text")
        .attr("class", "hoverTooltipText")
        .attr("y", hover_tooltip_padding)
        .attr("x", hover_tooltip_padding)
};

function showTooltipOnHover(e, fileName, svg) {
    const toolTip = d3.select(".hoverToolTip")
    const [x, y] = d3.pointer(e, svg.node())

    d3.select(".hoverTooltipBox")
        .attr("width", hover_tooltip_width)
        .attr("height", hover_tooltip_height)

    const element = d3.select(".hoverTooltipText")

    const lineNumber = wrapText(element, fileName, hover_tooltip_max_width, hover_line_height)
    adjustHoverTooltipHeight(lineNumber)

    toolTip
        .attr("transform", `translate(${calculateTooltipX(x, hover_tooltip_width)}, ${calculateTooltipY(y, hover_tooltip_height)})`)
        .style("visibility", "visible")
        .raise()
        .transition()
        .duration(200)
        .style("opacity", 1);
}

d3.select(document).on("click", (e) => {
    d3.select(".hoverToolTip").style("visibility", "hidden").style("opacity", 0);
});

function adjustHoverTooltipHeight(lineNumber) {
    // Update the tooltip background size
    d3.select(".hoverTooltipBox")
        .attr("height", hover_tooltip_height + (lineNumber * (hover_line_height + hover_tooltip_padding)))
        .attr("width", hover_tooltip_width)
}


