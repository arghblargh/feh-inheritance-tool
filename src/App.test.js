import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { getAllSkills, calcCost } from './helper.js';


xit('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});

it('calculates the correct SP cost of a skill', () => {
  expect(calcCost('Abel', 'Brave Lance+')).toEqual(0);
  expect(calcCost('Chrom', 'Silver Sword+')).toEqual(450);
  expect(calcCost('Abel', 'Aegis')).toEqual(0);
  expect(calcCost('Abel', 'Sacred Cowl')).toEqual(300);
  expect(calcCost('Abel', 'Armored Blow 3')).toEqual(525);
  expect(calcCost('Abel', 'Attack/Def +2')).toEqual(405);
  expect(calcCost('Lilina', 'Attack/Def +2')).toEqual(360);
  expect(calcCost('Lilina', 'HP +5')).toEqual(420);
  expect(calcCost('Lilina', 'Swift Sparrow 2')).toEqual(615);
  expect(calcCost('Frederick', 'Fortify Cavalry')).toEqual(300);
  expect(calcCost('Cherche', 'Fortify Fliers')).toEqual(300);
});