import React, { useEffect } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import './App.css';

const App = () => {
  useEffect(() => {
    const url1 = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
    const url2 = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

    d3.select('.visHolder').selectAll('*').remove();

    Promise.all([d3.json(url1), d3.json(url2)])
      .then(([countiesData, educationData]) => {
        if (!countiesData || !educationData) {
          console.error('No data found');
          return;
        }

        //console.log("Education Data:" + JSON.stringify(educationData));
        const width = 960;
        const height = 600;
        const legendWidth = 300;
        const legendHeight = 20;
        const legendPadding = 440;
        const colorScale = d3.scaleQuantize()
          .domain([0, 100]) // Adjust based on your education data range
          .range(d3.schemeBlues[9]);

        // Create SVG container
        const svg = d3.select('.visHolder')
          .append('svg')
          .attr('width', width)
          .attr('height', height);

        // Create tooltip
        const tooltip = d3.select('.visHolder')
          .append('div')
          .attr('id', 'tooltip')
          .style('position', 'absolute')
          .style('opacity', 0)
          .style('background-color', 'white')
          .style('border', '1px solid #ccc')
          .style('padding', '5px');

        // Convert TopoJSON to GeoJSON
        const counties = topojson.feature(countiesData, countiesData.objects.counties);
        //console.log("Counties Data:" + JSON.stringify(educationData));

        // Add data-education and data-fips attributes to counties
        const educationByFips = {};
        educationData.forEach(d => {
          educationByFips[d.fips] = d;
        });

        // Render counties with education data
        svg.selectAll('path')
          .data(counties.features)
          .enter()
          .append('path')
          .attr('d', d3.geoPath()) // No projection applied
          .attr('class', 'county')
          .attr('data-fips', d => d.id)
          .attr('data-education', d => {
            const education = educationByFips[d.id];
            return education ? education.bachelorsOrHigher : 0;
          })
          .style('fill', d => {
            const education = educationByFips[d.id];
            return education ? colorScale(education.bachelorsOrHigher) : '#ccc';
          })
          .style('stroke', '#fff')
          .style('stroke-width', '0.5px')
          .on('mouseover', function(event, d) {
            const education = educationByFips[d.id];
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html(
              `County: ${education ? education.area_name : 'Unknown'}<br>
              State: ${education ? education.state : 'Unknown'}<br>
              % with Bachelor's or Higher: ${education ? education.bachelorsOrHigher : 'N/A'}`
            )
            .attr('data-education', education ? education.bachelorsOrHigher : 0)
            .style('left', (event.pageX + 5) + 'px')
            .style('top', (event.pageY - 28) + 'px');
            d3.select(this).style('fill', 'orange');
          })
          .on('mouseout', function() {
            tooltip.transition().duration(300).style('opacity', 0);
            d3.select(this).style('fill', d => {
              const education = educationByFips[d.id];
              return education ? colorScale(education.bachelorsOrHigher) : '#ccc';
            });
          });

          
        // Add legend
        const legend = svg.append('g')
          .attr('id', 'legend')
          .attr('transform', `translate(${legendPadding},${legendHeight})`);

        const legendScale = d3.scaleLinear()
          .domain([0, 100]) // Adjust based on your education data range
          .range([0, legendWidth]);

        const legendAxis = d3.axisBottom()
          .scale(legendScale)
          .ticks(8)
          .tickSize(10)
          .tickFormat(d => `${d}%`);

        legend.selectAll('rect')
          .data(colorScale.range().map(d => colorScale.invertExtent(d)))
          .enter()
          .append('rect')
          .attr('x', d => legendScale(d[0]))
          .attr('y', 0)
          .attr('width', d => legendScale(d[1]) - legendScale(d[0]))
          .attr('height', legendHeight)
          .style('fill', d => colorScale(d[0]));

        legend.append('g')
          .attr('transform', `translate(0,${legendHeight})`)
          .call(legendAxis);

      })
      .catch(e => console.log('Error loading data:', e));
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div id="title">United States Educational Attainment</div>
        <div id="description">Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</div>
        <div className="visHolder"></div>
      </div>
    </div>
  );
};

export default App;
