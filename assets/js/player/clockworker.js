let timerID;
let interval;

self.onmessage=function(e) {
	// If the "start" message is received, start a repeating timeout for the appropriate interval
	if (e.data=="start") {
		console.log("worker received start message");
		timerID=setInterval(function(){postMessage("tick");},interval)
	}
	else if (e.data.interval) {
		interval=e.data.interval;
    console.log(`worker received set interval message with interval=${interval}`);
    console.log('timerID: ', timerID);
		if (timerID) {
			clearInterval(timerID);
			timerID=setInterval(function(){postMessage("tick");},interval)
		}
	}
};
