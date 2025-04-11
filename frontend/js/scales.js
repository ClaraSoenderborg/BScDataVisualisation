// Chapter 3, Helge book.
const yScale = d3.scaleLog()
const xScale = d3.scaleBand()
const rScale = d3.scaleLog()

//onst colorScale = d3.scaleOrdinal(d3.schemeSet2)

const colorScale = d3.scaleOrdinal([
    "#FFA69E", // Melon :)
    "#D98B19", // Mustard :)
    "#8DA0CB", // Blue :)
    "#006D77", // Current :)
    "#FDE12D", // School bus yellow :)
    "#628B35", // Avocado :)
    "#E96A38", // Coral
    "#7EBDC3", // Blue :)
    "#BA274A", // Rose Red :)
    "#853570", // Violet Dark :)
    "#46351D", // Shit brown :)
    "#3DA5D9", // Blue :)

]);
const backgroundColor1 = "#FFFFFF"; // White
const backgroundColor2 = "#D3D3D3"; // Gray


const defineScales = (data, globalyMax, globalyMin, globalNodeMax, globalNodeMin, authors, maxNumberOfFiles) => {

    
    const sortByWeeks = d3.sort(data, (a,b) => a.week - b.week)
    const sortByYear = d3.sort(sortByWeeks, (a,b) => a.year - b.year)
    console.log(sortByYear[sortByYear.length - 1].week)
    
    const minWeek = sortByYear[0].week
    const maxWeek = sortByYear[sortByYear.length - 1].week

    xScale
        .domain(
            d3.range(minWeek, maxWeek +1)) // key is week
        .range([0, width]) //Changes

    yScale
        .domain([Math.max(1,globalyMin) / 1.5, globalyMax*1.5]) //
        .range([graph_height, margin.top])
        .base(globalyMax > 100 ? 10 : 2)

    
    const radiusMax = maxNumberOfFiles > 10 ? d3.min([xScale.bandwidth()/4, graph_radius]) : graph_radius
   
    rScale
        .domain([globalNodeMin, globalNodeMax])
        .range([radiusMax * 0.50, radiusMax]) 

    colorScale
        .domain(authors)

}



