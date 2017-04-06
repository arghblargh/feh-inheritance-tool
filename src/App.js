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
import { Dropdown, //Hover,
         moveIcon, weaponIcon, rarityIcon, skillTypeIcon, unitPortrait,
         parseSkills, getUnitsWithSkill, getPossibleSkills, calcStats, calcCost,
         escapeRegExp } from './helper.js';

const units = require('./data/units.json');
const weapons = require('./data/weapons.json');
const assists = require('./data/assists.json');
const specials = require('./data/specials.json');
const passives = require('./data/passives.json');

class SkillInfoRow extends Component {
  constructor(props) {
    super(props);
    this.handleSkillSelect = this.handleSkillSelect.bind(this);
    this.handlePassiveSkillSelect = this.handlePassiveSkillSelect.bind(this);
    this.handleSkillLevelSelect = this.handleSkillLevelSelect.bind(this);
  }

  handleSkillSelect(skillName) {
    this.props.onSkillSelect(skillName, this.props.skillType);
  }

  handlePassiveSkillSelect(skillName) {
    this.props.onSkillSelect(this.getPassiveLevels(skillName, true) ? this.getPassiveLevels(skillName, true) : skillName, this.props.skillType);
  }

  handleSkillLevelSelect(skillLevel) {
    this.props.onSkillSelect(/[^1-9]*/.exec(this.props.skillName)[0] + skillLevel, this.props.skillType);
  }

  getPassiveLevels(skillName, getFullMaxPassive = false) {
    let type = RegExp(escapeRegExp(skillName)).test(Object.keys(passives.A).toString()) ? 'A' :
               RegExp(escapeRegExp(skillName)).test(Object.keys(passives.B).toString()) ? 'B' : 
                                                                                          'C';
    let result = new Set();
    for (let key in passives[type]) {
      if (RegExp(escapeRegExp(skillName)).test(key)) {
        if (/[1-9]/.test(key))
          result.add(/[1-9]/.exec(key)[0]);
        else
          return null;
      }
    }
    
    if (getFullMaxPassive)
      return skillName + [...result][result.size-1];
    
    return [...result];
  }

  parseSkillEffect(skill, stats) {
    if (skill === 'Chilling Wind') {
      let value = specials[skill].value;
      value = Math.floor(stats[/(.*):/.exec(value)[1]] * parseFloat(/:(.*)/.exec(value)[1]));
      //return this.props.effect.replace(/{.*}/, value)
      let result = /(.*)({.*})(.*)/.exec(this.props.effect).splice(1);
      result[1] = <b className="skill-effect-value" key={skill}>{value}</b>;
      return result;
    }
    return this.props.effect;
  }

  render() {
    let inheritList = this.props.inheritList.split('★');
    for (let i = 0; i < inheritList.length-1; i += 2) {
      let rarity = /[1-5]/.exec(inheritList[i]);
      inheritList.splice(i+1,0,<img className="rarity-icon" src={rarityIcon[rarity]} title={rarity + '★'} alt={rarity + '★'} key={rarity} />);
    }

    let skillDropdown, skillLevel;
    let hasSkillLevel = false;
    if (/[1-9]/.test(this.props.skillName)) {
      hasSkillLevel = true;
      skillDropdown = 
        <td className="skill-name-sub">
          <Dropdown id='skillNameSub'
                    options={this.props.options}
                    value={/[^1-9]*/.exec(this.props.skillName)[0]}
                    onChange={this.handlePassiveSkillSelect} />
        </td>;
      skillLevel =
        <td className="skill-level">
          <Dropdown id='skillLevel'
                    options={this.getPassiveLevels(/[^1-9]*/.exec(this.props.skillName)[0])}
                    value={/[1-9]/.exec(this.props.skillName)[0]}
                    onChange={this.handleSkillLevelSelect} />
        </td>;
    } else {
      skillDropdown = 
        <td className="skill-name" colSpan="2">
          <Dropdown id='skillName'
                    options={this.props.options}
                    value={this.props.skillName}
                    onChange={/passive/.test(this.props.skillType) ? this.handlePassiveSkillSelect : this.handleSkillSelect} />
        </td>;
    }
    
    return (
      <tr>
        <td className="skill-type">
          {
            this.props.category === "Weapon"  ? <img src={skillTypeIcon.Weapon} title="Weapon" alt="Weapon" /> :
            this.props.category === "Assist"  ? <img src={skillTypeIcon.Assist} title="Assist" alt="Assist" /> :
            this.props.category === "Special" ? <img src={skillTypeIcon.Special} title="Special" alt="Special" /> :
                                                this.props.category
          }
        </td>
        {skillDropdown}
        {hasSkillLevel && skillLevel}
        <td className="skill-info-container">
          <div className="skill-effect">{this.props.effect}</div>
        </td>
        <td className="skill-info-container">
          <div className="skill-inherit">{inheritList}</div>
        </td>
        <td className="skill-info-container">
          <div className="skill-cost">{this.props.cost || ''}</div>
        </td>
      </tr>
    );
  }
}

