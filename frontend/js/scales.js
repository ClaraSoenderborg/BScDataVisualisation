// Chapter 3, Helge book.
const yScale = d3.scaleLog()
const xScale = d3.scaleBand()

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


const defineScales = (data, globalMax, globalMin) => {

    const sortedweeks = Array.from(d3.union((data.map(d => d.week)).sort()))

    xScale
        .domain(sortedweeks) // key is week
        .range([0, width]) //Changes

    yScale
        .domain([Math.max(1,globalMin) / 1.5, globalMax*1.5]) //
        .range([graph_height, 0])
        .base(2) // start y-axis at zero

    const authors = Array.from(d3.union(data.map(d => d.author)))

    colorScale
        .domain(authors)

}



