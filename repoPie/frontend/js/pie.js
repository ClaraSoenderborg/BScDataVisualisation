/**
 * Builds a pie chart visualization for a given file node.
 * Appends a pie chart to the SVG at the specified coordinates using author data to
 * define pie slices.
 *
 */
const buildPie = (node, svg) => {
	const {
		x,
		y,
		yearWeek,
		fileName,
		authorMap,
		nodeSize,
		yAxis,
		yAxisMetric,
		nodeSizeMetric,
	} = node;

	const leftAxisGroup = svg.select(".leftAxis");

	// Append a group for the single pie chart and position it
	const singlePie = leftAxisGroup
		.append("g")
		.attr("transform", `translate(${x}, ${y})`)
		.attr("class", `singlePie ${sanitizeClassName(fileName)}`)
		// On click show click tooltip, adjust opacity, hide hovertooltip and remove highlights of matching files
		.on("click", (e, d) => {
			showTooltipOnClick({
				e,
				data: {
					fileName: fileName,
					authorMap: authorMap,
					nodeSize: nodeSize,
				},
				svg,
			});
			singlePie.style("opacity", 0.5);
			d3.select(".hoverTooltip").style("visibility", "hidden");
			d3.selectAll(".highlight-ring").remove();
		})
		// On mouse over show hover tooltip and highlight all pies for with matching filename
		.on("mouseover", (e, d) => {
			if (d3.select(".clickTooltip").style("visibility") !== "visible") {
				showTooltipOnHover({
					e,
					data: {
						fileName: fileName,
						yAxis: yAxis,
						yAxisMetric: yAxisMetric,
						authorMap: authorMap,
						nodeSize: nodeSize,
						nodeSizeMetric: nodeSizeMetric,
					},
					svg,
				});
				singlePie.style("opacity", 0.5);

				// Sanitize file name to use as CSS class name
				const className = sanitizeClassName(fileName);

				// Select and highlight all matching pies by adding a circle outline
				d3.selectAll(`.${className}`)
					.raise()
					.each(function () {
						const pie = d3.select(this);
						const bbox = this.getBBox();
						pie
							.insert("circle", ":first-child")
							.attr("class", "highlight-ring")
							.attr("r", bbox.width * 0.75) // slightly bigger than pie
							.attr("stroke", "magenta")
							.attr("stroke-width", 2);
					});
			}
		})
		// On mouse out hide hover tooltip and remove highlights of matching files
		.on("mouseout", (e, d) => {
			if (d3.select(".clickTooltip").style("visibility") !== "visible") {
				d3.select(".hoverTooltip").style("visibility", "hidden");
				singlePie.style("opacity", 1);

				const className = sanitizeClassName(fileName);

				d3.selectAll(`.${className}`)
					.style("opacity", 1)
					.selectAll(".highlight-ring")
					.remove();
			}
		});

	// Generate pie slice angles based on node size and apply to the authorMap data
	var pie = d3
		.pie()
		.sort(null)
		.value(([key, value]) => value.get("nodeSize"));
	const preparedPie = pie(authorMap);

	// Draws the full pie chart with slices for author contribution
	const drawPie = () => {
		var arcGen = d3.arc().innerRadius(0).outerRadius(rScale(nodeSize));

		// Binding the data for pie arc groups
		var arcs = singlePie
			.selectAll()
			.data(preparedPie)
			.join("g")
			.attr("class", "pie-arc");

		// Remove previous paths
		arcs.selectAll("path").remove();

		// Draw pie slices and color them by author
		arcs
			.append("path")
			.attr("d", arcGen)
			.attr("fill", (d) => colorScale(d.data[0]));
	};

	drawPie();
};

/**
 * Function to sanitizes a string to use as CSS classname by replacing invalid characters
 * with underscores.
 *
 */
function sanitizeClassName(str) {
	return str.replace(/[^a-zA-Z0-9-_]/g, "_");
}
