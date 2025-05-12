/**
 * Collection of all constants that are shared in entire project. 
 * Inspired by https://github.com/d3js-in-action-third-edition/code-files/blob/main/chapter_05/5.1-Pie_layout/end/js/shared-constants.js
 */

var width
var height
var margin
var graph_radius
var graph_height
var graph_bandwidth_padding 
var line_height_two
var line_height_three
var line_height_four


const min_width = 700

//Graph
const max_graph_height = 550
const min_graph_height = 300

//Legend
var legendPadding

//ClickTooltip
var tooltip_padding
var tooltip_width
var tooltip_height
var tooltip_max_width
var toolTip_radius

//HoverTooltip
var hover_tooltip_width
var hover_tooltip_height
var hover_tooltip_max_width
var hover_tooltip_padding

/**
 * Dynamically recaluclates sizes for graph, legend and tooltips based on size of browser window.
 * Ensures responsiveness for different screensizes or when resizing window.
 */
const reCalculateSizes = () => {
    //Graph
    height = window.innerHeight * 0.8
    width = Math.max(min_width, window.innerWidth * 0.9)

    margin = { top: width*0.005, right: 0, bottom: width*0.035, left: width * 0.07 }
    graph_height = Math.max(min_graph_height, Math.min(max_graph_height, height)) 
    graph_radius = Math.min(width, graph_height) / 22
    graph_bandwidth_padding = graph_radius * 0.15
 
    line_height_four = Math.min(window.innerHeight, window.innerWidth) * 0.04

    //Legend
    legendPadding = window.innerWidth * 0.045

    //ToolTip
    line_height_three = Math.min(window.innerHeight, window.innerWidth) * 0.03
    tooltip_width = width * 0.5
    tooltip_height = tooltip_width * 0.6
    tooltip_padding = tooltip_width * 0.02
    tooltip_max_width = tooltip_width - tooltip_padding * 2
    toolTip_radius = tooltip_height * 0.25

    //hover tooltip
    hover_tooltip_width = width * 0.25
    hover_tooltip_padding = hover_tooltip_width * 0.02
    hover_tooltip_max_width = hover_tooltip_width - hover_tooltip_padding * 2
    line_height_two = Math.min(window.innerHeight, window.innerWidth) * 0.02
    hover_tooltip_height = line_height_two + hover_tooltip_padding 
    
}

/**
 * Calculates tooltip position to make sure it stays inside the x-axis. If placing the tooltip
 * at x plus tooltipWidth would overflow out of the graph to the right, then show on the left.
 */
function calculateTooltipX(x, tooltipWidth) {
    if ((tooltipWidth + x) > width + margin.left){
        return x - tooltipWidth - tooltip_padding
    } else {
        return x + tooltip_padding
    }
}

/**
 * Calculates tooltip position to make sure it stays inside the y-axis. If placing the tooltip
 * at y plus tooltipHeight would overflow out of the graph at the bottom, then move upwards.
 */
function calculateTooltipY(y, tooltipHeight) {
    const overflow = tooltipHeight + y - graph_height + graph_radius
    if (overflow > 0) {
        return y - overflow - tooltip_padding
    }
    return y + tooltip_padding
}

// Formatter returns a string like "2025-15" for a date, representing ISO year and ISO week number
const formatISOWeek = d3.utcFormat("%G-%V") 

/**
 * Manually wraps long text into multiple lines so it fits withing maxWidth.
 * Returns the number of lines used to adjust container height. 
 * 
 * Function created with help from ChatGPT 
 */
function wrapText(textElement, text, maxWidth, lineHeight) {
    textElement.text("") 
    
    // Spilt text into segments at '/' because we split repoPaths
    var segments = text.split("/") 

    var currentLine = ""
    var lineNumber = 0
    var start_x = parseFloat(textElement.attr("x"))
    var start_y = parseFloat(textElement.attr("y"))

    segments.forEach((segment) => {
        // Builds new line by adding next segment with /
        var newLine = currentLine ? currentLine + "/" + segment : segment

        // Measures how long a line would be with tspan and then removes it
        var tempText = textElement.append("tspan").text(newLine)
        var textWidth = tempText.node().getComputedTextLength()
        tempText.remove() 

        // Decides if newLine is too wide and needs to be wrapped
        if (textWidth > maxWidth) {
            // Only create new line if text has build up. To prevent appending blank lines
            if (currentLine) {
                textElement.append("tspan")
                    .attr("x", start_x)
                    .attr("y", start_y + lineHeight * lineNumber)
                    .attr("text-anchor", "start")
                    .style("dominant-baseline", "hanging")
                    .text(currentLine)
                lineNumber++
            }
            // Start new line with line that overflowed, but add '/' for continuity 
            currentLine = "/" + segment 
        } else { // Keep building currentLine if line did not exeed maxWidth
            currentLine = newLine 
        }
    })

    // Appends last line after loop
    textElement.append("tspan")
        .attr("x", start_x) 
        .attr("y", start_y + lineHeight * lineNumber)
        .attr("text-anchor", "start")
        .style("dominant-baseline", "hanging")
        .text(currentLine)

    return lineNumber

}
