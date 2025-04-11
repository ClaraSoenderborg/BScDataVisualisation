const buildPie = (node, svg) => {

    const {x, y, yearWeek, fileName, authorMap, nodeSize, yAxis, yAxisMetric} = node

    const leftAxisGroup = svg.select(".leftAxis")
    //console.log(y)

    const singleDonut = leftAxisGroup.append("g")
        .attr("transform", `translate(${x}, ${y})`)
        .style("opacity", 1)
        .attr("class", "singleDonut")
        .on("click", (e, d) => {

            showTooltipOnClick(e, fileName, authorMap, svg, nodeSize)
            singleDonut.style("opacity", 0.5)
            d3.select(".hoverToolTip").style("visibility", "hidden")

        })
        .on("mouseover", (e, d) => {
            //console.log(d3.select(".clickTooltip").style("visibility"))
            if (d3.select(".clickTooltip").style("visibility") !== "visible"){
                showTooltipOnHover(e, fileName, yAxis, yAxisMetric, svg)
                singleDonut.style("opacity", 0.5)
            }

        })
        .on("mouseout", (e, d) => {
            if (d3.select(".clickTooltip").style("visibility") !== "visible"){
                d3.select(".hoverToolTip").style("visibility", "hidden")
                singleDonut.style("opacity", 1)
            }
            
        });

    var pie = d3.pie().sort(null).value(([key, value]) => value.get("nodeSize"))

    const preparedPie = pie(authorMap)

    const drawPie = () => {


        var arcGen = d3.arc()
            .innerRadius(donutHole)
            .outerRadius(rScale(nodeSize))


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

}


