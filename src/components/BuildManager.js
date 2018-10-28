import React from 'react';
import { Dropdown, jsonp, storageAvailable } from '../utils/utility.js';

const units = require('../data/units.json');

const userBuildLabel = '----- User Builds -----';
const wikiBuildLabel = '----- Wiki Builds -----';

// Asynchronously get recommended builds from the wiki and list them in a Dropdown component
export default class BuildManager extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            unit: null,
            link: null,
            builds: {},
            userBuilds: {},
            current: wikiBuildLabel,
            newBuild: false,
            newBuildName: '',
            storedBuilds: (storageAvailable('localStorage') && localStorage.userBuilds && JSON.parse(localStorage.userBuilds)) || {}
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleNewClick = this.handleNewClick.bind(this);
        this.handleSaveClick = this.handleSaveClick.bind(this);
        this.handleLoadClick = this.handleLoadClick.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleBuildNameChange = this.handleBuildNameChange.bind(this);
    }

    componentDidMount() {
        this.retrieveData(this.props.unitName);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.unitName !== this.props.unitName) {
            this.retrieveData(this.props.unitName);
            this.setState({ 
                unit: this.props.unitName,
                newBuild: false,
                newBuildName: '',
                userBuilds: this.state.storedBuilds[this.props.unitName] ? this.state.storedBuilds[this.props.unitName] : {}
            });
        }
    }

    handleChange(buildName) {
        this.setState({ 
            newBuild: false,
            newBuildName: '',
            current: buildName 
        });
    }

    handleNewClick() {
        if (!this.state.newBuild) {
            this.setState({
                newBuild: true
            });
        }
    }

    handleBuildNameChange(event) {
        let buildName = event.target.value;
        this.setState({ 
            newBuildName: buildName
        });
    }

    handleSaveClick() {
        let builds = this.state.userBuilds;
        let buildName = this.state.newBuild ? this.state.newBuildName : this.state.current;

        builds[buildName] = {
            Boon: this.props.boonBane.boon,
            Bane: this.props.boonBane.bane,
            Weapon: this.props.skills.weapon,
            Upgrade: this.props.skills.upgrade,
            Assist: this.props.skills.assist,
            Special: this.props.skills.special,
            PassiveA: this.props.skills.passiveA,
            PassiveB: this.props.skills.passiveB,
            PassiveC: this.props.skills.passiveC,
            Seal: this.props.skills.seal
        }

        let storedBuilds = this.state.storedBuilds;
        if (storageAvailable('localStorage')) {
            storedBuilds[this.props.unitName] = builds;
            localStorage.userBuilds = JSON.stringify(storedBuilds);
        }

        this.setState({
            newBuild: false,
            userBuilds: builds,
            current: buildName,
            storedBuilds: storedBuilds
        });
    }

    handleLoadClick() {
        if (this.state.current !== wikiBuildLabel && this.state.current !== userBuildLabel) {
            this.props.onLoadClick(this.state.builds[this.state.current] ? this.state.builds[this.state.current] : this.state.userBuilds[this.state.current]);
        }
    }

    handleDeleteClick() {
        if (this.state.newBuild) {
            this.setState({
                newBuild: false
            });
        }
        else if (this.state.userBuilds[this.state.current]) {
            let builds = this.state.userBuilds;
            delete builds[this.state.current];

            let storedBuilds = this.state.storedBuilds;
            if (storageAvailable('localStorage')) {
                storedBuilds[this.props.unitName] = builds;
                localStorage.userBuilds = JSON.stringify(storedBuilds);
            }

            this.setState({
                userBuilds: builds,
                current: userBuildLabel
            });
        }
    }
    
    retrieveData(unitName) {
        jsonp('https://feheroes.gamepedia.com/api.php?action=query&titles=' + unitName.replace(/\s/g, '_') + '/Builds&prop=revisions&rvprop=content&format=json')
        .then(function(data) {
            let responses = [], builds = [],
                match, re = /{{\\?n?(Skillbuild[_ ]Infobox\s?.*?})}/g;
        
            let text = JSON.stringify(data);
            // eslint-disable-next-line
            while (match = re.exec(text)) {
                responses.push(match[1]);
            }
            
            for (var response of responses) {
                var buildName, build = {};
                var hasError = false;
                
                try {
                    buildName = /name\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim();
                }
                catch (e) {
                    console.error('Error retrieving build name.');
                    hasError = true;
                }

                try {
                    if (/ivs/.test(response)) {
                        let bbStr = /ivs\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim();
                        if (!bbStr || /Neutral|Any|Flexible/i.test(bbStr)) {
                            build.Boon = '';
                            build.Bane = '';
                        } else {
                            build.Boon = /\+(HP|Atk|Spd|Def|Res)/i.exec(bbStr)[1];
                            if (build.Bane !== 'HP')
                                build.Boon = build.Boon.slice(0,1) + build.Boon.slice(1).toLowerCase();
                            build.Bane = /-(HP|Atk|Spd|Def|Res)/i.exec(bbStr)[1];
                            if (build.Bane !== 'HP')
                                build.Bane = build.Bane.slice(0,1) + build.Bane.slice(1).toLowerCase();
                        }
                    }
                }
                catch (e) {
                    console.error('Error retrieving boon/bane: ' + buildName);
                    build.Boon = '';
                    build.Bane = '';
                    hasError = true;
                }

                try {
                    build.Weapon = /weapon=/.test(response) ? /weapon\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';
                    build.Assist = /assist=/.test(response) ? /assist\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';
                    build.Special = /special=/.test(response) ? /special\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';
                    build.PassiveA = /passiveA=/.test(response) ? /passiveA\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';
                    build.PassiveB = /passiveB=/.test(response) ? /passiveB\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';
                    build.PassiveC = /passiveC=/.test(response) ? /passiveC\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';
                    build.Seal = /seal=/.test(response) ? /seal\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim() : '';

                    build.Weapon = build.Weapon.replace(/Blar/, 'Blár').replace(/Raudr/, 'Rauðr').replace(/Urdr/, 'Urðr').replace(/ \(\w+\)/, '');

                    if (/^Atk\/(Def|Res) \d/.test(build.PassiveA)) {
                        if (/Def/.test(build.PassiveA)) {
                            build.PassiveA = build.PassiveA.replace('Atk/Def ', 'Attack/Def +');
                        }
                        else if (/Res/.test(build.PassiveA)) {
                            build.PassiveA = build.PassiveA.replace('Atk', 'Attack');
                        }
                    }
                    
                    if (/weaponRefine=/.test(response)) {
                        let upgrade = /weaponRefine\s*?=\s*?(.*?)(?:\\|[|}])/i.exec(response)[1].trim().toLowerCase();
                        switch (upgrade) {
                            case 'skill':
                                build.Upgrade = units[unitName].wpnType === 'Staff' ? 'W' : 'X';
                                break;
                            case 'atk':
                                build.Upgrade = 'A';
                                break;
                            case 'spd':
                                build.Upgrade = 'S';
                                break;
                            case 'def':
                                build.Upgrade = 'D';
                                break;
                            case 'res':
                                build.Upgrade = 'R';
                                break;
                            case 'skill2':
                                build.Upgrade = 'D';
                                break;
                            default:
                                build.Upgrade = '';
                                break;
                        }
                    }

                    for (let i in build) {
                        if (/^\s*flexible\s*$/i.test(build[i]))
                            build[i] = '';
                    }
                }
                catch (e) {
                    console.error('Error retrieving skills: ' + buildName);
                    build = units[unitName].skills;
                    hasError = true;
                }

                if (hasError)
                    buildName += ' !!Error!!';

                if (buildName.length > 0 && buildName !== '-')
                    builds[buildName] = build;
            }
            
            this.setState({
                link: "https://feheroes.gamepedia.com/" + unitName.replace(/\s/g, '_') + "/Builds",
                builds: builds,
                current: builds[this.state.current] ? this.state.current : wikiBuildLabel,
                userBuilds: this.state.storedBuilds[unitName] ? this.state.storedBuilds[unitName] : {}
            });
        }.bind(this));
    }

    render() {
        let buildSelect = null;
        let buildList = [];

        let numWikiBuilds = Object.keys(this.state.builds).length;
        if (numWikiBuilds > 0)
            buildList = buildList.concat([wikiBuildLabel].concat(Object.keys(this.state.builds)));

        let numUserBuilds = Object.keys(this.state.userBuilds).length;
        if (numUserBuilds > 0)
            buildList = buildList.concat([userBuildLabel].concat(Object.keys(this.state.userBuilds)));

        if (numWikiBuilds + numUserBuilds > 0) {
            buildSelect = <Dropdown id="BuildSelectDropdown"
                            options={buildList}
                            value={this.state.current}
                            onChange={this.handleChange} />;
        } else {
            buildSelect = <Dropdown id="BuildSelectDropdown"
                            options={['----- No Builds -----']}
                            value={'----- No Builds -----'} />;
        }

        let canSave = this.state.newBuild || this.state.userBuilds[this.state.current];

        return (
            <div className="build-manager">
                <div className="select">{buildSelect}</div>
                {this.state.newBuild &&
                <div>
                    <input name="buildName" type="text" placeholder="Enter Build Name" onChange={this.handleBuildNameChange} />
                </div>
                }
                <div className="link"><a href={this.state.link} target="_blank" rel="noopener noreferrer">More Info...</a></div>
                <div className="buttons">
                    <button onClick={this.handleNewClick} hidden={this.state.newBuild}>New</button>
                    <button onClick={this.handleDeleteClick} hidden={!canSave}>{this.state.newBuild ? 'Cancel' : 'Delete'}</button>
                    <button onClick={this.handleSaveClick} disabled={!canSave}>Save</button>
                    <button onClick={this.handleLoadClick}>Load</button>
                </div>
            </div>
        )
    }
}