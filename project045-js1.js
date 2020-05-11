//treemap size
const w = 600;
const h = 400;

var svg_space = d3.select('#treemap_space')
                  .attr('width', w+200)
                  .attr('height', h);

const data_link = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json'

var videoGameData_handler = new XMLHttpRequest();
videoGameData_handler.open("GET", data_link, false);
videoGameData_handler.setRequestHeader('Content-Type','text/plain');

var videoGameData;
videoGameData_handler.onreadystatechange = function() {
    if((videoGameData_handler.readyState == 4) && (videoGameData_handler.status==200)) {
      videoGameData = JSON.parse(videoGameData_handler.responseText);
    }
}
videoGameData_handler.send();

//adding another field "value" for each category, sum of all the names in that category
videoGameData.children.map((d) => d.value = 
                            (d.children.map((r) => Number(r.value)) 
                              .reduce((p, q) => (0, p + q))));

//Rounding off values to two digits
videoGameData.children.map((d) => d.value = parseFloat(d.value.toFixed(2)));


//adding another field "value" in overall data, sum of all categories
//REDUCE IS NOT WORKING??
//videoGameData.value = videoGameData.children.reduce((p, q) => (0, p.value + q.value));

videoGameData.value = 0;
for (i = 0; i < videoGameData.children.length; i++) {
  videoGameData.value = videoGameData.value + videoGameData.children[i].value;
}
//Rounding off total value to two digits
videoGameData.value = parseFloat(videoGameData.value.toFixed(2));

//sorting the children (categories) by category value
videoGameData.children.sort((a, b) => {return(b.value - a.value)})

//creating a scale for total value mapping to total area
const areaScale = d3.scaleLinear().domain([0, videoGameData.value]).range([0, w*h]);


//BLOCK 0 START
//fucntion to calculate heights for n number of rects, filling hTemp if hTemp < wTemp and viceversa
//returns in the form of [[h_array], [w_array]]
function rectDims(hTemp, wTemp, n, dataset) {
  var dataset_temp = dataset.slice(0, n);
  var total_area = dataset_temp.map((d) => areaScale(d.value))
                                .reduce((a, b) => (0, a + b));
  //fill whole hTemp if hTemp <= wTemp
  if (hTemp <= wTemp) {
    var h_array = dataset_temp.map((d) => areaScale(d.value)*hTemp/total_area);
    var w_array = Array(n).fill(total_area/hTemp);
  }
  //otherwise fill whole wTemp
  else {
    var w_array = dataset_temp.map((d) => areaScale(d.value)*wTemp/total_area);
    var h_array = Array(n).fill(total_area/wTemp);
  }
  return [h_array, w_array];
}


//OUTER LAYOUT - BLOCK 1 START
//===================================
var rect_x = 0;
var rect_y = 0;
var hFill = h;
var wFill = w;
var videoGameData_children_temp = videoGameData.children;

var aspectRatio;
var aspectRatioDeviation;

var treemap_layout = [];

for (i = 0; i < videoGameData.children.length;) {
  aspectRatioDeviation = 100;
  //finding opetimal number of rects for the iteration
  for (j = 1; j <= videoGameData_children_temp.length; j++) {
    if(videoGameData_children_temp.length == 1) {
      treemap_layout.push({
        'name': videoGameData.children[i].name,
        'rectHeight': hFill, 
        'rectWidth': wFill,
        'rectX': rect_x,
        'rectY': rect_y}); 
    }
    else {
      rectDimArray = rectDims(hFill, wFill, j, videoGameData_children_temp);
      aspectRatio = rectDimArray[0][0]/rectDimArray[1][0];
      aspectRatioDeviationNew = Math.abs(aspectRatio - 1);
    
      if (aspectRatioDeviationNew < aspectRatioDeviation) {
        aspectRatioDeviation = aspectRatioDeviationNew;
      }
      else {
        j--;
        rectDimArray = rectDims(hFill, wFill, j, videoGameData_children_temp);

        for (k = i; k < i + j; k++) {
          treemap_layout.push({
            'name': videoGameData.children[k].name,
            'rectHeight': rectDimArray[0][k - i], 
            'rectWidth': rectDimArray[1][k - i],
            'rectX': rect_x,
            'rectY': rect_y});

          if (hFill <= wFill) {
            rect_y = rect_y + rectDimArray[0][k - i];
          }
          else {
            rect_x = rect_x + rectDimArray[1][k - i];
          }
        }

        if (hFill <= wFill) {
          wFill -= rectDimArray[1][0];
          rect_x += rectDimArray[1][0];
          rect_y = rect_y - hFill;
        }
        else {
          hFill -= rectDimArray[0][0];
          rect_y += rectDimArray[0][0];
          rect_x = rect_x - wFill;
        }
        break;
      }
    }
  }
  i = i + j;
  videoGameData_children_temp = videoGameData_children_temp.slice(j);
}
//===================================
//OUTER LAYOUT - BLOCK 1 END


