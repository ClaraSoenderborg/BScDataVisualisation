const yScale = d3.scaleBand()
const xScale = d3.scaleBand()
const colorScale = d3.scaleOrdinal(d3.schemeSet2)

const defineScales = (data) => {
    const sortedweeks = Array.from(d3.union((data.map(d => d.week)).sort()))
    
    xScale
        .domain(sortedweeks) // key is week
        .range([0, innerWidth])
    
    yScale
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        .range([innerHeight, 0]) // start y-axis at zero
        .paddingInner(0.2)
        .paddingOuter(0.2)


    // Colors
    const authors = Array.from(d3.union(data.map(d => d.author)))
    
    colorScale
        .domain(authors)
}

