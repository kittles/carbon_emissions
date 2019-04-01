// data
var timeParse = d3.timeParse('%Y-%m-%d %H');
d3.json('data/hourly.json').then(function(data) {
	var dataset = _.map(data.data, (obj) => {
		obj.datetime = timeParse(obj.datetime);
		obj.image_url = 'img/' + obj.img;
		return obj;
	});
	init_chart(dataset);
});

// chart
function init_chart (dataset) {
    var body = $('body');
    console.log(body);
	var margin = {
		top: 50, 
		right: 50, 
		bottom: 50, 
		left: 50,
	};
	var width = body.innerWidth() - margin.left - margin.right;
	var height = 400 - margin.top - margin.bottom;


	var svg = d3.select('body')
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	svg.append('defs')
		.append('clipPath')
		.attr('id', 'clip')
		.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', width)
		.attr('height', height);

	// axes

	var x = d3.scaleTime().range([0, width]);
	var y = d3.scaleLinear().range([height, 0]);

	x.domain(d3.extent(dataset, function (d) { return d.datetime; }));
	y.domain([0, d3.max(dataset, function (d) { return d.total; })]).nice();


	var x_axis = d3.axisBottom()
		.scale(x)
		.ticks(10);
		//.tickFormat(d3.timeFormat('%Y-%m-%d %H'));

	var y_axis = d3.axisLeft()
		.scale(y)
		.ticks(10);

	svg.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + height + ')')
		.call(x_axis);
	svg.append('g')
		.attr('class', 'y axis')
		.call(y_axis);

    var line = d3.line()
        .x(function(d) { return x(d.datetime); })
        .y(function(d) { return y(d.total); });

    svg.append('path')
        .datum(dataset)
        .attr('class', 'line')
        .attr('d', line)
        .attr('clip-path', 'url(#clip)')
        .attr('opacity', '1')
        .attr('stroke', 'rgb(80,80,255)')

    // show max and min
    var max_point = _.maxBy(dataset, (d) => {
        return d.total;
    });
    var min_point = _.minBy(dataset, (d) => {
        return d.total;
    });

    var dt_format = 'MMMM Do, h a';
    $('#max-emitted-hour').text(`${max_point.total.toLocaleString()} tC on ${moment(max_point.datetime).format(dt_format)}`);
    $('#min-emitted-hour').text(`${min_point.total.toLocaleString()} tC on ${moment(min_point.datetime).format(dt_format)}`);

	svg.selectAll('circle')
		.data([max_point, min_point]).enter()
		.append('circle')
        .attr('clip-path', 'url(#clip)')
		.attr('cx', function (d) { return x(d.datetime); })
		.attr('cy', function (d) { return y(d.total); })
		.attr('r', '6px')
		.attr('stroke', function (d) { return d.total > 200000 ? 'red' : 'green'; })
		.attr('stroke-width', '2px')
		.attr('fill', 'none');


	// handle zooming
	var zoom = d3.zoom()
		.scaleExtent([1, 50])
		.translateExtent([
			[ x.range()[0], x.range()[1] ],
			[ x.range()[1], y.range()[0] ],
		])
		.on('zoom', zoomed);

	d3.select('svg').call(zoom);

	function zoomed () {
		var t = d3.event.transform;

		t.x = d3.min([t.x, 0]);
		t.y = d3.min([t.y, 0]);
		t.x = d3.max([t.x, (1-t.k) * width]);
		t.y = d3.max([t.y, (1-t.k) * height]);

		// Update Scales
		let new_x = t.rescaleX(x);

		svg.select('.x.axis')
			//.transition().duration(50)
			.call(x_axis.scale(new_x));

		// re-draw line
		plotLine = d3.line()
			.x(function (d) {
				return new_x(d.datetime);
			})
			.y(function (d) {
				return y(d.total);
			});
		d3.select('.line')
			//.transition().duration(50)
			.attr('d', plotLine);

		// max point indicators
		svg.selectAll('circle')
			.attr('cx', function (d) { return new_x(d.datetime); });
	}
}
