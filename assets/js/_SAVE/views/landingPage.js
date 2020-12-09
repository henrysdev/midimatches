import React from "react";
import ReactDOM from "react-dom";
import LandingPage from "./components/landingPage.tsx";

const greeting = document.getElementById("content-container");
ReactDOM.render(<LandingPage name="Phoenix" />, greeting);
