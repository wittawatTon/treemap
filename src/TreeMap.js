import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './TreeMap.css';

const TreeMap = ({ dataUrl }) => {
  const treeMapRef = useRef();

  useEffect(() => {
    d3.json(dataUrl).then(data => {
      // Clear previous SVG elements
      d3.select(treeMapRef.current).selectAll('*').remove();

      const width = 960;
      const height = 600;
      const legendWidth = width *0.6; // Set legend width to 50% of SVG width

      const svg = d3.select(treeMapRef.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height + 400);

      const root = d3.hierarchy(data)
        .eachBefore(d => {
          d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
        })
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

      d3.treemap()
        .size([width, height])
        .paddingInner(1)
        (root);

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      const cell = svg.selectAll('g')
        .data(root.leaves())
        .enter().append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

      cell.append('rect')
        .attr('class', 'tile')
        .attr('id', d => d.data.id)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .attr('fill', d => color(d.data.category))
        .on('mouseover', (event, d) => {
          const tooltip = d3.select('#tooltip');
          tooltip.transition().duration(200).style('opacity', 0.9);
          tooltip.html(`Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`)
            .attr('data-value', d.data.value)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
          d3.select('#tooltip').transition().duration(500).style('opacity', 0)
        });

      cell.append('text')
        .attr('class', 'tile-text')
        .selectAll('tspan')
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter().append('tspan')
        .attr('x', 3)
        .attr('y', (d, i) => 13 + i * 10)
        .text(d => d);

  

      const legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${width / 4}, ${height + 50})`); // Center legend horizontally

      const categories = Array.from(new Set(root.leaves().map(d => d.data.category)));
      const legendColor = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(categories);

      const legendItemSize = 20;
      const columnWidth = legendWidth / 3; // Divide legend width by number of columns

      legend.selectAll('rect')
        .data(categories)
        .enter().append('rect')
        .attr('class', 'legend-item')
        .attr('x', (d, i) => (i % 3) * columnWidth) // Position items in columns
        .attr('y', (d, i) => Math.floor(i / 3) * (legendItemSize + 10)) // Spacing between rows
        .attr('width', legendItemSize)
        .attr('height', legendItemSize)
        .attr('fill', d => legendColor(d));

      legend.selectAll('text')
        .data(categories)
        .enter().append('text')
        .attr('x', (d, i) => (i % 3) * columnWidth + legendItemSize * 1.2) 
        .attr('y', (d, i) => Math.floor(i / 3) * (legendItemSize + 10)+legendItemSize-4)
        .attr('text-anchor', 'left')
        .text(d => d);

    }).catch(err => console.error('Error loading data: ', err));
  }, [dataUrl]);

  return <div ref={treeMapRef}></div>;
};

export default TreeMap;
