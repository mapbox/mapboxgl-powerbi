/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy Test Harness - latlon-karney                              (c) Chris Veness 2014-2016  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';

var chai = require('chai');  // BDD/TDD assertion library

var LatLon = require('../latlon-ellipsoidal.js');
// merge karney methods into LatLon
var K = require('../latlon-karney.js');
for (var prop in K) LatLon[prop] = K[prop];

chai.should();
var test = it; // just an alias

describe('latlon-karney', function() {
    test('algorithms for geodesics direct geod test data', function() { new LatLon(4.72901904238 , 0).distanceTo(new LatLon(3.675485213595875123, 80.781861923838053716)).toFixed(8).should.equal('8964224.5513394'); });
    return;
    var pInvB1 = new LatLon(-30.00000,   0.00000);
    var pInvB2 = new LatLon( 29.90000, 179.80000);
    test('algorithms for geodesics inverse table 4 dist', function() { pInvB1.distanceTo(pInvB2).toFixed(4).should.equal('19989832.8276'); });
    return
    var pInvA1 = new LatLon(-30.12345,  10.00000);
    var pInvA2 = new LatLon(-30.12344,  10.00005);
    //test('algorithms for geodesics inverse table 3 dist',   function() { pInvA1.distanceTo(pInvA2).toFixed(6).should.equal('4.944208'); });
    test('algorithms for geodesics inverse table 3 brng init', function() { pInvA1.initialBearingTo(pInvA2).toFixed(11).should.equal('77.04353354237'); });
    //return

    //test('algorithms for geodesics direct table 2 dist', function() { new LatLon(40, 40).destinationPoint(10e6, 30).toString('d', 10).should.equal('41.7933102051°N, 177.8449000437°E'); });
    //test('algorithms for geodesics direct xxxx1', function() { new LatLon(10, 0).destinationPoint(1500e3, 135).toString('d', 10).should.equal('00.3148323362°N, 009.4835773704°E'); });
    //test('algorithms for geodesics direct xxxx1', function() { new LatLon(10, 0).destinationPoint(1600e3, 135).toString('d', 10).should.equal('00.3341582622°S, 010.1092018196°E'); });
    //test('algorithms for geodesics direct geod-test', function() { new LatLon(36.530042355041, 0).destinationPoint(9398502.0434687, 176.125875162171).toString('d', 10).should.equal('48.1642707790°S, 005.7623446947°E'); });
    //test('algorithms for geodesics direct geod-test', function() { new LatLon(7.656410023405, 0).destinationPoint(11865846.7919421, 151.07456745694).toString('d', 10).should.equal('60.4051364145°S, 110.5811395386°E'); });
    //test('algorithms for geodesics direct table 2 dist', function() { new LatLon(40, 40).destinationPoint(10e6, 30).toString('d', 10).should.equal('41.7933102051°N, 177.8449000437°E'); });
    //test('algorithms for geodesics direct table 2 brng', function() { new LatLon(40, 40).finalBearingOn(10e6, 30).toFixed(9).should.equal('149.090169318'); });
    //test('algorithms for geodesics direct equatorial',   function() { new LatLon(0, 10).destinationPoint(1e6, 90).toString('d', 10).should.equal('00.0000000000°N, 018.9831528412°E'); });
    //test('algorithms for geodesics direct meridional',   function() { new LatLon(10, 10).destinationPoint(1e6, 0).toString('d', 10).should.equal('19.0378229951°N, 010.0000000000°E'); });
    var pInvA1 = new LatLon(-30.12345,  10.00000);
    var pInvA2 = new LatLon(-30.12344,  10.00005);
    test('algorithms for geodesics inverse table 3 dist',   function() { pInvA1.distanceTo(pInvA2).toFixed(6).should.equal('4.944208'); });
    //test('algorithms for geodesics inverse table 3 brng init', function() { pInvA1.initialBearingTo(pInvA2).toFixed(6).should.equal('77.043534'); });
    //test('algorithms for geodesics inverse table 3 brng final', function() { pInvA1.finalBearingTo(pInvA2).toFixed(5).should.equal('77.04351'); }); // TODO precision
    var pInvB1 = new LatLon(-30.00000,   0.00000);
    var pInvB2 = new LatLon( 29.90000, 179.80000);
    test('algorithms for geodesics inverse table 4 dist', function() { pInvB1.distanceTo(pInvB2).toFixed(4).should.equal('19989832.8276'); });
    test('algorithms for geodesics inverse table 4 brng init', function() { pInvB1.initialBearingTo(pInvB2).toFixed(6).should.equal('161.890525'); });
    test('algorithms for geodesics inverse table 4 brng final', function() { pInvB1.finalBearingTo(pInvB2).toFixed(6).should.equal('18.090737'); });
    test('algorithms for geodesics inverse meridional dist', function() { new LatLon(10, 10).distanceTo(new LatLon(20, 10)).toFixed(3).should.equal('1106511.421'); });
    test('algorithms for geodesics inverse meridional brng', function() { new LatLon(10, 10).initialBearingTo(new LatLon(20, 10)).toFixed(3).should.equal('0.000'); });
    test('algorithms for geodesics inverse equatorial dist', function() { new LatLon(0, 10).distanceTo(new LatLon(0, 20)).toFixed(3).should.equal('1113194.908'); });
    test('algorithms for geodesics inverse equatorial dist', function() { new LatLon(0, 10).initialBearingTo(new LatLon(0, 20)).toFixed(3).should.equal('90.000'); });
    test('algorithms for geodesics inverse equatorial dist', function() { new LatLon(0, 10).finalBearingTo(new LatLon(0, 20)).toFixed(3).should.equal('90.000'); });
    test('algorithms for geodesics inverse equatorial dist', function() { new LatLon(0, 20).distanceTo(new LatLon(0, 10)).toFixed(3).should.equal('1113194.908'); });
    test('algorithms for geodesics inverse equatorial dist', function() { new LatLon(0, 20).initialBearingTo(new LatLon(0, 10)).toFixed(3).should.equal('-90.000'); });
    test('algorithms for geodesics inverse equatorial dist', function() { new LatLon(0, 20).finalBearingTo(new LatLon(0, 10)).toFixed(3).should.equal('-90.000'); });


    var le = new LatLon(50.06632, -5.71475), jog = new LatLon(58.64402, -3.07009);
    //test('karney inverse distance',              function() { le.distanceTo(jog).toFixed(3).should.equal('969954.166'); });
    //test('karney inverse initial bearing',       function() { le.initialBearingTo(jog).toFixed(4).should.equal('9.1419'); });
    //test('karney inverse final bearing',         function() { le.finalBearingTo(jog).toFixed(4).should.equal('11.2972'); });

    var flindersPeak = new LatLon(-37.95103, 144.42487);
    var buninyong = new LatLon(-37.6528, 143.9265);
    test('geoscience australia destination', function() { flindersPeak.destinationPoint(54972.271, 306.86816).toString('d').should.equal(buninyong.toString('d')); });
    test('geoscience australia final brng',  function() { flindersPeak.finalBearingOn(54972.271, 306.86816).toFixed(4).should.equal('307.1736'); });

    //test('karney antipodal distance',            function() { new LatLon(0, 0).distanceTo(new LatLon(0.5, 179.5)).should.equal(19936288.579); });

    //test('karney antipodal convergence failure', function() { new LatLon(0, 0).distanceTo(new LatLon(0.5, 179.7)).should.be.NaN; });
});