//INNER LAYOUT - BLOCK 2 START
//===================================
treemap_layout_inner = [];
for (i_inner = 0; i_inner < treemap_layout.length; i_inner++) {
  rect_x = treemap_layout[i_inner].rectX;
  rect_y = treemap_layout[i_inner].rectY;
  hFill = treemap_layout[i_inner].rectHeight;
  wFill = treemap_layout[i_inner].rectWidth;
  catName = treemap_layout[i_inner].name;

  videoGameData_children_temp = videoGameData.children[i_inner].children;

  for (i = 0; i < videoGameData.children.length;) {
    aspectRatioDeviation = 100;
    //finding opetimal number of rects for the iteration
    for (j = 1; j <= videoGameData_children_temp.length; j++) {

      rectDimArray = rectDims(hFill, wFill, j, videoGameData_children_temp);
      aspectRatio = rectDimArray[0][0]/rectDimArray[1][0];
      aspectRatioDeviationNew = Math.abs(aspectRatio - 1);
    
      if (aspectRatioDeviationNew < aspectRatioDeviation) {
        aspectRatioDeviation = aspectRatioDeviationNew;
        
        if (j == videoGameData_children_temp.length) {
          lastIndex = videoGameData.children[i_inner].children.length;
          for (r = 0; r < j; r++) {
            treemap_layout_inner.push({
              'category': catName,
              'name': videoGameData.children[i_inner].children[lastIndex - (j - r)].name,
              'rectHeight': rectDimArray[0][r], 
              'rectWidth': rectDimArray[1][r],
              'rectX': rect_x,
              'rectY': rect_y,
              'value': videoGameData.children[i_inner].children[lastIndex - (j - r)].value});

            if (hFill <= wFill) {
              rect_y = rect_y + rectDimArray[0][k - i];
            }
            else {
              rect_x = rect_x + rectDimArray[1][k - i];
            }
          } 
          break;
        }
      }
      else {
        j--;
        rectDimArray = rectDims(hFill, wFill, j, videoGameData_children_temp);

        for (k = i; k < (i + j); k++) {
          treemap_layout_inner.push({
            'category': catName,
            'name': videoGameData.children[i_inner].children[k].name,
            'rectHeight': rectDimArray[0][k - i], 
            'rectWidth': rectDimArray[1][k - i],
            'rectX': rect_x,
            'rectY': rect_y,
            'value': videoGameData.children[i_inner].children[k].value});

          if (hFill <= wFill) {
            rect_y = rect_y + rectDimArray[0][k - i];
          }
          else {
            rect_x = rect_x + rectDimArray[1][k - i];
          }
        }

        if (hFill <= wFill) {
          wFill -= rectDimArray[1][0];
          rect_x += rectDimArray[1][0];
          rect_y = rect_y - hFill;
        }
        else {
          hFill -= rectDimArray[0][0];
          rect_y += rectDimArray[0][0];
          rect_x = rect_x - wFill;
        }
        break;
      }
    }
    i = i + j;
    videoGameData_children_temp = videoGameData_children_temp.slice(j);
  }
}
//===================================
//INNER LAYOUT - BLOCK 2 END


//forming key-value color pallete
var colorPalette = {};
for (i in videoGameData.children) {
  colorPalette[videoGameData.children[i].name] = d3.interpolateViridis(i/videoGameData.children.length)
}
//MAIN LOOP TO PLOT SMALL RECTS
svg_space.selectAll('rect')
    .data(treemap_layout_inner)
    .enter()
    .append('rect')
    .attr('class', 'tile')
    .attr('data-name', (d) => d.name)
    .attr('data-category', (d) => d.category)
    .attr('data-value', (d) => d.value)
    .attr('stroke', 'white')
    .attr('height', (d) => d.rectHeight)
    .attr('width', (d) => d.rectWidth)
    .attr('x', (d) => d.rectX)
    .attr('y', (d) => d.rectY)
    .attr('fill', (d) => colorPalette[d.category])
    .on("mousemove", function(d) {
      tooltip
        .transition()
        .duration(20)
        .style("opacity", 1);
      tooltip
        .html('Name:' + d.name + '<br>' +
              'Category:' + d.category + '<br>' +
              'Value:' + d.value)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px")
        .attr("data-value", d.value)
      tooltip.attr("data-year", d.year);
      })
    .on("mouseout", function(d) {
      tooltip.style("opacity", 0);
      });
    
    
    
svg_space.selectAll('text')
    .data(treemap_layout_inner)
    .enter()
    .append('text')
    .attr('x', (d) => d.rectX + 5)
    .attr('y', (d) => d.rectY + 15)
    .text((d) => Math.round(d.value))
    //.attr('font-size', 10)
    .attr('fill', 'white');

//----------------------------------
//BLOCK 4 - LEGEND
legendLength = treemap_layout.length;
//Index to split the legend in two columns
splitIndex = Math.round(legendLength/2);

//legend boxes
var gLegend = svg_space.append('g')
    .attr('transform', 'translate(650, 0)')
    .attr('id', 'legend')

gLegend.selectAll('rect')
    .data(treemap_layout)
    .enter()
    .append('rect')
    .attr('class', 'legend-item')
    .attr('x', (d, i) => {return((i < splitIndex)?0:80)})
    .attr('y', (d, i) => {return(30*(i%splitIndex) + 50)})
    .attr('height', 15)
    .attr('width', 15)
    .attr('fill', (d) => colorPalette[d.name])
    .attr('stroke', 'black');

//legend texts
gLegend.selectAll('text')
    .data(treemap_layout)
    .enter()
    .append('text')
    .attr('x', (d, i) => {return((i < splitIndex)?25:105)})
    .attr('y', (d, i) => {return(30*(i%splitIndex) + 62)})
    .text((d) => d.name)
//----------------------------------

//----------------------------------
//BLOCK 5 - TOOPTIP
// Define the div for the tooltip
let tooltip = d3.select("body")
              .append("div")
              .attr("class", "tooltip")
              .attr("id", "tooltip")
              .style("opacity", 0);


//----------------------------------Z

