import { Socket } from "phoenix";

// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

let socket = new Socket("/socket", { params: { token: window.userToken } });
socket.connect();
