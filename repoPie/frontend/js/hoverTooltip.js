/**
 * Creates and shows the tooltip on hover. 
 * When the user mouses over a pie chart this tooltip will be visible and disappear when mousing out. 
 * 
 * In the tooltip information about filename, y-axis value, nodeSize value and each author's contribution to 
 * said file based on nodeSize metric is shown.
 * 
 * Source: https://d3-graph-gallery.com/graph/interactivity_tooltip.html
 * Source: E. Meeks, and A. Dafour, “D3.js in action”, Third edition, chapter 15.4, May 2025.
 */

const createHoverTooltip = (svg) => {
  const toolTip = svg
    .append("g")
    .attr("class", "hoverTooltip")

  toolTip
    .append("rect")
    .attr("class", "hoverTooltipBox")
    .attr("rx", 5) 
    .attr("ry", 5)

  toolTip
    .append("text")
    .attr("class", "hoverTooltipText")
    .attr("y", hover_tooltip_padding)
    .attr("x", hover_tooltip_padding)
    .style("dominant-baseline", "hanging")  
} 

/**
 * This function takes a paramater object and displays the tooltip with the data that corresponds to the hovered
 * pie. 
 */
function showTooltipOnHover({e, data, svg}) {
  const toolTip = d3.select(".hoverTooltip") 
  const [x, y] = d3.pointer(e, svg.node()) 

  const element = d3.select(".hoverTooltipText") 

  // New line when text overflows 
  var lineNumber = wrapText(
    element,
    data.fileName,
    hover_tooltip_max_width,
    line_height_two
  )

  lineNumber = addLine(`Total ${data.yAxisMetric}: ${data.yAxis}`, lineNumber, "black")
  lineNumber = addLine(`Total ${data.nodeSizeMetric}: ${data.nodeSize}`, lineNumber, "black")

  // Adds lines for each author with colored value
  var authors = [...data.authorMap.keys()]
  console.log(authors)

  authors.forEach(author => {
    lineNumber = addLine(`${author}: ${data.authorMap.get(author).get("nodeSize")}`,lineNumber, colorScale(author))
  })

  adjustHoverTooltipSize(lineNumber, element)

  const actualWidth = parseFloat(d3.select(".hoverTooltipBox").attr("width"))
  const actualHeight = parseFloat(d3.select(".hoverTooltipBox").attr("height"))

  // Positions tooltip close to the mouse and makes it visible
  toolTip
    .attr(
      "transform",
      `translate(${calculateTooltipX(x, actualWidth)}, ${calculateTooltipY(
        y,
        actualHeight
      )})`
    )
    .style("visibility", "visible")
    .raise()
    .transition()
    .duration(200)
    .style("opacity", 1) 
}

// When clicking on a pie chart the hover tooltip disappears
d3.select(document).on("click", (e) => {
  d3.select(".hoverTooltip").style("visibility", "hidden").style("opacity", 0) 
}) 


/**
 * Dynamically adjusts tooltip size according to content 
 */
function adjustHoverTooltipSize(lineNumber, textElement) {
  var maxTspan = 0 

  // Finds the widest line to set width
  textElement.selectAll("tspan").each(function () {
    const length = this.getComputedTextLength() 
    if (length > maxTspan) {
      maxTspan = length 
    }
  }) 

  d3.select(".hoverTooltipBox")
    .attr("height", hover_tooltip_height + lineNumber * line_height_two)
    .attr("width", maxTspan + hover_tooltip_padding * 2) 
}


/**
 * Function to add lines for total y-axis metric, total nodeSize metric and each author's contributions 
 * Returns lineNumber to set height accordingly 
 */
function addLine(text, lineNumber, color){
  const element = d3.select(".hoverTooltipText") 

  lineNumber++
  const startY = parseFloat(element.attr("y"))
  const startX = parseFloat(element.attr("x"))

  element.append("tspan")
    .attr("x", startX)
    .attr("y", startY + line_height_two * lineNumber) 
    .attr("class", "hoverTooltipYAxis")
    .style("dominant-baseline", "hanging")
    .attr("fill", color)
    .attr("class", "hoverTooltipYAxis")
    .text(text)
  return lineNumber
}
