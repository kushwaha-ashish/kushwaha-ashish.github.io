const w = 1000;
const h = 430;

let tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("opacity", 0);

req = new XMLHttpRequest();
req.open("GET",'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json', false);
req.setRequestHeader('Content-Type','text/plain');

var obj;
req.onreadystatechange = function() {
    if((req.readyState == 4) && (req.status==200)) {
        obj = JSON.parse(req.responseText);
    }
}

req.send();

var num_arr = obj.data;

const paddingX = 55;
const paddingY = 20;

const svg_rect = d3.select('#sheet3-3')
    .attr('height', h)
    .attr('width', w)


const xScale = d3.scaleTime()
                .domain([d3.min(num_arr, (d) => new Date(d[0])), d3.max(num_arr, (d) => new Date(d[0]))])
                .range([paddingX, (w-2*paddingX)]);

const yScale = d3.scaleLinear()
                .domain([0, d3.max(num_arr, (d) => d[1])])
                .range([(h - paddingY), paddingY]);


                   
//User Story #5: My chart should have a rect element for each data point with a corresponding class="bar" displaying the data.
svg_rect.selectAll('rect')
    .data(num_arr)
    .enter()
    .append('rect')
    .attr('x', (d) => xScale(new Date(d[0])))
    .attr('y', (d) => yScale(d[1]))
    .attr('width', ((w-4*paddingX)/num_arr.length))
//User Story #9: Each bar element's height should accurately represent the data's corresponding GDP.
    .attr('height', (d) => (h - paddingY - yScale(d[1])))
    .attr('fill', 'navy')
//User Story #6: Each bar should have the properties data-date and data-gdp containing date and GDP values.
    .attr('class', 'bar')
//User Story #7: The bar elements' data-date properties should match the order of the provided data.
//User Story #10: The data-date attribute and its corresponding bar element should align with the corresponding value on the x-axis.
    .attr('data-date', (d) => d[0])
//User Story #8: The bar elements' data-gdp properties should match the order of the provided data.
//User Story #11: The data-gdp attribute and its corresponding bar element should align with the corresponding value on the y-axis.*/
    .attr('data-gdp', (d) => d[1])
//User Story #12: I can mouse over an area and see a tooltip with a corresponding id="tooltip" which displays more information about the area.
//User Story #13: My tooltip should have a data-date property that corresponds to the data-date of the active area.
    .on("mouseover", function(d) {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip
          .html('Year: ' + d[0] + '<br>' + 'GDP: ' + d[1])
          .style("left", d3.event.pageX + 20 + "px")
          .style("top", d3.event.pageY + 20 + "px");
        tooltip.attr("data-date", d[0]);
        })
    .on("mouseout", function(d) {
        tooltip
          .transition()
          .duration(400)
          .style("opacity", 0);
        });

const yAxis = d3.axisLeft(yScale);

const xAxis = d3.axisBottom(xScale);

//User Story #4: Both axes should contain multiple tick labels, each with the corresponding class="tick".
svg_rect.select('#x-axis')
    .attr('transform', 'translate(0, ' + (h - paddingY) + ')')
    .call(xAxis)
    .attr('font-size', 15);

svg_rect.select('#y-axis')
    .attr('transform', 'translate(' + paddingX + ', 0)')
    .call(yAxis)
    .attr('font-size', 15);