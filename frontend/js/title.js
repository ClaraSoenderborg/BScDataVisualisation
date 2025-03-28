const createTitle = (data, div) => {
    const titles = Array.from(new Set(data.map(d => d.repoPath)))

    const title = div.append("svg")
        .attr("width", "100%")
        .attr("height", height * 0.08)

    title.append("text")
        .attr("class", "title-text")
        .attr("x", "2%") 
        .attr("y", "50%") 
        .text(titles); 


}
