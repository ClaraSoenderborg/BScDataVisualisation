const width = window.innerWidth * 0.9
const height = window.innerHeight * 0.8
const viewBoxHeight = 150
const margin = { top: 10, right: 0, bottom: 20, left: 100 }
const graphRadius = Math.min(width, height) / 26
const donutHole = 0.0
const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom

const line_height = 20
const tooltip_padding = 15
const tooltip_width = innerWidth * 0.5
const tooltip_height = innerHeight * 0.7
const tooltip_max_width = tooltip_width - tooltip_padding * 2
const toolTip_radius = tooltip_height * 0.3