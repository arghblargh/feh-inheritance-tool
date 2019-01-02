import React from 'react';

// Escape RegExp string
export function escapeRegExp(str) {
    // eslint-disable-next-line
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export function jsonp(url) {
    return new Promise(function(resolve, reject) {
        var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());

        var script = document.createElement('script');
        script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
        document.body.appendChild(script);
        
        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(data);
        };
    });
}

export function getJson(url) {
    return fetch(url)
        .then(response => response.json());
}

export function isMobile() {
    return /Mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent);
}

export function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}

// Dropdown list React component
export class Dropdown extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    render() {
        let options = this.props.options.map(function(option) {
            return (
                <option key={option} value={option}>
                    {option}
                </option>
            )
        });
        return (
            <select id={this.props.id} 
                    className={'form-control ' + this.props.addClass}
                    value={this.props.value} 
                    onChange={this.handleChange}>
                {options}
            </select>
        )
    }

    handleChange(e) {
        this.props.onChange(e.target.value);
    }
}

// Text box component
export class TextBox extends React.PureComponent {
    render() {
        return (
            <div id={this.props.id} className="text-box">
                <span className="title">{this.props.title}</span>
                <span className="text">{this.props.text}</span>
            </div>
        )
    }
}

// Hover component
export const Hover = ({ onHover, children }) => (
    <div className="hover">
        <div className="hover__no-hover">{children}</div>
        <div className="hover__hover">{onHover}</div>
    </div>
)