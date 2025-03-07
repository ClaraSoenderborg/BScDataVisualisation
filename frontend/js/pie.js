const buildPie = (authorMap, week, i, fileName, svg) => {

    const singleDonut = d3.select(".leftAxis").append("g")
        .attr("transform", `translate(${xScale(week) + xScale.bandwidth() / 2},${yScale(i + 1) + yScale.bandwidth() / 2})`)
        .style("opacity", 1)
        .attr("class", "singleDonut")
        .on("click", (e, d) => {

            showTooltipOnClick(e, d, fileName, authorMap, svg)
            singleDonut.style("opacity", 0.5)

        })
    
    var pie = d3.pie().sort(null).value(([key, value]) => value[0])

    const preparedPie = pie(authorMap)

    const drawPie = () => {     
        
        pieRadius = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.8) / 26


        var arcGen = d3.arc()
            .innerRadius(donutHole)
            .outerRadius(pieRadius)


        var arcs = singleDonut.selectAll()
        .data(preparedPie)
        .join("g")
        .attr("stroke", "white")
        .attr("stroke-width", "1")

        arcs.selectAll("path").remove()

        arcs.append("path")
        .attr("d", arcGen)
        .attr("fill", d => colorScale(d.data[0]))
    }
    
    drawPie()

    window.addEventListener("resize", drawPie)
    
}