const createHoverTooltip = (svg) => {
    const toolTip = svg
        .append("g")
        .attr("class", "hoverToolTip")
        .style("visibility", "hidden")
        .style("opacity", 0)

    toolTip
        .append("rect")
        .attr("class", "hoverTooltipBox")
        //.attr("width", hover_tooltip_width)
        //.attr("height", hover_tooltip_height)
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

    const element = d3.select(".hoverTooltipText")

    const lineNumber = wrapText(element, fileName, hover_tooltip_max_width, hover_line_height)
    
    d3.select(".hoverTooltipBox")
        .attr("width", hover_tooltip_width)
        .attr("height", hover_tooltip_height)

    adjustHoverTooltipSize(lineNumber, d3.select(".hoverTooltipText"))

    const actualWidth = parseFloat(d3.select(".hoverTooltipBox").attr("width"))
    const actualHeight = parseFloat(d3.select(".hoverTooltipBox").attr("height"))

    toolTip
        .attr("transform", `translate(${calculateTooltipX(x, actualWidth)}, ${calculateTooltipY(y, actualHeight)})`)
        .style("visibility", "visible")
        .raise()
        .transition()
        .duration(200)
        .style("opacity", 1);
}

d3.select(document).on("click", (e) => {
    d3.select(".hoverToolTip").style("visibility", "hidden").style("opacity", 0);
});

function adjustHoverTooltipSize(lineNumber, textElement) {
    
    var maxTspan = 0
    textElement.selectAll("tspan")
        .each(function () {
            const length = this.getComputedTextLength()
            if ( length > maxTspan){
                maxTspan = length
            }
        })

    d3.select(".hoverTooltipBox")
        .attr("height", hover_tooltip_height + (lineNumber * (hover_line_height)))
        .attr("width", maxTspan + hover_tooltip_padding * 2)
}