class SkillInfoTable extends Component {
  constructor(props) {
    super(props);
    this.handleSkillSelect = this.handleSkillSelect.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
  }

  handleSkillSelect(skillName, skillType) {
    this.props.onSkillSelect(skillName, skillType);
  }

  handleResetClick() {
    this.props.onResetClick();
  }

  unitListToString(unitList) {
    let result = '';

    if (unitList[1])
      result += '1★: ' + unitList[1].join(', ') + '. ';
    if (unitList[2])
      result += '2★: ' + unitList[2].join(', ') + '. ';
    if (unitList[3])
      result += '3★: ' + unitList[3].join(', ') + '. ';
    if (unitList[4])
      result += '4★: ' + unitList[4].join(', ') + '. ';
    if (unitList[5])
      result += '5★: ' + unitList[5].join(', ') + '.';

    return result;
  }

  getInheritList(unitName, skill, type) {
    if (!skill) return '';
    
    let unitList = getUnitsWithSkill(skill, type);
    let exclude = [];

    for (let rarity in unitList) {
      for (let unit of unitList[rarity]) {
        if (/Alfonse|Anna|Sharena/.test(unit))
          exclude.push(unit);
        if (RegExp(escapeRegExp(unitName)).test(unit))
          return '';
      }
      
      for (let unit of exclude) {
        if (unitList[rarity].includes(unit)) {
          unitList[rarity].splice(unitList[rarity].indexOf(unit), 1);
          if (!unitList[rarity].length)
            delete unitList[rarity];
        }
      }
    }
    
    return this.unitListToString(unitList);
  }

