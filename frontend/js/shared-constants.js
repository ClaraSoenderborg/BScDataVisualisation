var width
var height 
var viewBoxHeight = 150
var margin 
//var graphRadius = Math.min(width, height) / 26
var donutHole = 0.0
//var innerWidth = width - margin.left - margin.right
//var innerHeight = height - margin.top - margin.bottom
var graph_height 

var line_height 
var label_height 

var tooltip_padding 
var tooltip_width
var tooltip_height 
var tooltip_max_width 
var toolTip_radius 

const reCalculateSizes = () => {

    height = window.innerHeight * 0.8
    width = window.innerWidth * 0.9
    margin = { top: 10, right: 0, bottom: 20, left: window.innerWidth * 0.07}
    graph_height = height - margin.top - margin.bottom

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
