var width
var height
var margin
var graph_radius
var donutHole = 0.0
var graph_height

var line_height
var label_height


const min_width = 700

//Graph
const max_graph_height = 500
const min_graph_height = 300

let globalMin = Infinity
let globalMinFile = ""
let globalMaxFile = ""
let globalMax= -Infinity

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

    margin = { top: window.innerWidth*0.005, right: 0, bottom: window.innerWidth*0.01, left: window.innerWidth * 0.07 }
    graph_height = Math.max(min_graph_height, Math.min(max_graph_height, height)) - margin.top - margin.bottom
    graph_radius = Math.min(width, graph_height) / 26


    //Legend
    legendPadding = window.innerWidth * 0.045

    //ToolTip
    line_height = Math.min(window.innerHeight, window.innerWidth) * 0.03
    label_height = Math.min(window.innerHeight, window.innerWidth) * 0.02
    tooltip_width = width * 0.5
    tooltip_height = tooltip_width * 0.6
    tooltip_padding = tooltip_width * 0.02
    tooltip_max_width = tooltip_width - tooltip_padding * 2
    toolTip_radius = tooltip_height * 0.25

}

window.addEventListener("resize", reCalculateSizes)
