import React from "react";
import ReactDOM from "react-dom";

// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.

// import "../css/app.scss"
const _css = require("../css/app.scss");

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
// import {Socket} from "phoenix"
import "./socket.js"

import "phoenix_html"

import "./player/noteplayer.ts"

import "./midi.ts"

// import LandingPage from "./components/landingPage.tsx";
// const greeting = document.getElementById("content-container");
// ReactDOM.render(<LandingPage name="Phoenix" />, greeting);