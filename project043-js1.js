const w = 1600;
const h = 600;
const paddingX = 25;
const paddingY = 20;

let tooltip = d3.select("body")
              .append("div")
              .attr("class", "tooltip")
              .attr("id", "tooltip")
              .style("opacity", 0);


const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
'July', 'August', 'September', 'October', 'November', 'December']

temp_data = new XMLHttpRequest();
temp_data.open("GET",'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json', false);
temp_data.setRequestHeader('Content-Type','text/plain');

var temp_data_table;
temp_data.onreadystatechange = function() {
    if((temp_data.readyState == 4) && (temp_data.status==200)) {
      temp_data_table = JSON.parse(temp_data.responseText);
    }
}
temp_data.send();

const baseTemperature = temp_data_table.baseTemperature;
temp_data_table = temp_data_table.monthlyVariance;

const time_span = d3.max(temp_data_table, (d) => d.year) - d3.min(temp_data_table, (d) => d.year) + 1;

const heat_map_plot = d3.select('#heat_map')
                        .attr('width', w)
                        .attr('height', h);

const xScale = d3.scaleLinear()
                .domain([d3.min(temp_data_table, (d) => d.year),
                        d3.max(temp_data_table, (d) => d.year)])
                .range([5*paddingX, (w - 5*paddingX)]);

const yScale = d3.scaleLinear()
                .domain([d3.min(temp_data_table, (d) => (d.month - 0.5)), d3.max(temp_data_table, (d) => (d.month + 0.5))])
                .range([0, (h - 10*paddingY)]);

const monthScale = d3.scaleBand()
    .domain(monthNames)
    .range([0, (h - 10*paddingY)]);

const xAxis = d3.axisBottom(xScale)
                .tickFormat(d3.format('.0f'))
                .ticks(time_span/10);

const yAxis = d3.axisLeft(monthScale);

//User Story #5: My heat map should have rect elements with a class="cell" that represent the data.
heat_map_plot.selectAll('rect')
            .data(temp_data_table)
            .enter()
            .append('rect')
            .attr('class', 'cell')
//User Story #7: Each cell will have the properties data-month, data-year, data-temp containing their corresponding month, year, and temperature values.
//User Story #8: The data-month, data-year of each cell should be within the range of the data.
            .attr('data-month', (d) => (d.month-1))
            .attr('data-year', (d) => d.year)
            .attr('data-temp', (d) => d.variance)
            .attr('x', (d) => (xScale(d.year - 0.5)))
            .attr('y', (d) => yScale(d.month))
            .attr('width', 0.85*w/time_span)
            .attr('height', (0.65*h)/12)
//User Story #6: There should be at least 4 different fill colors used for the cells.
            .attr('fill', (d) => cell_color(d.variance))
//User Story #16: I can mouse over an area and see a tooltip with a corresponding id="tooltip" which displays more information about the area.
//User Story #17: My tooltip should have a data-year property that corresponds to the data-year of the active area.
            .on("mouseover", function(d) {
              tooltip
                .transition()
                .duration(20)
                .style("opacity", 0.75);
              tooltip
                .html(d.year + ' - ' + monthNames[d.month-1]  + '<br>'
                      + (d.variance + baseTemperature).toFixed(1) + ' &#176C <br>'
                      + d.variance.toFixed(1)  + ' &#176C <br>') 
                .style("left", d3.event.pageX - 60 + "px")
                .style("top", d3.event.pageY - 120 + "px");
              tooltip.attr("data-year", d.year);
              })
            .on("mouseout", function(d) {
              tooltip
                .transition()
                .duration(20)
                .style("opacity", 0);
              });



//function to return the color of the cells
function cell_color(p) {
  p = p + baseTemperature;
  if (p > 12.8) {return ('rgb(165, 0, 38)')}
  else if (p > 11.7) {return ('rgb(215, 48, 39)')}
  else if (p > 10.6) {return ('rgb(244, 109, 67)')}
  else if (p > 9.5) {return ('rgb(253, 174, 97)')}
  else if (p > 8.3) {return ('rgb(254, 224, 144)')}
  else if (p > 7.2) {return ('rgb(255, 255, 191)')}
  else if (p > 6.1) {return ('rgb(224, 243, 248)')}
  else if (p > 5.0) {return ('rgb(171, 217, 233)')}
  else if (p > 3.9) {return ('rgb(116, 173, 209)')}
  else if (p > 2.8) {return ('rgb(69, 117, 180)')}
  else {return ('rgb(49, 54, 149)')}
}

heat_map_plot.select('#x-axis')
            .attr('transform', 'translate(0, ' + (0.7*h - 2) + ')')
            .call(xAxis)
            .attr('font-size', 15);

heat_map_plot.select('#x-axis-label')
            .append('text')
            .attr('x', w/2)
            .attr('y', 0.8*h)
            .text('YEAR');

heat_map_plot.select('#y-axis')
            .attr('transform', 'translate(' + (5*paddingX - 5) + ', ' + (paddingY - 2) + ')')
            .call(yAxis)
            .attr('font-size', 15);

heat_map_plot.select('#y-axis-label')
            .append('text')
            .attr('transform', 'translate(' + w/40 + ',' + 0.4*h + ') rotate(-90)')
            .text('MONTHS');



//User Story #12: My heat map should have multiple tick labels on the x-axis with the years between 1754 and 2015.
//User Story #13: My heat map should have a legend with a corresponding id="legend".
//User Story #14: My legend should contain rect elements.
//User Story #15: The rect elements in the legend should use at least 4 different fill colors.

const legend_colors = ['rgb(49, 54, 149)', 'rgb(69, 117, 180)', 'rgb(116, 173, 209)',
                      'rgb(171, 217, 233)', 'rgb(224, 243, 248)', 'rgb(255, 255, 191)',
                      'rgb(254, 224, 144)', 'rgb(253, 174, 97)', 'rgb(244, 109, 67)', 
                      'rgb(215, 48, 39)', 'rgb(165, 0, 38)'];


heat_map_plot.select('#legend')
            .selectAll('rect')
            .data(legend_colors)
            .enter()
            .append('rect')
            .attr('x', (d, i) => {return(h/4 + 40*i)})
            .attr('y', (h - 5*paddingY))
            .attr('width', 40)
            .attr('height', 40)
            .attr('fill', (d) => {return(d)})
            .attr('stroke', 'black')

const numbersInLegend = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];
  
heat_map_plot.select('#legend')
            .selectAll('text')
            .data(numbersInLegend)
            .enter()
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('x', (d, i) => {return(h/4 + 40*(i + 1))})
            .attr('y', (h - 5*paddingY + 60))
            .text((d) => d.toFixed(1));




//User Story #9: My heat map should have cells that align with the corresponding month on the y-axis.
//User Story #10: My heat map should have cells that align with the corresponding year on the x-axis.
//User Story #11: My heat map should have multiple tick labels on the y-axis with the full month name.       