// Chapter 3, Helge book. 
const yScale = d3.scaleLog()
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

    const primaryGroup = d3.rollup(data,
        (D) => [d3.sum(D, d => d.linesChanged), d3.sum(D, d => d.linesAdded), d3.sum(D, d => d.linesDeleted)],
        (w) => w.week,
        (d) => d.fileName,
        (d) => d.author)
    

    const sortedweeks = Array.from(d3.union((data.map(d => d.week)).sort()))
    //const sortedLinesChanged = totalChangedLinesInFiles.map(d => d.totalLinesChanged).sort((a, b) => a - b); 

    
    primaryGroup.forEach((fileMap, week) => {

        // sum changes for all files in week
        const fileArray = Array.from(fileMap, ([fileName, authorMap]) => {
            const totalLinesChanged = d3.sum(authorMap.values().map(x => x[0]))
            return { fileName, totalLinesChanged };
        })

        // find top ten changed files in week
        fileArray.sort((a, b) => b.totalLinesChanged - a.totalLinesChanged)
        const topTenFiles = fileArray.slice(0, 10).reverse() // reverse to have most changed files on top

        const min = d3.min(topTenFiles, d => d.totalLinesChanged)
        const max = d3.max(topTenFiles, d => d.totalLinesChanged)

        const minFileName = topTenFiles.find(d => d.totalLinesChanged === min)?.fileName || "Unknown";
        const maxFileName = topTenFiles.find(d => d.totalLinesChanged === max)?.fileName || "Unknown";

        if (min < globalMin) {
            globalMin = min;
            globalMinFile = minFileName;
            }
            if (max > globalMax) {
            globalMax = max;
            globalMaxFile = maxFileName;
            }
        })

    
    xScale
        .domain(sortedweeks) // key is week
        .range([0, width]) //Changes
    
    yScale 
        .domain([Math.max(1,globalMin), globalMax])
        .range([graph_height, 0]).base(2) // start y-axis at zero
    // Colors
    const authors = Array.from(d3.union(data.map(d => d.author)))
    
    colorScale
        .domain(authors)
}