  render() {
    let skills = {};
    skills.weapon = this.props.skills.weapon;
    skills.assist = this.props.skills.assist;
    skills.special = this.props.skills.special;
    skills.passiveA = this.props.skills.passiveA;
    skills.passiveB = this.props.skills.passiveB;
    skills.passiveC = this.props.skills.passiveC;

    let skillOptions = getPossibleSkills(this.props.unitName);

    let skillCosts = [calcCost(this.props.unitName, skills.weapon),
                      calcCost(this.props.unitName, skills.assist),
                      calcCost(this.props.unitName, skills.special),
                      calcCost(this.props.unitName, skills.passiveA),
                      calcCost(this.props.unitName, skills.passiveB),
                      calcCost(this.props.unitName, skills.passiveC)];
    // console.clear();
    // Temp while I find a place to put it. Logs total SP cost to console.
    console.info('Total SP Cost: ' + skillCosts.reduce((a,b) => { return b ? a + b : a; }));
    
    return (
      <table>
        <thead>
          <tr className="skill-header">
            <td className="reset-button-cell">
              <button className="reset-button" onClick={this.handleResetClick}>Reset</button>
            </td>
            <th colSpan="2">Skill</th>
            <th>Effect</th>
            <th>Inherited From</th>
            <th>SP</th>
          </tr>
        </thead>
        <tbody>
          <SkillInfoRow category='Weapon' 
                        skillName={skills.weapon}
                        skillType='weapon'
                        options={skillOptions.weapons}
                        effect={weapons[skills.weapon] ? 'Might: ' + weapons[skills.weapon].might + '. ' + weapons[skills.weapon].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.weapon,'weapon')}
                        cost={skillCosts[0]}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='Assist' 
                        skillName={skills.assist}
                        skillType='assist'
                        options={skillOptions.assists}
                        effect={assists[skills.assist] ? assists[skills.assist].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.assist,'assist')}
                        cost={skillCosts[1]}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='Special' 
                        skillName={skills.special}
                        skillType='special'
                        options={skillOptions.specials}
                        effect={specials[skills.special] ? 'Charge: ' + specials[skills.special].count + '. ' + specials[skills.special].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.special,'special')}
                        cost={skillCosts[2]}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='A' 
                        skillName={skills.passiveA} 
                        skillType='passiveA'
                        options={skillOptions.passivesA}
                        effect={passives.A[skills.passiveA] ? passives.A[skills.passiveA].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.passiveA,'passiveA')}
                        cost={skillCosts[3]}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='B' 
                        skillName={skills.passiveB} 
                        skillType='passiveB'
                        options={skillOptions.passivesB}
                        effect={passives.B[skills.passiveB] ? passives.B[skills.passiveB].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.passiveB,'passiveB')}
                        cost={skillCosts[4]}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='C' 
                        skillName={skills.passiveC} 
                        skillType='passiveC'
                        options={skillOptions.passivesC}
                        effect={passives.C[skills.passiveC] ? passives.C[skills.passiveC].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.passiveC,'passiveC')}
                        cost={skillCosts[5]}
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
    this.handleBoonSelect = this.handleBoonSelect.bind(this);
    this.handleBaneSelect = this.handleBaneSelect.bind(this);
    this.handleRawStatsToggle = this.handleRawStatsToggle.bind(this);
  }

  handleUnitSelect(unitName) {
    this.props.onUnitSelect(unitName);
  }

  handleBoonSelect(boon) {
    this.props.onBoonBaneSelect("boon", boon ? boon.slice(1) : "");
  }

  handleBaneSelect(bane) {
    this.props.onBoonBaneSelect("bane", bane ? bane.slice(1) : "");
  }

  handleRawStatsToggle(e) {
    this.props.onRawStatsToggle(e.target.checked);
  }

  render() {
    let name = this.props.unitName;
    let color = units[name].color;
    let wpnType = units[name].wpnType;
    let movType = units[name].movType;
    let fullWpnType = color + ' ' + wpnType;
    let bOptions = ["", "HP", "ATK", "SPD", "DEF", "RES"];
    
    return (
      <table>
        <tbody>
          <tr>
            <td rowSpan="2"><img id="unitPortrait" src={unitPortrait[this.props.unitName]} title={this.props.unitName} alt={this.props.unitName} /></td>
            <th className="unit-name">Name</th>
            <th className="unit-type" colSpan="2">Type</th>
            <th className="unit-bb">Boon</th>
            <th className="unit-bb">Bane</th>
            <th className="unit-stat">HP</th>
            <th className="unit-stat">ATK</th>
            <th className="unit-stat">SPD</th>
            <th className="unit-stat">DEF</th>
            <th className="unit-stat">RES</th>
            <th className="unit-BST">Total</th>
            <th className="unit-toggle">Raw</th>
          </tr>
          <tr>
            <td>
              <Dropdown id='unitName'
                        options={Object.keys(units)}
                        value={this.props.unitName}
                        onChange={this.handleUnitSelect} />
            </td>
            <td className="unit-type-sub"><img src={weaponIcon[color][wpnType]} title={fullWpnType} alt={fullWpnType} /></td>
            <td className="unit-type-sub"><img src={moveIcon[movType]} title={movType} alt={movType} /></td>
            <td>
              <Dropdown id='unitBB'
                        options={bOptions.map(option => { return option ? '+' + option : ""; })}
                        value={'+' + this.props.boonBane.boon.toUpperCase()}
                        onChange={this.handleBoonSelect} />
            </td>
            <td>
              <Dropdown id='unitBB'
                        options={bOptions.map(option => { return option ? '-' + option : ""; })}
                        value={'-' + this.props.boonBane.bane.toUpperCase()}
                        onChange={this.handleBaneSelect} />
            </td>
            <td className={this.props.boonBane.boon === "HP" ? "boon" : this.props.boonBane.bane === "HP" ? "bane" : ""}>{this.props.stats.HP}</td>
            <td className={this.props.boonBane.boon === "Atk" ? "boon" : this.props.boonBane.bane === "Atk" ? "bane" : ""}>{this.props.stats.Atk}</td>
            <td className={this.props.boonBane.boon === "Spd" ? "boon" : this.props.boonBane.bane === "Spd" ? "bane" : ""}>{this.props.stats.Spd}</td>
            <td className={this.props.boonBane.boon === "Def" ? "boon" : this.props.boonBane.bane === "Def" ? "bane" : ""}>{this.props.stats.Def}</td>
            <td className={this.props.boonBane.boon === "Res" ? "boon" : this.props.boonBane.bane === "Res" ? "bane" : ""}>{this.props.stats.Res}</td>
            <td>
              {Object.keys(this.props.stats).reduce((a,b) => {
                if (Number.isInteger(a))
                  return a + this.props.stats[b];
                return this.props.stats[a] + this.props.stats[b];
              })}
            </td>
            <td>
              <div className="css-checkbox">
                <input type="checkbox" id="rawStatToggle" checked={this.props.rawStatsOn} onChange={this.handleRawStatsToggle} />
                <label htmlFor="rawStatToggle"></label>
              </div>
            </td>
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
    this.handleBoonBaneSelect = this.handleBoonBaneSelect.bind(this);
    this.handleSkillSelect = this.handleSkillSelect.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleRawStatsToggle = this.handleRawStatsToggle.bind(this);
  }

  initState(initUnit) {
    let initSkills = {
        weapon: units[initUnit].skills.weapon[units[initUnit].skills.weapon.length-1].name,
        assist: units[initUnit].skills.assist[units[initUnit].skills.assist.length-1].name,
        special: units[initUnit].skills.special[units[initUnit].skills.special.length-1].name,
        passiveA: units[initUnit].skills.passiveA[units[initUnit].skills.passiveA.length-1].name,
        passiveB: units[initUnit].skills.passiveB[units[initUnit].skills.passiveB.length-1].name,
        passiveC: units[initUnit].skills.passiveC[units[initUnit].skills.passiveC.length-1].name
      };
    let initBoonBane = {"boon":"","bane":""};
    let initStats = calcStats(initUnit, initSkills, initBoonBane);

    this.state = {
      unitName: initUnit,
      boonBane: initBoonBane,
      stats: initStats,
      skills: initSkills,
      rawStatsOn: false
    }
  }

  handleUnitSelect(unitName) {
    let newSkills = parseSkills(JSON.parse(JSON.stringify(units[unitName].skills)));

    this.setState({
      unitName: unitName,
      boonBane: {"boon":"","bane":""},
      stats: this.state.rawStatsOn ? JSON.parse(JSON.stringify(units[unitName].stats)) : calcStats(unitName, newSkills, {"boon":"","bane":""}),
      skills: newSkills,
    });
  }

  handleBoonBaneSelect(boonOrBane, value) {
    let newBoonBane = this.state.boonBane;
    newBoonBane[boonOrBane] = value.slice(0,1) + (value.length > 2 ? value.slice(1).toLowerCase() : value.slice(1));

    let other = boonOrBane === 'boon' ? 'bane' : 'boon';
    if (newBoonBane[other] === newBoonBane[boonOrBane])
      newBoonBane[other] = '';

    this.setState({
      boonBane: newBoonBane,
      stats: this.state.rawStatsOn ? calcStats(this.state.unitName, null, this.state.boonBane) : calcStats(this.state.unitName, this.state.skills, this.state.boonBane),
    });
  }

  handleSkillSelect(skillName, skillType) {
    let newSkills = JSON.parse(JSON.stringify(this.state.skills));
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
      stats: this.state.rawStatsOn ? calcStats(this.state.unitName, null, this.state.boonBane) : calcStats(this.state.unitName, newSkills, this.state.boonBane),
      skills: newSkills 
    });
  }

  handleResetClick() {
    let skills = parseSkills(JSON.parse(JSON.stringify(units[this.state.unitName].skills)));
    this.setState({
      stats: this.state.rawStatsOn ? calcStats(this.state.unitName, null, this.state.boonBane) : calcStats(this.state.unitName, skills, this.state.boonBane),
      skills: skills
    })
  }

  handleRawStatsToggle(isOn) {
    if (isOn) {
      this.setState({
        rawStatsOn: true,
        stats: calcStats(this.state.unitName, null, this.state.boonBane)
      });
    } else {
      this.setState({
        rawStatsOn: false,
        stats: calcStats(this.state.unitName, this.state.skills, this.state.boonBane)
      });
    }
  }

  render() {
    return (
      <div className="tool">
        <div className="char-info">
          <UnitInfo unitName={this.state.unitName}
                    boonBane={this.state.boonBane}
                    stats={this.state.stats}
                    rawStatsOn={this.state.rawStatsOn}
                    onUnitSelect={this.handleUnitSelect}
                    onBoonBaneSelect={this.handleBoonBaneSelect}
                    onRawStatsToggle={this.handleRawStatsToggle} />
        </div>
        <div className="skill-info">
          <SkillInfoTable unitName={this.state.unitName}
                          stats={this.state.stats}
                          skills={this.state.skills}
                          onSkillSelect={this.handleSkillSelect}
                          onResetClick={this.handleResetClick} />
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
