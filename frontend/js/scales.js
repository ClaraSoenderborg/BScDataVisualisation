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

const formatISOWeek = d3.utcFormat("%G-%V"); // e.g. "2025-15"


const defineScales = (data, globalyMax, globalyMin, globalNodeMax, globalNodeMin, authors, maxNumberOfFiles) => {

    //const parseDate = d3.timeParse("%Y-%m-%d");

    //data.map(d => {d.date = parseDate(d.date);
    //const formatISOWeek = d3.utcFormat("%G-%V"); // e.g. "2025-15"

    //const yearWeeksFromData = data.map(d => formatISOWeek(d.date))

    const minDate = d3.min(data, d => d.date);
    const maxDate = d3.max(data, d => d.date);
    
    const yearWeeks = [];
    let current = d3.utcMonday(minDate); // Snap to start of week (Monday)
    const end = d3.utcMonday.offset(maxDate, 1); // Go 1 week beyond max to include it

    while (current < end) {
        yearWeeks.push(formatISOWeek(current));
        current = d3.utcMonday.offset(current, 1); // Move forward 1 week
    }


    const sortByWeeks = d3.sort(data, (a, b) => a.week - b.week)
    const sortByYear = d3.sort(sortByWeeks, (a, b) => a.year - b.year)
    //console.log(data)

    const minWeek = sortByYear[0].week
    const maxWeek = sortByYear[sortByYear.length - 1].week

    //console.log(yearWeeks)
    xScale
        .domain(yearWeeks) // key is week
        .range([0, width]) //Changes

    yScale
        .domain([Math.max(1, globalyMin) / 1.5, globalyMax * 1.5]) //
        .range([graph_height, margin.top])
        .base(globalyMax > 100 ? 10 : 2)


    const radiusMax = maxNumberOfFiles > 10 ? d3.min([xScale.bandwidth() / 4, graph_radius]) : graph_radius

    rScale
        .domain([globalNodeMin, globalNodeMax])
        .range([radiusMax * 0.50, radiusMax])

    colorScale
        .domain(authors)

}



