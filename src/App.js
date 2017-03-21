// MIT License

// Copyright (c) 2017 Elson Chin

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import React, { Component } from 'react';
import './App.css';
import { Dropdown, moveIcon, weaponIcon, parseSkills, 
         getUnitsWithSkill, getPossibleSkills, calcStats, escapeRegExp } from './helper.js';

const units = require('./data/units.json');
const weapons = require('./data/weapons.json');
const assists = require('./data/assists.json');
const specials = require('./data/specials.json');
const passives = require('./data/passives.json');

class SkillInfoRow extends Component {
  constructor(props) {
    super(props);
    this.handleSkillSelect = this.handleSkillSelect.bind(this);
  }

  handleSkillSelect(skillName) {
    this.props.onSkillSelect(skillName, this.props.skillType);
  }

  render() {
    return (
      <tr>
        <td className="skill-type">{this.props.category}</td>
        <td className="skill-name">
          <Dropdown id='skillName'
                    options={this.props.options}
                    value={this.props.skillName}
                    onChange={this.handleSkillSelect} />
        </td>
        <td className="skill-effect">{this.props.effect}</td>
        <td className="skill-inherit">{this.props.inheritList}</td>
      </tr>
    );
  }
}

class SkillInfoTable extends Component {
  constructor(props) {
    super(props);
    this.handleSkillSelect = this.handleSkillSelect.bind(this);
  }

  handleSkillSelect(skillName, skillType) {
    this.props.onSkillSelect(skillName, skillType);
  }

  unitListToString(unitList) {
    var result = '';

    if (unitList[1])
      result += '1*: ' + unitList[1].join(', ') + '. ';
    if (unitList[2])
      result += '2*: ' + unitList[2].join(', ') + '. ';
    if (unitList[3])
      result += '3*: ' + unitList[3].join(', ') + '. ';
    if (unitList[4])
      result += '4*: ' + unitList[4].join(', ') + '. ';
    if (unitList[5])
      result += '5*: ' + unitList[5].join(', ') + '.';

    return result;
  }

  getInheritList(unitName, skill, type) {
    if (!skill) return '';
    
    var list = getUnitsWithSkill(skill, type);
    var exclude = [];

    for (var rarity in list) {
      for (var i in list[rarity]) {
        if (/Alfonse|Anna|Sharena/.test(list[rarity][i]))
          exclude.push(i);
        if (RegExp(escapeRegExp(unitName)).test(list[rarity][i]))
          return '';
      }

      for (i in exclude) {
        list[rarity].splice(exclude[i], 1);
        if (!list[rarity].length)
          delete list[rarity];
      }
    }
    
    return this.unitListToString(list);
  }

  render() {
    var skills = {};
    skills.weapon = this.props.skills.weapon;
    skills.assist = this.props.skills.assist;
    skills.special = this.props.skills.special;
    skills.passiveA = this.props.skills.passiveA;
    skills.passiveB = this.props.skills.passiveB;
    skills.passiveC = this.props.skills.passiveC;

    var skillOptions = getPossibleSkills(this.props.unitName);
    
    return (
      <table>
        <thead>
          <tr className="skill-header">
            <th className="blank-cell" />
            <th>Skill</th>
            <th>Effect</th>
            <th>Inherited From</th>
          </tr>
        </thead>
        <tbody>
          <SkillInfoRow category='Weapon' 
                        skillName={skills.weapon}
                        skillType='weapon'
                        options={skillOptions.weapons}
                        effect={weapons[skills.weapon] ? 'Might: ' + weapons[skills.weapon].might + '. ' + weapons[skills.weapon].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.weapon,'weapon')}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='Assist' 
                        skillName={skills.assist}
                        skillType='assist'
                        options={skillOptions.assists}
                        effect={assists[skills.assist] ? assists[skills.assist].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.assist,'assist')}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='Special' 
                        skillName={skills.special}
                        skillType='special'
                        options={skillOptions.specials}
                        effect={specials[skills.special] ? 'Charge: ' + specials[skills.special].count + '. ' + specials[skills.special].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.special,'special')}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='A' 
                        skillName={skills.passiveA} 
                        skillType='passiveA'
                        options={skillOptions.passivesA}
                        effect={passives.A[skills.passiveA] ? passives.A[skills.passiveA].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.passiveA,'passiveA')}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='B' 
                        skillName={skills.passiveB} 
                        skillType='passiveB'
                        options={skillOptions.passivesB}
                        effect={passives.B[skills.passiveB] ? passives.B[skills.passiveB].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.passiveB,'passiveB')}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='C' 
                        skillName={skills.passiveC} 
                        skillType='passiveC'
                        options={skillOptions.passivesC}
                        effect={passives.C[skills.passiveC] ? passives.C[skills.passiveC].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.passiveC,'passiveC')}
                        onSkillSelect={this.handleSkillSelect} />
        </tbody>
      </table>
    )
  }
}

class UnitInfo extends Component {
  constructor(props) {
    super(props);
    this.handleUnitSelect = this.handleUnitSelect.bind(this);
    this.handleRawStatsToggle = this.handleRawStatsToggle.bind(this);
  }

  handleUnitSelect(unitName) {
    this.props.onUnitSelect(unitName);
  }

  handleRawStatsToggle(e) {
    this.props.onRawStatsToggle(e.target.checked);
  }

