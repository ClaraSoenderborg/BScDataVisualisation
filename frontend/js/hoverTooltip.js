const createHoverTooltip = (svg) => {
    const toolTip = svg
        .append("g")
        .attr("class", "hoverToolTip")
        .style("visibility", "hidden")
        .style("opacity", 0)

    toolTip
        .append("rect")
        .attr("width", 300) 
        .attr("height", 30) 
        .attr("rx", 5) 
        .attr("ry", 5)
        .style("fill", "white")


    toolTip
        .append("text")
        .attr("class", "hoverTooltipText")
        .attr("y", tooltip_padding) 
        .attr("x", tooltip_padding) 
        .style("font-size", "14px") 
        .style("fill", "black") 
};

function showTooltipOnHover(e, d, fileName, svg) {
    const toolTip = d3.select(".hoverToolTip")
    const [x, y] = d3.pointer(e, svg.node())

    toolTip.select(".hoverTooltipText").text(fileName);

    toolTip
        .attr("transform", `translate(${calculateTooltipX(x, 300)}, ${calculateTooltipY(y, 30)})`)
        .style("visibility", "visible")  
        .raise()
        .transition()
        .duration(200)
        .style("opacity", 1); 
}

d3.select(document).on("click", (e) => {
    d3.select(".hoverToolTip").style("visibility", "hidden").style("opacity", 0);
});


