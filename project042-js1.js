dope_data = new XMLHttpRequest();
dope_data.open("GET",'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json', false);
dope_data.setRequestHeader('Content-Type','text/plain');

var num_arr;
dope_data.onreadystatechange = function() {
    if((dope_data.readyState == 4) && (dope_data.status==200)) {
        num_arr = JSON.parse(dope_data.responseText);
    }
}


dope_data.send();

const w = 1000;
const h = 500;
const paddingx = 50;
const paddingy = 25;

let tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("opacity", 0);

const svg_dope_plot = d3.select('#plot_canvas')
                      .attr('height', h)
                      .attr('width', w);

const xScale = d3.scaleLinear()
                .domain([d3.min(num_arr, (d) => d.Year) - 1, d3.max(num_arr, (d) => d.Year) + 1])
                .range([2*paddingx, (w - paddingx)]);

const yScale = d3.scaleTime()
                .domain([d3.min(num_arr, (d) => new Date(d.Seconds*1000)), 
                  d3.max(num_arr, (d) => new Date(d.Seconds*1000))])
                .range([paddingy, (h - paddingy)]);


const xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format('.0f'));
const yAxis = d3.axisLeft(yScale)
                .tickFormat((d) => (('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2)));

svg_dope_plot.select('#x-axis')
            .attr('transform', 'translate(0, ' + (h - paddingx/2) + ')')
            .call(xAxis)
            .attr('font-size', 15);

svg_dope_plot.select('#y-axis')
            .attr('transform', 'translate(' + 4*paddingy + ', 0)')
            .call(yAxis)
            .attr('font-size', 15);

//PLOTTING POINTS
svg_dope_plot.selectAll('circle')
            .data(num_arr)
            .enter()
            .append('circle')
            .attr('cx', (d) => xScale(d.Year))
            .attr('cy', (d) => yScale(d.Seconds*1000))
            .attr('r', 6)
//User Story #4: I can see dots, that each have a class of dot, which represent the data being plotted.
            .attr('class', 'dot')
//User Story #5: Each dot should have the properties data-xvalue and data-yvalue containing their corresponding x and y values.
//User Story #6: The data-xvalue and data-yvalue of each dot should be within the range of the actual data and in the correct data format. 
//For data-xvalue, integers (full years) or Date objects are acceptable for test evaluation. For data-yvalue (minutes), use Date objects.
            .attr('data-xvalue', (d) => d.Year)
            .attr('data-yvalue', (d) => (new Date(d.Seconds*1000)))
            .attr('fill', (d) => d.Doping == ''?'#FF7F0E':'#1F77B4')
//User Story #14: I can mouse over an area and see a tooltip with a corresponding id="tooltip" which displays more information about the area.
//User Story #15: My tooltip should have a data-year property that corresponds to the data-xvalue of the active area.
            .on("mouseover", function(d) {
              tooltip
                .transition()
                .duration(200)
                .style("opacity", 0.9);
              tooltip
                .html(d.Name + ': ' + d.Nationality + '<br>' +
                      'Year: ' + d.Year + ', Time: ' + d.Time + '<br><br>' + d.Doping)
                .style("left", d3.event.pageX + 20 + "px")
                .style("top", d3.event.pageY + 20 + "px");
              tooltip.attr("data-year", d.Year);
              })
            .on("mouseout", function(d) {
              tooltip
                .transition()
                .duration(400)
                .style("opacity", 0);
              });

//User Story #13: I can see a legend containing descriptive text that has id="legend".
const legend_colors = ['#FF7F0E', '#1F77B4'];
const legent_text = ['No doping', 'Doping']
var legend_offset = 0;

for (var i = 0; i < legend_colors.length; i++) {
  legend_offset = legend_offset + 25;
  
  d3.select('#legend')
  .append('g')
  .attr('id', 'g' + i)
  .append('rect')
  .attr('x', w - 6*paddingy)
  .attr('y', h/2 + legend_offset)
  .attr('height', 20)
  .attr('width', 20)
  .attr('fill', legend_colors[i]);

  d3.select('#legend')
  .select('#g' + i)
  .append('text')
  .attr('x', w - 5*paddingy)
  .attr('y', h/2 + legend_offset + 15)
  .text(legent_text[i])
};
            