  render() {
    var name = this.props.unitName;
    var color = units[name].color;
    var wpnType = units[name].wpnType;
    var movType = units[name].movType;
    var fullWpnType = color + ' ' + wpnType;
    
    return (
      <table>
        <thead>
          <tr>
            <th className="unit-name">Name</th>
            <th className="unit-type" colSpan="2">Type</th>
            <th className="unit-stat">HP</th>
            <th className="unit-stat">ATK</th>
            <th className="unit-stat">SPD</th>
            <th className="unit-stat">DEF</th>
            <th className="unit-stat">RES</th>
            <th className="unit-BST">Total</th>
            <th className="unit-toggle">Raw</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Dropdown id='unitName'
                        options={Object.keys(units)}
                        value={this.props.unitName}
                        onChange={this.handleUnitSelect} />
            </td>
            <td className="unit-type-sub"><img src={weaponIcon[color][wpnType]} title={fullWpnType} alt={fullWpnType} /></td>
            <td className="unit-type-sub"><img src={moveIcon[movType]} title={movType} alt={movType} /></td>
            <td>{this.props.stats.HP}</td>
            <td>{this.props.stats.Atk}</td>
            <td>{this.props.stats.Spd}</td>
            <td>{this.props.stats.Def}</td>
            <td>{this.props.stats.Res}</td>
            <td>{Object.values(this.props.stats).reduce((a,b) => { return a + b; })}</td>
            <td><input type="checkbox" checked={this.props.rawStatsOn} onChange={this.handleRawStatsToggle} /></td>
          </tr>
        </tbody>
      </table>
    )
  }
}

class InheritanceTool extends Component {
  constructor(props) {
    super(props);
    
    this.initState('Abel');

    this.handleUnitSelect = this.handleUnitSelect.bind(this);
    this.handleSkillSelect = this.handleSkillSelect.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleRawStatsToggle = this.handleRawStatsToggle.bind(this);
  }

  initState(initUnit) {
    var initSkills = {
        weapon: units[initUnit].skills.weapon[units[initUnit].skills.weapon.length-1].name,
        assist: units[initUnit].skills.assist[units[initUnit].skills.assist.length-1].name,
        special: units[initUnit].skills.special[units[initUnit].skills.special.length-1].name,
        passiveA: units[initUnit].skills.passiveA[units[initUnit].skills.passiveA.length-1].name,
        passiveB: units[initUnit].skills.passiveB[units[initUnit].skills.passiveB.length-1].name,
        passiveC: units[initUnit].skills.passiveC[units[initUnit].skills.passiveC.length-1].name
      }
    var initStats = calcStats(initUnit, initSkills);

    this.state = {
      unitName: initUnit,
      stats: initStats,
      skills: initSkills,
      rawStatsOn: false
    }
  }

  handleUnitSelect(unitName) {
    var newSkills = parseSkills(JSON.parse(JSON.stringify(units[unitName].skills)));
    var stats = JSON.parse(JSON.stringify(units[unitName].stats));

    if (!this.state.rawStatsOn)
      stats = calcStats(unitName, newSkills);

    this.setState({
      unitName: unitName,
      stats: stats,
      skills: newSkills,
    });
  }

  handleSkillSelect(skillName, skillType) {
    var newSkills = JSON.parse(JSON.stringify(this.state.skills));
    switch(skillType) {
      case 'weapon':
        newSkills.weapon = skillName;
        break;
      case 'assist':
        newSkills.assist = skillName;
        break;
      case 'special':
        newSkills.special = skillName;
        break;
      case 'passiveA':
        newSkills.passiveA = skillName;
        break;
      case 'passiveB':
        newSkills.passiveB = skillName;
        break;
      case 'passiveC':
        newSkills.passiveC = skillName;
        break;
      default:
        break;
    }
    this.setState({ 
      stats: this.state.rawStatsOn ? JSON.parse(JSON.stringify(units[this.state.unitName].stats)) : calcStats(this.state.unitName, newSkills),
      skills: newSkills 
    });
  }

  handleResetClick() {
    var skills = parseSkills(JSON.parse(JSON.stringify(units[this.state.unitName].skills)));
    this.setState({
      stats: this.state.rawStatsOn ? JSON.parse(JSON.stringify(units[this.state.unitName].stats)) : calcStats(this.state.unitName, skills),
      skills: skills
    })
  }

  handleRawStatsToggle(isOn) {
    if (isOn) {
      this.setState({
        rawStatsOn: true,
        stats: JSON.parse(JSON.stringify(units[this.state.unitName].stats))
      });
    } else {
      this.setState({
        rawStatsOn: false,
        stats: calcStats(this.state.unitName, this.state.skills)
      });
    }
  }

  render() {
    return (
      <div className="tool">
        <div className="char-info">
          <UnitInfo unitName={this.state.unitName}
                    stats={this.state.stats}
                    rawStatsOn={this.state.rawStatsOn}
                    onUnitSelect={this.handleUnitSelect}
                    onRawStatsToggle={this.handleRawStatsToggle} />
        </div>
        <div className="skill-info">
          <SkillInfoTable unitName={this.state.unitName}
                          skills={this.state.skills}
                          onSkillSelect={this.handleSkillSelect} />
        </div>
        <div>
          <button className="reset-button" onClick={this.handleResetClick}>Reset Skills</button>
        </div>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>
            Fire Emblem: Heroes
            <br />
            <span className="sub-header">Skill Inheritance Tool</span>
          </h1>
        </div>
        <InheritanceTool />
        <div id="footer">
          <p id="footer-content">
            <i>Fire Emblem: Heroes</i> and all respective content are the 
            sole property of Nintendo and Intelligent Systems.
          </p>
        </div>
      </div>
    );
  }
}

export default App;
