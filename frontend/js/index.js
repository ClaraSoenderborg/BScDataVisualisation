const width = 300
const height = 100
const margin = { top: 10, right: 0, bottom: 10, left: 10 }
const radius = Math.min(width, height) / 40
const donutHole = radius * 0.4
const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom
var color

const yScale = d3.scaleBand()
const xScale = d3.scaleBand()

const defineScales = (data) => {
    const sortedweeks = Array.from(data.keys()).sort()
    xScale
        .domain(sortedweeks) // key is week
        .range([0, innerWidth])
    yScale
        .domain([0,1,2,3,4,5,6,7,8,9])
        .range([0,innerHeight])
        .paddingInner(0.2)
}


d3.csv("../../data/data.csv", d3.autoType).then(data => {
    createVis(data)
});


const svg = d3.select("#vis")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)

const outerDonutGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)


const createVis = (data) => {

    authorColor(data)
    createLegend(data)

    const primaryGroup = d3.rollup(data,
        (D) => d3.sum(D, d => d.linesChanged),
        (w) => w.week,
        (d) => d.fileName,
        (d) => d.author)

    defineScales(primaryGroup)

    const bottomAxis = d3.axisBottom(xScale)
        //.tickValues(d3.range([0,10]))
        .tickSize(0,1)
    

    outerDonutGroup.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(bottomAxis) // connect x-akse to outerDonut
        .selectAll("text") // Select all text elements within the axis
        .style("font-size", "4px"); // Sets the size of the text



    console.log(primaryGroup)

    const week = primaryGroup.get(42)

    const donutContainer = outerDonutGroup.append("g")


    // sum changes for all files in week
    const fileArray = Array.from(week, ([fileName, authorMap]) => {
        const totalLinesChanged = d3.sum(authorMap.values())
        return { fileName, totalLinesChanged };
    })

    // find top ten changed files in week
    fileArray.sort((a, b) => b.totalLinesChanged - a.totalLinesChanged)
    const topTenFiles = fileArray.slice(0, 10)

    for (let i = 0; i < topTenFiles.length; i++) { // for loop for each file in a week
        const fileName = topTenFiles[i].fileName
        const authorMap = week.get(fileName)

        const singleDonut = outerDonutGroup.append("g")
            .attr("transform", `translate(${xScale(36)+xScale.bandwidth()/2},${yScale(i)})`)


        var pie = d3.pie().sort(null).value(([key, value]) => value);

        const preparedPie = pie(authorMap)

        var arcGen = d3.arc()
            .innerRadius(donutHole)
            .outerRadius(radius)

        var arcs = singleDonut.selectAll()
            .data(preparedPie)
            .join("g")
            //.attr("class", `arc-${fileName}`)

        arcs.append("path")
            .attr("d", arcGen)
            .attr("fill", d => color(d.data[0]))

    }



}


/*
const buildDonut = (fileName, authorMap) => {
    const singleDonut = donutContainers.append("g")
    //todo: transform with yscale

    console.log("buildDonut")

    console.log(fileName)
    console.log(authorMap)


    var pie = d3.pie().sort(null).value(([key, value]) => value);

    const preparedPie = pie(authorMap)

    var arcGen = d3.arc()
        .innerRadius(donutHole)
        .outerRadius(radius)

    var arcs = singleDonut.selectAll(`.arc-${fileName}`)
        .data(preparedPie)
        .join("g")
        .attr("class", `arc-${fileName}`)

    arcs.append("path")
        .attr("d", arcGen)
        .attr("fill", d => color(d.data[0]))

}*/


const authorColor = (data) => {
    const authors = Array.from(d3.union(data.map(d => d.author)))
    color = d3.scaleOrdinal(d3.schemeCategory10).domain(authors)
}


// Create the legend
const createLegend = (data) => {
    const authors = Array.from(d3.union(data.map(d => d.author)))

    const legendWidth = Math.max(...(authors.map(a => a.length))) * 8
    const legendHeight = authors.length * 25;

    var legendSvg = d3.select("#vis")
        .append("svg")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("border", "1px solid black")
        .attr("transform", "translate(0, 0)")

    // Add rectangles for each author with a corresponding color
    legendSvg.selectAll("circel")
        .data(authors)
        .join("circle")
        .attr("cx", 10)
        .attr("cy", (d, i) => 20 + i * 20)
        .attr("r", 7)
        .attr("fill", (d) => color(d))

    // Add text for each author
    legendSvg.selectAll("text")
        .data(authors)
        .join("text")
        .attr("x", 25)
        .attr("y", function (d, i) { return 20 + i * 20 })
        .text(d => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("fill", function (d) { return color(d) })

};

