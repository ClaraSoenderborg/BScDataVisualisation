/**
 * Creates and shows the tooltip on click. 
 * When the user clicks on a piechart the tooltip becomes visible with information on filename, nodeSize value 
 * and each author's contribution shown with labels and a piece of the piechart.
 * 
 */

var setMetadata
var lastAddedEndPoint = [-999, 999]

/**
 * Creates initial tooltip when clicking on a piechart and handles logic for closing the tooltip
 * 
 * Source: https://github.com/d3js-in-action-third-edition/code-files/tree/main/chapter_07/7.3.1-Simple_tooltip
 * Source: E. Meeks, and A. Dafour, “D3.js in action”, Third edition, chapter 7.3.1, April 2025.
 */
const createClickTooltip = (svg, metadata) => {
  setMetadata = metadata  

  const toolTip = svg
    .append("g")
    .attr("class", "clickTooltip")

  // Tooltip background box  
  toolTip
    .append("rect")
    .attr("width", tooltip_width)
    .attr("height", tooltip_height)
    .attr("rx", 10)
    .attr("ry", 10)

  // Initial filename placeholder
  toolTip
    .append("text")
    .attr("class", "tooltipTitle")
    .attr("x", tooltip_padding)
    .attr("y", tooltip_padding)  

  // Append piechart in tooltip
  toolTip
    .append("g")
    .attr("class", "tooltip-pie")
    .attr(
      "transform",
      `translate(${tooltip_width / 2},${tooltip_height / 2 + tooltip_padding})`
    )  

  // Appends nodeSize total value
  toolTip
    .append("text")
    .attr("class", "tooltipTotal")
    .style("dominant-baseline", "hanging")  

  // Hide the tooltip when clicking anywhere on the page except on the piecharts
  d3.select(document).on("click", (e, d) => {
    d3.select(".clickTooltip").style("visibility", "hidden")  
    d3.selectAll(".singlePie").style("opacity", 1)  
  })  

  // Prevents tooltip closing when clicking anywhere in visible tooltip area
  d3.select(".clickTooltip").on("click", (e) => {
    e.stopPropagation()  
  })  
}  

/**
 * When closing the tooltip, remove all the tooltip content and reset the piechart's opacity
 */
function closeTooltip(e) {
  d3.selectAll(".singlePie").style("opacity", 1)  
  d3.select(".clickTooltip").style("visibility", "hidden")  
  d3.selectAll(".details text").remove()  
  d3.selectAll(".tooltip-pie path").remove()  
  d3.selectAll(".labelLines").remove()  
  d3.selectAll(".labelText").remove()  

  e.stopPropagation()  
}

/**
 * Dynamically adjusts tooltip size according to content 
 */
function adjustTooltipHeight(lineNumber) {
  d3.select(".clickTooltip rect")
    .attr("height", tooltip_height + lineNumber * line_height_two)
    .attr("width", tooltip_width)  

  d3.select(".tooltip-pie").attr(
    "transform",
    `translate(${tooltip_width / 2},${tooltip_height / 2 + line_height_two * lineNumber + tooltip_padding
    })`
  )  
}

/**
 * Takes a parameter object and displays the tooltip when clicking on a piechart
 */
function showTooltipOnClick({ e, data, svg }) {

  // Close previous tooltip and recalculate shared variables
  closeTooltip(e)  

  const [x, y] = d3.pointer(e, svg.node())  

  // Sets nodeSize value
  const totalText = d3
    .select(".tooltipTotal")
    .text(`Total ${setMetadata.nodeSize}: ${d3.format(",")(data.nodeSize)}`)
    .attr("x", tooltip_width - tooltip_padding)
    .attr("y", tooltip_padding)  

  const totalTextLength = totalText.node().getComputedTextLength()  

  const element = d3.select(".tooltipTitle")  

  // New line when text overflows 
  const retLineNumber = wrapText(
    element,
    data.fileName,
    tooltip_max_width - totalTextLength - tooltip_padding,
    line_height_three
  )  

  adjustTooltipHeight(retLineNumber)  

  // Positions tooltip close to the mouse and makes it visible
  d3.select(".clickTooltip")
    .attr("transform", `translate(${calculateTooltipX(x, tooltip_width)}, ${calculateTooltipY(y, tooltip_height)})`)
    .style("visibility", "visible")
    .raise()
    .transition()
    .duration(200)
    .style("opacity", 1)  

  // Builds piechart inside tooltip
  d3.select(".tooltip-pie").call(() =>
    buildTooltipChart(d3.select(".tooltip-pie"), data.authorMap)
  )
}

/**
 * Function to build piechart, polylines and labels in tooltip. 
 */
