const _css = require("../css/app.scss");

import "phoenix_html";

import * as React from "react";
import * as ReactDOM from "react-dom";
import Main from "./Main";
import "./socket";

// This code starts up the React app when it runs in a browser. It sets up the routing
// configuration and injects the app into a DOM element.
!!document.getElementById("react-app")
  ? ReactDOM.render(<Main />, document.getElementById("react-app"))
  : null;
