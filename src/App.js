import React, { useEffect } from 'react';
import * as d3 from 'd3';
import './App.css';

const months = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];


const App = () => {
  useEffect(() => {

    d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
      .then(data => {
        if (!data) {
          console.error('No data found');
          return;
        }
        console.log("data org: " + data);
        console.log("data: " + JSON.stringify(data, null, 2));
        const baseTemp = data.baseTemperature;
        console.log("data length: " + data.monthlyVariance.length);


        const width = 1000;
        const height = 500;


       
        

        // Clear previous SVG elements to prevent duplicate graphs
        d3.select('.visHolder').selectAll('*').remove();

        const tooltip = d3.select('.visHolder')
        .append('div')
        .attr('id', 'tooltip');
  
      let svgContainer = d3.select('.visHolder')
        .append('svg')
        .attr('width', width + 100)
        .attr('height', height + 200);

        const dataYearMin = d3.min(data.monthlyVariance, d => d.year);
        const dataYearMax = d3.max(data.monthlyVariance, d => d.year);

        const xScale = d3.scaleTime()
          .domain([new Date(dataYearMin, 0), new Date(dataYearMax, 0)])
          .range([0, width]);

        const xAxis = d3.axisBottom(xScale)
          .ticks(d3.timeYear.every(10)) // Adjust tick interval as needed
          .tickFormat(d3.timeFormat("%Y"));


        svgContainer.append('g')
          .call(xAxis)
          .attr('id', 'x-axis')
          .attr('transform', 'translate(60,'+ (height+100) +')');


        const yScale = d3
          .scaleBand()
          .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
          .range([0, height]);

        const yAxis = d3
          .axisLeft()
          .scale(yScale)
          .tickValues(yScale.domain())
          //.tickFormat(function(month){return months[month]});
          .tickFormat( (month) => months[month]);

        svgContainer.append('g')
          .call(yAxis)
          .attr('id', 'y-axis')
          .attr('transform', 'translate(60, 100)');

          const barWidth = width / (dataYearMax - dataYearMin + 1);
          const barHeight = yScale.bandwidth();
          
        const heatMapMin = d3.min(data.monthlyVariance, d => d.variance)+baseTemp;
        const heatMapMax = d3.max(data.monthlyVariance, d => d.variance)+baseTemp;
        const stepColor = 20;
    
        const getColorForValue = (value, min = heatMapMin, max = heatMapMax, step = stepColor) => {
          const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([min, max]);
          const colorRange = Array.from({ length: step }, (_, i) => {
            const stepValue = min + (i / (step - 1)) * (max - min);
            return colorScale(stepValue);
          });
          const normalizedValue = Math.max(0, Math.min(step - 1, Math.floor(((value - min) / (max - min)) * (step - 1))));
          return colorRange[normalizedValue];
        };
        

        svgContainer.selectAll('rect')
          .data(data.monthlyVariance)
          .enter()
          .append('rect')
          .attr('class', 'cell')
          .attr('index', (d, i) => i)
          .attr('data-year', (d, i) => d.year)
          .attr('data-month', (d, i) => d.month-1)
          .attr('data-temp', (d, i) => d.variance+baseTemp)
          .attr('x', d => xScale(new Date(d.year, 0)))
          .attr('y', d => yScale(d.month-1))
          .attr('width', barWidth)
          .attr('height', barHeight)
          .style('fill', (d,i) =>  getColorForValue(d.variance+baseTemp) )
          .attr('transform', 'translate(60, 100)')
          .on('mouseover', function (event, d) {
            const i = this.getAttribute('index');
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html('Year:' + data.monthlyVariance[i].year + '<br> Month:' + months[data.monthlyVariance[i].month-1] + '<br> Value:' + (data.monthlyVariance[i].variance+baseTemp).toFixed(2))
              .attr('data-year', data.monthlyVariance[i].year ) 
              .style('left', (event.pageX + 5) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          })
          .on('mouseout', function () {
            tooltip.transition().duration(300).style('opacity', 0);
          });


          const legendWidth = 800;
          const legendHeight = 30;
          const padding = 60;
  
          // Add legend
          const legend = svgContainer.append('g')
            .attr('id', 'legend')
            .attr('transform', `translate(${padding},${height + padding * 2.2})`); // Adjusted position
  
          const legendScale = d3.scaleLinear()
            .domain([heatMapMin, heatMapMax])
            .range([0, legendWidth]);
  
          const legendAxis = d3.axisBottom()
            .scale(legendScale)
            .ticks(stepColor);
  
          const colorSteps = Array.from({ length: stepColor }, (_, i) => {
            const stepValue = heatMapMin + (i / (stepColor - 1)) * (heatMapMax - heatMapMin);
            return { value: stepValue, color: getColorForValue(stepValue) };
          });
  
          legend.selectAll('rect')
            .data(colorSteps)
            .enter()
            .append('rect')
            .attr('x', (d, i) => i * (legendWidth / stepColor))
            .attr('y', 0)
            .attr('width', legendWidth / stepColor)
            .attr('height', legendHeight)
            .attr('fill', d => d.color);
  
          legend.append('g')
            .attr('transform', `translate(0,${legendHeight})`)
            .call(legendAxis);




      })
      .catch(e => console.log(e));
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div id="title">Monthly Global Land-Surface Temperature</div>
        <div id="description">1753 - 2015: base temperature 8.66℃</div>
        <div className="visHolder"></div>
      </div>
    </div>
  );
};

export default App;
