const createTitle = (data) => {
    const title = data[0].repoPath

    const div = d3.select("#titleDiv")
    

    div.append("text")
        .attr("class", "title-text")
        .attr("x", "2%") 
        .attr("y", "50%") 
        .text(title); 


}