function buildTooltipChart(singlePie, authorMap) {
  lastAddedEndPoint = [-999, 999]

  var pie = d3
    .pie()
    .sort(null)
    .value(([key, value]) => value.get("nodeSize"))  
  const preparedPie = pie(authorMap)  

  // Piechart size to fit in tooltip
  var arcGen = d3.arc()
  .innerRadius(0)
  .outerRadius(toolTip_radius)  

  // Creates a pie slice for each author 
  var arcs = singlePie
    .selectAll(".arc")
    .data(preparedPie)
    .join("g")
    .attr("class", "arc")

  // Fills each pie slice with author's corresponding color
  arcs
    .append("path")
    .attr("d", arcGen)
    .attr("fill", (d) => colorScale(d.data[0]))  


  // Add polylines from slices to labels
  arcs
    .append("polyline")
    .attr("class", "labelLines")
    .attr("points", function (d) {
      d.calcPoints = calculateLinePoints(d, arcGen)
      return d.calcPoints.map((p) => p.join(",")).join(" ")  
    })

  // Add labels at endpoint of polyline
  arcs
    .append("text")
    .attr("class", "labelText")
    .attr("transform", (d) => {
      const points = d.calcPoints  
      const posEnd = points[2]  

      posEnd[0] += posEnd[0] > 0 ? 2 : -2   // padding between line and label

      return `translate(${posEnd})`  
    })
    .attr("text-anchor", function (d) {
      const points = d.calcPoints  
      const posEnd = points[2]  

      return posEnd[0] > 0 ? "start" : "end"  
    })
    .style("dominant-baseline", "middle")
    .attr("fill", (d) => colorScale(d.data[0]))
    .each(function (d) {
      const formattedNodeSize = d3.format(",")(d.data[1].get("nodeSize"))
      const textElement = d3.select(this)
      textElement.text(`${setMetadata.nodeSize}: ${formattedNodeSize}`)
    })  
}

/**
 * Calculate polylines from each slice. Adjusts if overlap occurs.
 * Source: https://gist.github.com/dbuezas/9306799
 * 
 * Optimized with CodeScene
 */
function calculateLinePoints(d, arcGen) {
  
  var posStart = getPosStart(d, arcGen)
  var posMid = getPosMid(posStart)
  var posEnd = getPosEnd(posMid)

  adjustPosEndIfSameSide(posEnd, posMid)

  lastAddedEndPoint = posEnd  
  return [posStart, posMid, posEnd]  
}

function getPosStart(d, arcGen) {
  return arcGen.centroid(d)  
}

function getPosMid(posStart) {
  return [posStart[0] * 2.5, posStart[1] * 2.5]  
}

function getPosEnd(posMid) {
  return [posMid[0] + (posMid[0] > 0 ? 25 : -25), posMid[1]]  
}

/**
 * Checks if the polylines are on same side and if true enacts function to handle this
 */
function adjustPosEndIfSameSide(posEnd, posMid) {
  var isOnSameSide = Math.sign(lastAddedEndPoint[0]) === Math.sign(posEnd[0])

  if (isOnSameSide) {
    var isRightSide = Math.sign(lastAddedEndPoint[0]) > 0

    if (isRightSide) {
      adjustPosEndForRightSide(posEnd, posMid)
    } else { // left side
      adjustPosEndForLeftSide(posEnd, posMid)
    }
  }

}

/**
 * On right side of the piechart. 
 * If y-value of lastAddedEndPoint is greater than current end point the function recalculates position of y-value 
 * to correct position so no overlap occurs and correct order. 
 */
function adjustPosEndForRightSide(posEnd, posMid) {
  if (posEnd[1] < lastAddedEndPoint[1]) {
    posEnd[1] = lastAddedEndPoint[1] + line_height_two  
    posMid[1] = lastAddedEndPoint[1] + line_height_two  
  } else { // Add space to avoid overlap 
    posEnd[1] = posEnd[1] + line_height_two  
    posMid[1] = posMid[1] + line_height_two  
  }
}

/**
 * On right side of the piechart. 
 * If y-value of lastAddedEndPoint is smaller than current end point the function recalculates position of y-value 
 * to correct position so no overlap occurs and correct order. 
 */
function adjustPosEndForLeftSide(posEnd, posMid) {
  if (posEnd[1] > lastAddedEndPoint[1]) {
    posEnd[1] = lastAddedEndPoint[1] - line_height_two  
    posMid[1] = lastAddedEndPoint[1] - line_height_two  
  } else { // Add space to avoid overlap
    posEnd[1] = posEnd[1] - line_height_two  
    posMid[1] = posMid[1] - line_height_two  
  }
}
