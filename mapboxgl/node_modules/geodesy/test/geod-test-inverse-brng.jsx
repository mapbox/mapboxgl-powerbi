// usage: eg time node geod-test-inverse-brng.js vincenty

const method = process.argv[2];
if (method!='vincenty' && method!='karney') { console.log('Specify vincenty/karney'); process.exit(); }
const readline = require('readline');
const fs = require('fs');
const LatLon = require('../latlon-'+method+'.js');

// inverse takes c. 20μs; 50,000/sec (on Core i5)

let l = 0;
const variances = [];
const fails = [];
const start = process.argv[3] ? Number(process.argv[3]) : Math.floor(Math.random()*4);
console.log('checking every 4th from '+start);

const lineReader = readline.createInterface({
    input: fs.createReadStream('geographiclib-test-data/GeodTest.dat')
});

lineReader.on('line', function (line) {
    //if (++l > 1000000) return;
    if (++l%4 != start) return; // too much test data: take every 4th from given start
    const test = {};
    [ test.lat1, test.lon1, test.brng1, test.lat2, test.lon2, test.brng2, test.dist ] = line.split(' ');
    const p1 = new LatLon(test.lat1, test.lon1);
    const p2 = new LatLon(test.lat2, test.lon2);
    const brng = p1.initialBearingTo(p2);
    if (isNaN(brng)) {
        fails.push(test);
    } else {
        variances.push(Math.abs(brng - test.brng1))
    }
});

lineReader.on('close', () => {
    console.log('total', variances.length+fails.length);

    const avgVariance = variances.reduce( (prev, curr) => prev + curr ) / variances.length;
    const maxVariance = Math.max.apply(null, variances);
    console.log('good', variances.length);
    console.log(`avg ${(avgVariance).toFixed(9)}°`);
    console.log(`max ${(maxVariance).toFixed(9)}°`);
});
