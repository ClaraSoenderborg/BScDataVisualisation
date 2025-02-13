
const width = 100
const height = 100
const margin = { top: 50, right: 0, bottom: 50, left: 70 }
const radius = Math.min(width, height) / 2 - margin.right
const donutHole = 20
const innerWidth = width - margin.left - margin.right
const innerHeight = height - margin.top - margin.bottom
var color


/* var dummyData = d3.csvParse(`author,lines
    clara,5
    julia,10
    astrid,8
    sarah,3`, d3.autoType)*/

/*var arc = d3.arc()
    .innerRadius(donutHole)
    .outerRadius(radius)*/




d3.csv("../../data/data.csv", d => {
    return {
        commitSHA: d.commitSHA,
        date: d.date,
        week: d.week,
        author: d.author,
        linesAdded: +d.linesAdded,
        linesDeleted: +d.linesDeleted,
        linesChanged: +d.linesChanged,
        fileName: d.fileName
    };
}).then(data => {

    createVis(data);
});


const svg = d3.select("#vis")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)

const donutContainers = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)

const createVis = (data) => {
    
    authorColor(data)
    createLegend(data)
    
    const primaryGroup = d3.rollup(data,
        (D) => d3.sum(D, d => d.linesChanged),
        (w) => w.week,
        (d) => d.fileName,
        (d) => d.author)

    console.log(primaryGroup)

    const something = primaryGroup.get("42").get("LICENSE")
    console.log(something)



    buildDonut("LICENSE", something)

    /*primaryGroup.forEach((authorMap, fileName) => {
        /*const fileArray = Array.from(fileMap, ([fileName, authorMap]) => {
            const totalLinesChanged = d3.sum(authorMap.values())
            return { week, fileName, totalLinesChanged };
        })
        //console.log(fileMap)
        fileArray.sort((a, b) => b.totalLinesChanged - a.totalLinesChanged)
        const sortedFiles = fileArray.slice(0, 10)
        //console.log(sortedFiles)

        sortedFiles.forEach((item) => {
            const authorMap = fileMap.get(item.fileName)
            //console.log(authorMap)
            //const authorArray = Array.from(authorMap, ([key, value]) => ({key, value}))
            buildDonut(item.fileName, authormap)
            
            
        })

        
        if(fileName.Equals("test/Chirp.Infrastructure.Tests/CheepUnitTest.cs")){
            console.log(week)
            buildDonut(week, fileMap)
        }

    })*/


}

const xScale = d3.scaleBand()
const defineScales = (data) => {
    xScale
        .domain(data.map(d => d.key)) // key is week
        .range([0, innerWidth])
}

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


    //var pie = d3.pie().sort(null).value(([key, value]) => value);


    /*
    //var pie = d3.pie().sort(null).value((d) => d["value"])
    var pie = d3.pie().sort(null).value(([key, value]) => value);
    const dataArray = Array.from(data, ([key, value]) => ({ key, value }));

    var svg = d3.select("#vis")
        .append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("height", 300)
        .style("border", "1px solid black")

    svg.append("text")
        .attr("text-anchor", "middle")
        .text(fileName)
        .attr("font-size", 4)

        var g = svg.append("g")
        .attr("transform", `translate(${Math.random() * 200 - 100},${Math.random() * 200 - 100})`); // Random placement


    const path = svg.datum(data).selectAll("path")
        .data(pie(data))
        .join("path")
        .attr("fill", (d, i) => color(d.data[0]))
        .attr("height", 5)
        .attr("width", 5)
        .attr("d", arc)
        .each(function (d) { this._current = d; }); // store the initial angles */




}


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
    .attr("cy", (d, i) => 20+i * 20) 
    .attr("r", 7)
    .attr("fill", (d) => color(d))

  // Add text for each author
  legendSvg.selectAll("text")
    .data(authors)
    .join("text")
    .attr("x", 25)
    .attr("y", function(d,i){ return 20+i*20}) 
    .text(d => d)
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .style("fill", function(d){ return color(d)})
    
};

