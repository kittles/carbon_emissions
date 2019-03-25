// data
var timeParse = d3.timeParse('%Y-%m-%d %H');
d3.json('data/hourly.json').then(function(data) {
	var dataset = _.map(data.data, (obj) => {
		obj.datetime = timeParse(obj.datetime);
		obj.image_url = 'img/' + obj.img;
		return obj;
	});
	console.log(dataset[0]);
	init_chart(dataset);
});

// chart
function init_chart (dataset) {
	var margin = {
		top: 50, 
		right: 50, 
		bottom: 50, 
		left: 50,
	};
	var width = window.innerWidth - margin.left - margin.right;
	var height = window.innerHeight - margin.top - margin.bottom;


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
	y.domain(d3.extent(dataset, function (d) { return d.total; }));

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

    var lines = [];
    for (var hour=0; hour<24; hour++) {
        var line = d3.line()
            .x(function(d) { return x(d.datetime); })
            .y(function(d) { return y(d.total); });

        var ds = _.filter(dataset, (d) => {
            return (d.hour == hour && d.datetime.getDay() == 1);// && d.datetime.getDay() != 6);
        });
        svg.append('path')
            .datum(ds)
            .attr('class', `line line${hour}`)
            .attr('d', line)
            .attr('clip-path', 'url(#clip)')
            .attr('stroke', d3.interpolateRainbow(((hour + 4)%24)/24));
        lines.push({
            line: line,
            class: `line${hour}`,
        });
    }

    var highlighted_line = 0;
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', (margin.left / 2))             
        .attr('y', (margin.top / 2) - 10)
        .attr('text-anchor', 'left')  
        .style('font-size', '16px') 
        .text(`hour ${highlighted_line}`);

    setInterval(() => {
        highlighted_line++; 

        d3.select(`.line${(highlighted_line - 1)%24}`)
        .transition().duration(150)
        .style('stroke-width', '1px');

        d3.select(`.line${highlighted_line%24}`)
        .style('stroke-width', '4px');

        d3.select(`.chart-title`)
        .transition().duration(150)
        .text(`hour ${highlighted_line % 24}`);

    }, 300);


	//var zoom = d3.zoom().on('zoom', zoomed);
	//d3.select('svg').call(zoom);

	//function zoomed () {
	//	// Update Scales
	//	let new_x = d3.event.transform.rescaleX(x);

	//	svg.select('.x.axis')
	//		.transition().duration(50)
	//		.call(x_axis.scale(new_x));

	//	// re-draw line
	//	plotLine = d3.line()
	//		.x(function (d) {
	//			return new_x(d.datetime);
	//		})
	//		.y(function (d) {
	//			return y(d.total);
	//		});
	//	d3.select('.line')
	//		.transition().duration(50)
	//		.attr('d', plotLine);
	//}
}
