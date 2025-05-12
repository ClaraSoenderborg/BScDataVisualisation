/**
 * Uses the pathname from repoPath data to create title inside #titleDiv
 */

const createTitle = (data) => {
    // Retrieves the entire repoPath to be displayed as the title
    const title = data[0].repoPath
    const div = d3.select("#titleDiv")

    // Sets the width to be 75% of the container's width
    // Source: https://medium.com/@belloquadriolawale/the-getboundingclientrect-method-5cd13e206bcf
    const containerWidth = d3.select("#container").node().getBoundingClientRect().width * 0.75
    const svg = div.append("svg").attr("width", containerWidth)

    const textElement = svg.append("text")
        .attr("class", "topTitleText")
        .attr("x", "2%") 
        .attr("y", "2%") 
        .style("dominant-baseline", "middle") 


    // Call to wrapText if name overflows width
    const lineCount = wrapText(textElement, title, containerWidth, line_height_four)

    svg.attr("height", line_height_four + (line_height_four * lineCount))

}



