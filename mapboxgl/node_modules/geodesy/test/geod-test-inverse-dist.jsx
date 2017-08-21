// usage: eg time node geod-test-inverse-dist.js vincenty

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

const start = process.argv[3] ? Number(process.argv[3]) : Math.floor(Math.random()*4);
const limit = process.argv[4] ? Number(process.argv[4]) : 999999;

console.log('checking every 4th from '+start+' limit '+limit);

const lineReader = readline.createInterface({
    input: fs.createReadStream('geographiclib-test-data/GeodTest.dat')
});

lineReader.on('line', function (line) {
    l++; // TODO: fix logic
    if (l < start) return;
    if (l >= start + limit*4) return;
    if (l%4 != start%4) return; // too much test data: take every 4th from given start
    const test = {};
    [ test.lat1, test.lon1, test.brng1, test.lat2, test.lon2, test.brng2, test.dist ] = line.split(' ');
    console.log('>>>', l, test.dist)
    const p1 = new LatLon(test.lat1, test.lon1);
    const p2 = new LatLon(test.lat2, test.lon2);
    const d = p1.distanceTo(p2);
    if (isNaN(d)) {
        fails.push(test);
    } else {
        variances.push(Math.abs(d - test.dist));
        console.log('<<<', l, d, Math.abs(d - test.dist))
    }
});

lineReader.on('close', () => {
    console.log('total', variances.length+fails.length);

    const avgVariance = variances.reduce( (prev, curr) => prev + curr ) / variances.length;
    const maxVariance = Math.max.apply(null, variances);
    console.log('good', variances.length);
    console.log(`avg ${(avgVariance*1000).toFixed(6)}mm`);
    console.log(`max ${(maxVariance*1000).toFixed(6)}mm`);

    console.log('fail', fails.length);
    if (fails.length > 0) {
        const worst = fails.reduce( (prev, curr) => curr.dist < prev.dist ? curr : prev );
        console.log(`worst case fail: (${Number(worst.lat1).toFixed(3)}°,${Number(worst.lon1).toFixed(3)}°)`,
            `@ ${Number(worst.brng1).toFixed(3)}° ->`,
            `(${Number(worst.lat2).toFixed(3)}°,${Number(worst.lon2).toFixed(3)}°)`,
            `@ ${Number(worst.brng2).toFixed(3)}°`,
            `= ${Number(Number(worst.dist).toFixed(3)).toLocaleString()}m`,
            `(Δ${Number(worst.lat2-worst.lat1).toFixed(3)}°,Δ${Number(worst.lon2-worst.lon1).toFixed(3)}°)`);
    }
});
