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

var svg = d3.select("#vis")
    .append("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .attr("height", 600)
    .style("border", "1px solid black")

var arc = d3.arc()
    .innerRadius(donutHole)
    .outerRadius(radius)

var pie = d3.pie().sort(null).value((d) => d["lines"])

const path = svg.datum(dummyData).selectAll("path")
    .data(pie(dummyData))
    .join("path")
    .attr("fill", (d, i) => color(i))
    .attr("d", arc)
    .each(function (d) { this._current = d; }); // store the initial angles


svg.append("text")
    .attr("text-anchor", "middle")
    .text("cheep.cs")
    .attr("font-size", "8px")
/*
d3.csv("../../data/data.csv", d => {
    return {
        commitSHA: d.commitSHA,
        date: d.date,
        author: d.author,
        linesAdded: +d.linesAdded,
        linesDeleted: +d.linesDeleted,
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
    
}*/