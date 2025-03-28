var width
var height
var margin
var graph_radius
var donutHole = 0.0
var graph_height
var graph_bandwidth_padding 

var click_line_height
var hover_line_height
var label_height


const min_width = 700

//Graph
const max_graph_height = 500
const min_graph_height = 300

let globalyMin = Infinity
let globalyMax= -Infinity

let globalNodeMin = Infinity
let globalNodeMax= -Infinity

//Legend
var legendPadding

//Tooltip
var tooltip_padding
var tooltip_width
var tooltip_height
var tooltip_max_width
var toolTip_radius

const reCalculateSizes = () => {

    //Graph
    height = window.innerHeight * 0.8
    width = Math.max(min_width, window.innerWidth * 0.9)

    margin = { top: window.innerWidth*0.005, right: 0, bottom: window.innerWidth*0.035, left: window.innerWidth * 0.07 }
    graph_height = Math.max(min_graph_height, Math.min(max_graph_height, height)) //- margin.top - margin.bottom
    graph_radius = Math.min(width, graph_height) / 20
    graph_bandwidth_padding = graph_radius * 0.15


    //Legend
    legendPadding = window.innerWidth * 0.045

    //ToolTip
    click_line_height = Math.min(window.innerHeight, window.innerWidth) * 0.03
    label_height = Math.min(window.innerHeight, window.innerWidth) * 0.03
    tooltip_width = width * 0.5
    tooltip_height = tooltip_width * 0.6
    tooltip_padding = tooltip_width * 0.02
    tooltip_max_width = tooltip_width - tooltip_padding * 2
    toolTip_radius = tooltip_height * 0.25

}

function calculateTooltipX(x, tooltipWidth) {
    if (x > (width / 2 + margin.left)) { // clicked object is on right side
        return x - tooltipWidth - graph_radius
    } else {
        return x + graph_radius // clicked object is on left side
    }

}

function calculateTooltipY(y, tooltipHeight) {
    const overflow = tooltipHeight + y - graph_height + graph_radius
    if (overflow > 0) {
        return y - overflow - tooltip_padding
    }
    return y + tooltip_padding
}

window.addEventListener("resize", reCalculateSizes)


// Wrap text to next line in toolTip
function wrapText(textElement, text, maxWidth, lineHeight) {
    textElement.text("") // Set the full text initially

    var segments = text.split("/"); // Split at "/"
    var currentLine = ""
    var lineNumber = 0
    var start_x = parseFloat(textElement.attr("x"))
    var start_y = parseFloat(textElement.attr("y"))

    segments.forEach((segment) => {
        var newLine = currentLine ? currentLine + "/" + segment : segment; // Keep adding segments

        // Create a temporary invisible text element to measure width
        var tempText = textElement.append("tspan").text(newLine)
        var textWidth = tempText.node().getComputedTextLength()
        tempText.remove() // Remove temp element after measuring

        if (textWidth > maxWidth) {
            // If the current line exceeds max width, finalize the previous line and start a new one
            if (currentLine) {
                textElement.append("tspan")
                    .attr("x", start_x) // Center text
                    .attr("y", start_y + lineHeight * lineNumber)
                    .attr("text-anchor", "start")
                    .style("dominant-baseline", "hanging")
                    .text(currentLine);
                lineNumber++;
            }
            currentLine = "/" + segment; // Start a new line with the current segment
        } else {
            currentLine = newLine; // Continue adding to the same line
        }
    })

    // Append the last remaining line
    textElement.append("tspan")
        .attr("x", start_x) // Center text
        .attr("y", start_y + lineHeight * lineNumber)
        .attr("text-anchor", "start")
        .style("dominant-baseline", "hanging")
        .text(currentLine)

    return lineNumber

}
