import React, { useState } from 'react';
import TreeMap from './TreeMap.js';
import './App.css';

function App() {
  const [dataUrl, setDataUrl] = useState('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json');
  const [title, setTitle] = useState('Movie Sales');
  const [description, setDescription] = useState('Top 100 Highest Grossing Movies Grouped By Genre');

  const handleLinkClick = (url, title, description) => {
    setDataUrl(url);
    setTitle(title);
    setDescription(description);
  };

  return (
    <div className="App">
      <nav className="navbar">
        <ul>
          <li><button onClick={() => handleLinkClick('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json', 'Kickstarter Pledges', 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category')}>Kickstarter Pledges</button></li>
          <li><button onClick={() => handleLinkClick('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json', 'Movie Sales', 'Top 100 Highest Grossing Movies Grouped By Genre')}>Movie Sales</button></li>
          <li><button onClick={() => handleLinkClick('https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json', 'Video Game Sales', 'Top 100 Most Sold Video Games Grouped by Platform')}>Video Game Sales</button></li>
        </ul>
      </nav>
      <div id="title">{title}</div>
      <div id="description">{description}</div>
      <TreeMap dataUrl={dataUrl} />
      <div id="tooltip" style={{ position: 'absolute', opacity: 0 }}></div>
    </div>
  );
}

export default App;
