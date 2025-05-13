/**
 * Defines and sets the scales for the x-axis, y-axis, pie radius, and color scale based on the provided data.
 *
 */

// Source: E. Meeks, and A. Dafour, ``D3.js in action'', Third edition, pp 98-101, 2024.
const xScale = d3.scaleBand();
//Source:  E. Meeks, and A. Dafour, ``D3.js in action'', Third edition, pp 259-262, 2024.
const yScale = d3.scaleLog();
const rScale = d3.scaleSqrt(); // Pie chart radius scale

// Defines the range of colors used
const colorScale = d3.scaleOrdinal([
	"#006d77", // Current
	"#ba274a", // Rose red
	"#AEBF89", // Yellow green
	"#8da0cb", // Blue
	"#e89ff0", // Light purple
	"#d98b19", // Mustard
	"#ffa69e", // Melon
	"#473c85", // Dark blue
	"#fde12d", // School bus yellow
	"#628b35", // Avocado
	"#e96a38", // Coral
]);

// Sets background colours for graph
const backgroundColor1 = "#FFFFFF"; // White
const backgroundColor2 = "#D3D3D3"; // Gray

// Configures the domain and range for the scales
const defineScales = ({
	data,
	globalyMax,
	globalyMin,
	globalNodeMax,
	authors,
	maxNumberOfFiles,
}) => {
	// Find weeks for x-axis considering the year for correct order of weeks
	// Source: ChatGPT (OpenAI), April 2025
	const minDate = d3.min(data, (d) => d.date);
	const maxDate = d3.max(data, (d) => d.date);

	const yearWeeks = [];
	var current = d3.utcMonday(minDate);
	const end = d3.utcMonday(maxDate);

	while (current <= end) {
		yearWeeks.push(formatISOWeek(current));
		current = d3.utcMonday.offset(current, 1);
	}

	// Sets the xScale domain to the weeks and range to the width of the graph
	xScale.domain(yearWeeks).range([0, width]);

	// Sets the yScale domain based on the user chosen metrics minimum and maximum value,
	// range as the graph height and with logarithmic scale with base of 10 or 2 based on the size of max value
	yScale
		.domain([Math.max(1, globalyMin) / 1.5, globalyMax * 1.5])
		.range([graph_height, margin.top])
		.base(globalyMax > 100 ? 10 : 2);

	// Calculates the maximum radius for the pie chart based on the number of files shown
	const radiusMax =
		maxNumberOfFiles > 10
			? d3.min([xScale.bandwidth() / 4, graph_radius])
			: graph_radius;

	// Sets the rScale domain based on the user chosen metric max value and range based on radiusMax
	rScale.domain([0, globalNodeMax]).range([radiusMax * 0.5, radiusMax]);

	// Sets the color scale domain based the authors
	colorScale.domain(authors);
};
