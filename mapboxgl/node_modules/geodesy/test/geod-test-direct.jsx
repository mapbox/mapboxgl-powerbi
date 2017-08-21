// usage: eg time node geod-test-direct.js vincenty

const method = process.argv[2];
if (method!='vincenty' && method!='karney') { console.log('Specify vincenty/karney'); process.exit(); }
const readline = require('readline');
const fs = require('fs');
const LatLon = require('../latlon-'+method+'.js');

// TODO: max/min distance variance as absolute & as %ge
// TODO: max/min angular variance
// TODO: direct

// inverse takes c. 20μs; 50,000/sec

let l = 0;
const variances = [];
const fails = [];
const start = process.argv[3] ? Number(process.argv[3]) : Math.floor(Math.random()*5);
console.log('checking every 5th from '+start);
const π = Math.PI;

const lineReader = readline.createInterface({
    input: fs.createReadStream('geographiclib-test-data/GeodTest.dat')
});

lineReader.on('line', function (line) {
    if (l++%5 != start) return; // too much test data: take every 4th from given start
    //if (l > 100) return;
    const test = {};
    [ test.lat1, test.lon1, test.brng1, test.lat2, test.lon2, test.brng2, test.dist ] = line.split(' ');
    const p1 = new LatLon(test.lat1, test.lon1);
    const p2 = p1.destinationPoint(test.dist, test.brng1);
    const Δφ = (p2.lat-test.lat2)*π/360;
    const Δλ = (p2.lon-test.lon2)*π/360;
    const cosφ = Math.cos(p2.lat*π/360);
    if (Math.hypot(Δφ, Δλ/cosφ)*6371e3 > 2) {
        console.log(test)
        console.log('dest', `(${p2.lat},${p2.lon})`, 'Δlat', (p2.lat-test.lat2)*π/360*6371e3, 'Δlon', (p2.lon-test.lon2)/Math.cos(p2.lat*π/360)*π/360*6371e3)
    }
    variances.push(Math.hypot(Δφ, Δλ/cosφ)*6371e3);
});

lineReader.on('close', () => {
    console.log('total', variances.length+fails.length);

    const avgVariance = variances.reduce( (prev, curr) => prev + curr ) / variances.length;
    const maxVariance = Math.max.apply(null, variances);
    console.log('good', variances.length);
    console.log(`avg ${(avgVariance*1000).toFixed(6)}mm`);
    console.log(`max ${(maxVariance*1000).toFixed(6)}mm`);
});
