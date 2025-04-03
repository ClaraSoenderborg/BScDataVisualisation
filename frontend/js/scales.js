// Chapter 3, Helge book.
const yScale = d3.scaleLog()
const xScale = d3.scaleBand()
const rScale = d3.scaleLog()

const backgroundColor1 = "#FFFFFF"; // White
const backgroundColor2 = "#D3D3D3"; // Gray


const defineScales = (data, globalyMax, globalyMin, globalNodeMax, globalNodeMin) => {

    const minWeek = d3.min(data.map(d => d.week))
    const maxWeek = d3.max(data.map(d => d.week))

    xScale
        .domain(d3.range(minWeek, maxWeek +1)) // key is week
        .range([0, width]) //Changes

    yScale
        .domain([Math.max(1,globalyMin) / 1.5, globalyMax*1.5]) 
        .range([graph_height, 0])
        .base(2) 

    rScale
        .domain([globalNodeMin, globalNodeMax])
        .range([graph_radius * 0.50, graph_radius]) 
}



