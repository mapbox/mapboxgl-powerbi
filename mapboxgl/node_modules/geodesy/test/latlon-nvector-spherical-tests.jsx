/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - latlon-nvector-spherical                   (c) Chris Veness 2014-2015  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

var chai    = require('chai'); // BDD/TDD assertion library

var LatLon  = require('../npm.js').LatLonNectorSpherical;
var Nvector = LatLon.Nvector;

chai.should();
var test = it; // just an alias

describe('latlon-nvector-spherical', function() {
    describe('private', function() {
        test('ll to v',           function() { new LatLon(45, 45).toNvector().toString().should.equal('[0.500,0.500,0.707,0.000]'); });
        test('v to ll',           function() { new Nvector(0.500, 0.500, 0.707107).toLatLon().toString('d').should.equal('45.0000°N, 045.0000°E'); });
        test('great circle',      function() { new LatLon(53.3206, -1.7297).greatCircle(96.0).toString().should.equal('[-0.794,0.129,0.594,0.000]'); });
    });
    test('distance',          function() { new LatLon(52.205, 0.119).distanceTo(new LatLon(48.857, 2.351)).toPrecision(4).should.equal('4.043e+5'); });
    test('bearing',           function() { new LatLon(52.205, 0.119).bearingTo(new LatLon(48.857, 2.351)).toFixed(1).should.equal('156.2'); });
    test('bearing (reverse)', function() { new LatLon(48.857, 2.351).bearingTo(new LatLon(52.205, 0.119)).toFixed(1).should.equal('337.9'); });
    test('midpoint',          function() { new LatLon(52.205, 0.119).midpointTo(new LatLon(48.857, 2.351)).toString('d').should.equal('50.5363°N, 001.2746°E'); });
    test('destination',       function() { new LatLon(51.4778, -0.0015).destinationPoint(7794, 300.7).toString('d').should.equal('51.5135°N, 000.0983°W'); });

    var N = 0, E = 90, S = 180, W = 270;
    test('intersection toward 1,1 N,E nearest',        function() { LatLon.intersection(new LatLon(0, 1), N, new LatLon(1, 0), E).toString('d').should.equal('00.9998°N, 001.0000°E'); });
    test('intersection toward 1,1 E,N nearest',        function() { LatLon.intersection(new LatLon(1, 0), E, new LatLon(0, 1), N).toString('d').should.equal('00.9998°N, 001.0000°E'); });
    test('intersection toward 1,1 N,E antipodal',      function() { LatLon.intersection(new LatLon(2, 1), N, new LatLon(1, 0), E).toString('d').should.equal('00.9998°S, 179.0000°W'); });
    test('intersection toward/away 1,1 N,W antipodal', function() { LatLon.intersection(new LatLon(0, 1), N, new LatLon(1, 0), W).toString('d').should.equal('00.9998°S, 179.0000°W'); });
    test('intersection toward/away 1,1 W,N antipodal', function() { LatLon.intersection(new LatLon(1, 0), W, new LatLon(0, 1), N).toString('d').should.equal('00.9998°S, 179.0000°W'); });
    test('intersection toward/away 1,1 S,E antipodal', function() { LatLon.intersection(new LatLon(0, 1), S, new LatLon(1, 0), E).toString('d').should.equal('00.9998°S, 179.0000°W'); });
    test('intersection toward/away 1,1 E,S antipodal', function() { LatLon.intersection(new LatLon(1, 0), E, new LatLon(0, 1), S).toString('d').should.equal('00.9998°S, 179.0000°W'); });
    test('intersection away 1,1 S,W antipodal',        function() { LatLon.intersection(new LatLon(0, 1), S, new LatLon(1, 0), W).toString('d').should.equal('00.9998°S, 179.0000°W'); });
    test('intersection away 1,1 W,S antipodal',        function() { LatLon.intersection(new LatLon(1, 0), W, new LatLon(0, 1), S).toString('d').should.equal('00.9998°S, 179.0000°W'); });

    test('intersection 1E/90E N,E antipodal',          function() { LatLon.intersection(new LatLon(0, 1), N, new LatLon(1, 90), E).toString('d').should.equal('00.0175°S, 179.0000°W'); });
    test('intersection 1E/90E N,E nearest',            function() { LatLon.intersection(new LatLon(0, 1), N, new LatLon(1, 92), E).toString('d').should.equal('00.0175°N, 179.0000°W'); });

    test('intersection brng+end 1a',                   function() { LatLon.intersection(new LatLon(1, 0), new LatLon(1, 3), new LatLon(2, 2), S).toString('d').should.equal('01.0003°N, 002.0000°E'); });
    test('intersection brng+end 1b',                   function() { LatLon.intersection(new LatLon(2, 2), S, new LatLon(1, 0), new LatLon(1, 3)).toString('d').should.equal('01.0003°N, 002.0000°E'); });
    test('intersection brng+end 2a',                   function() { LatLon.intersection(new LatLon(1, 0), new LatLon(1, 3), new LatLon(2, 2), N).toString('d').should.equal('01.0003°S, 178.0000°W'); });
    test('intersection brng+end 2b',                   function() { LatLon.intersection(new LatLon(2, 2), N, new LatLon(1, 0), new LatLon(1, 3)).toString('d').should.equal('01.0003°S, 178.0000°W'); });

    test('intersection end+end',                       function() { LatLon.intersection(new LatLon(1, 1), new LatLon(2, 2), new LatLon(1, 4), new LatLon(2, 3)).toString('d').should.equal('02.4994°N, 002.5000°E'); });

    var stn = new LatLon(51.8853, 0.2545), cdg = new LatLon(49.0034, 2.5735);
    test('intersection stn-cdg-bxl',                   function() { LatLon.intersection(stn, 108.547, cdg, 32.435).toString('d').should.equal('50.9078°N, 004.5084°E'); });

    test('cross-track b', function() { new LatLon(10, 0).crossTrackDistanceTo(new LatLon(0, 0), 90).toPrecision(4).should.equal('-1.112e+6'); });
    test('cross-track p', function() { new LatLon(10, 1).crossTrackDistanceTo(new LatLon(0, 0), new LatLon(0, 2)).toPrecision(4).should.equal('-1.112e+6'); });
    test('cross-track -', function() { new LatLon(10, 0).crossTrackDistanceTo(new LatLon(0, 0), 270).toPrecision(4).should.equal('1.112e+6'); });

    test('nearest point on segment 1',  function() { new LatLon(51.0, 1.9).nearestPointOnSegment(new LatLon(51.0, 1.0), new LatLon(51.0, 2.0)).toString('d').should.equal('51.0004°N, 001.9000°E'); });
    test('nearest point on segment 1d', function() { new LatLon(51.0, 1.9).nearestPointOnSegment(new LatLon(51.0, 1.0), new LatLon(51.0, 2.0)).distanceTo(new LatLon(51.0, 1.9)).toPrecision(4).should.equal('42.71'); });
    test('nearest point on segment 2',  function() { new LatLon(51.0, 2.1).nearestPointOnSegment(new LatLon(51.0, 1.0), new LatLon(51.0, 2.0)).toString('d').should.equal('51.0000°N, 002.0000°E'); });

    var bounds = [ new LatLon(45, 1), new LatLon(45, 2), new LatLon(46, 2), new LatLon(46, 1) ];
    test('enclosed in',   function() { new LatLon(45.1, 1.1).enclosedBy(bounds).should.be.true; });
    test('enclosed out',  function() { new LatLon(46.1, 1.1).enclosedBy(bounds).should.be.false; });
    test('equals',        function() { new LatLon(52.205, 0.119).equals(new LatLon(52.205, 0.119)).should.be.true; });
});
