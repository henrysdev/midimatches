const _css = require("../css/app.scss");

import 'phoenix_html';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PageRouter from './PageRouter';
import "./socket";

// This code starts up the React app when it runs in a browser. It sets up the routing
// configuration and injects the app into a DOM element.
ReactDOM.render(<PageRouter />, document.getElementById('react-app'));
