const width = 100
const height = 100
const margin = 20
const radius = Math.min(width, height) / 2 - margin
const donutHole = 20
var color = d3.scaleOrdinal(d3.schemeCategory10)

var dummyData = d3.csvParse(`author,lines
    clara,5
    julia,10
    astrid,8
    sarah,3`, d3.autoType)

var arc = d3.arc()
    .innerRadius(donutHole)
    .outerRadius(radius)




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
    console.log(data);

    console.log(data.length);
    console.log(d3.max(data, d => d.linesAdded));
    console.log(d3.min(data, d => d.linesAdded));

    data.sort((a, b) => b.linesAdded - a.linesAdded);

    createVis(data);
});



const createVis = (data) => {
    const primaryGroup = d3.rollup(data,
        (D) => d3.sum(D, d => d.linesChanged),
        (w) => w.week,
        (d) => d.fileName,
        (d) => d.author)

    primaryGroup.forEach((fileMap, week) => {
        const fileArray = Array.from(fileMap, ([fileName, authorMap]) => {
            const totalLinesChanged = d3.sum(authorMap.values())
            return { week, fileName, totalLinesChanged };
        })
        fileArray.sort((a, b) => b.totalLinesChanged - a.totalLinesChanged)
        const sortedFiles = fileArray.slice(0, 10)
        //console.log(sortedFiles)    

        sortedFiles.forEach((item) => {
            const authorMap = fileMap.get(item.fileName)
            //console.log(authorMap)
            //const authorArray = Array.from(authorMap, ([key, value]) => ({key, value}))

            buildDonut(item.fileName, authorMap)
        })



    })

    //console.log(primaryGroup)

}

const buildDonut = (fileName ,data) => {
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
        .attr("fill", (d, i) => color(i))
        .attr("height", 5)
        .attr("width", 5)
        .attr("d", arc)
        .each(function (d) { this._current = d; }); // store the initial angles
}