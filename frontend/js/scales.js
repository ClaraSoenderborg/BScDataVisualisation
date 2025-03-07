const yScale = d3.scaleBand()
const xScale = d3.scaleBand()
//onst colorScale = d3.scaleOrdinal(d3.schemeSet2)

const colorScale = d3.scaleOrdinal([
    "#D98B19", // Mustard :)
    "#8DA0CB", // Blue :)
    "#006D77", // Current :)
    "#FDE12D", //School bus yellow :)
    "#628B35", // Avocado :)
    "#FFA69E", // Melon :)
    "#E96A38", // Coral 
    "#7EBDC3", // Blue :)
    "#BA274A", // Rose Red :)
    "#853570", // Violet Dark :)
    "#46351D", // Shit brown :)
    "#3DA5D9", // Blue :)

]);


const defineScales = (data) => {
    const sortedweeks = Array.from(d3.union((data.map(d => d.week)).sort()))
    
    xScale
        .domain(sortedweeks) // key is week
        .range([0, window.innerWidth * 0.9]) //Changes
    
    yScale
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        .range([window.innerHeight * 0.8 - margin.top - margin.bottom, 0]) // start y-axis at zero
        .paddingInner(0.2)
        .paddingOuter(0.2)


    // Colors
    const authors = Array.from(d3.union(data.map(d => d.author)))
    
    colorScale
        .domain(authors)
}

