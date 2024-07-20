import React, { useEffect } from 'react';
import * as d3 from 'd3';
import './App.css';

const App = () => {
  useEffect(() => {

    d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json')
      .then(data => {
        if (!data||!data.data) {
          console.error('No data found');
          return;
        }
        console.log("data: " + JSON.stringify(data, null, 2));
        console.log("data length: " + data.data.length);

        const width = 1000;
        const height = 500;
        const barWidth = width / data.data.length;

        // Clear previous SVG elements to prevent duplicate graphs
        d3.select('.visHolder').selectAll('*').remove();

        const tooltip = d3.select('.visHolder')
        .append('div')
        .attr('id', 'tooltip');
  
      let svgContainer = d3.select('.visHolder')
        .append('svg')
        .attr('width', width + 120)
        .attr('height', height + 100);//height 50 for offset level up graph and 50 for space on top

        const dateData = data.data.map(item => new Date(item[0]));
        const maxX = new Date(d3.max(dateData));
        const minX = new Date(d3.min(dateData));

        const xScale = d3.scaleTime()
          .domain([minX, maxX])
          .range([0, width]);
        const xAxis = d3.axisBottom().scale(xScale);

        svgContainer.append('g')
          .call(xAxis)
          .attr('id', 'x-axis')
          .attr('transform', 'translate(60,'+ (height+50) +')');

        const Y = data.data.map(item => item[1]);
        const maxY = d3.max(Y);
        const yScaleRv = d3.scaleLinear()
          .domain([0, maxY])
          .range([height, 0]);

        const yScale = d3.scaleLinear()
          .domain([0, maxY])
          .range([0, height]);

        const yAxis = d3.axisLeft(yScaleRv);
        svgContainer.append('g')
          .call(yAxis)
          .attr('id', 'y-axis')
          .attr('transform', 'translate(60, 50)');

        svgContainer.selectAll('rect')
          .data(Y)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('index', (d, i) => i)
          .attr('data-date', (d, i) => data.data[i][0])
          .attr('data-gdp', (d, i) => data.data[i][1])
          .attr('x', (d, i) => xScale(dateData[i]))
          .attr('y', d => height-yScale(d))
          .attr('width', barWidth)
          .attr('height', d => yScale(d))
          .style('fill', '#ddf')
          .attr('transform', 'translate(60, 50)')
          .on('mouseover', function (event, d) {
            const i = this.getAttribute('index');
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html(dateData[i] + '<br>$' + Y[i])
              .attr('data-date', data.data[i][0]).style('left', i * barWidth + 40 + 'px');
          })
          .on('mouseout', function () {
            tooltip.transition().duration(300).style('opacity', 0);
          });
      })
      .catch(e => console.log(e));
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div id="title">United States GDP</div>
        <div className="visHolder"></div>
      </div>
    </div>
  );
};

export default App;
