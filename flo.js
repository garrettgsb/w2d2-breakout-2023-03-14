// The 'node-fetch' library requires us to use this `import` syntax.
// To make that work, you need to have "type": "module" in the package.json
import fetch from 'node-fetch';
import fs from 'fs';

function getStationState() {
  /*
  We got this fetch request by:
    * Going to https://www.flo.com/flo-network/
    * Finding the pin on the map for the free chargers near my house
    * Opening the network tab in the browser devtools
    * Watching to see which network request fires when I click the pin
      - It was the one to https://account.flo.ca/api/network/stations
    * Right-clicking on it in the network tab, then Copy Value > Copy as Fetch
    * Pasting it into this file and deleting most of it (lots of headers and options that we turn out not to need)
  */
  fetch("https://account.flo.ca/api/network/stations", {
      "headers": { "Content-Type": "application/json; charset=utf-8", },
      "body": "[\"d50429e3-faa9-4c78-9899-53b0c2da00dd\",\"056d74f1-f248-439b-8b00-396ac8f3f526\"]",
      "method": "POST",
  })
    // Fetch uses Promises-- You didn't learn those yet, but it's still just callbacks :)
    .then(res => res.json())
    .then((data) => {
      /*
      This function is where all the good stuff happens... That is, all of the application stuff
      that depends on the data from the web request. We only do one thing in here, but it's
      a good idea to pull that behavior out into its own function(s) so that this callback
      doesn't get cluttered. It's really easy for it to get cluttered.
      */
      logPortState(data);
    });
}

function logPortState(data) {
  const ports = data.ports;
  const portStates = Object.values(ports).map(port => port.State);
  fs.readFile('./log', { encoding: 'utf-8' }, (err, data) => {
    const newLog = data + '\n' + `${portStates.join(' ')} ${new Date()}`;
    fs.writeFile('./log', newLog, () => { console.log('Tick') });
  });
}


// Run every 5 seconds
// That's probably too frequent for real life-- In my real implementation, I did it every 5 minutes
// Not alot of people charge their car for less than 5 minutes
setInterval(() => { getStationState() }, 5000);
