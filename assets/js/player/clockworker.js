var timerID=null;
var interval=100;

self.onmessage=function(e){
	// If the "start" message is received, start a repeating timeout for the appropriate interval
	if (e.data=="start") {
		console.log("worker received start message");
		timerID=setInterval(function(){postMessage("tick");},interval)
	}
	else if (e.data.interval) {
		interval=e.data.interval;
		console.log(`worker received set interval message with interval=${interval}`);
		if (timerID) {
			clearInterval(timerID);
			timerID=setInterval(function(){postMessage("tick");},interval)
		}
	}
	else if (e.data=="stop") {
		console.log("stopping");
		clearInterval(timerID);
		timerID=null;
	}
};

postMessage('hi there');