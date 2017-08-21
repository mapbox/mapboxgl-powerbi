/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Karney Geodesics on an Ellipsoid of Revolution                          (c) Chris Veness 2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-karney-geodesics.html                                   */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-karney.html                          */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module!='undefined' && module.exports) var LatLon = require('./latlon-ellipsoidal.js'); // CommonJS (Node)


// outmask/caps: http://geographiclib.sourceforge.net/html/js/tutorial-2-interface.html


/**
 * Implementation of Charles Karney’s solutions to direct & inverse solutions of geodesics on the
 * ellipsoid:
 *  - Geodesics on an ellipsoid of revolution, Charles F F Karney, 2011
 *  - Algorithms for geodesics, Charles F F Karney, Journal of Geodesy 2012
 *
 * Implementation is informed by not just Karney’s papers, but also GeographicLib code
 *  - geographiclib.sourceforge.net/html/js
 * Note that while GeographicLib code is not necessarily easy to follow, it also provides extra
 * functionality such as reduced length, geodesic scale, area, prolate ellipsoids, etc.
 */


LatLon.prototype.distanceTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    return this.inverse(point).distance;
};

LatLon.prototype.initialBearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    return this.inverse(point).initialBearing;
};

LatLon.prototype.finalBearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    return this.inverse(point).finalBearing;
};

LatLon.prototype.destinationPoint = function(distance, initialBearing) {
    return this.direct(Number(distance), Number(initialBearing)).point;
};

LatLon.prototype.finalBearingOn = function(distance, initialBearing) {
    return this.direct(Number(distance), Number(initialBearing)).finalBearing;
};



LatLon.prototype.direct = function(distance, initialBearing) {
    const φ1 = this.lat.toRadians();
    const α1 = initialBearing.toRadians();
    const s12 = distance;
    console.log('p1', this.lat, this.lon, s12, initialBearing)

    const a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b, f = this.datum.ellipsoid.f;

    const n = f / (2-f);     // third flattening
    const e2 = f * (2-f);    // eccentricity squared
    const eʹ2 = e2 / (1-e2); // second eccentricity squared

    const sinα1 = Math.sin(α1), cosα1 = Math.cos(α1);
    const sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1);

    // β is the reduced latitude (on the auxiliary sphere); tanβ = (1-f)·tanφ
    const sinβ1 = sinφ1*(1-f) / Math.hypot(sinφ1*(1-f), cosφ1);
    const cosβ1 = cosφ1       / Math.hypot(sinφ1*(1-f), cosφ1);
    console.log('β1', Math.atan2(sinβ1, cosβ1).toDegrees());

    // α0 is the azimuth of the geodesic at the equator
    const sinα0 = sinα1 * cosβ1;                                // Clairaut’s relation
    const cosα0 = Math.hypot(cosα1, sinα1*sinβ1);               // [1]
    console.log('α0', Math.atan2(sinα0, cosα0).toDegrees());

    // σ₁ is the arc length from the intersection of the geodesic with the equator
    const sinσ1 = sinβ1       / Math.hypot(sinβ1, cosβ1*cosα1);
    const cosσ1 = cosβ1*cosα1 / Math.hypot(sinβ1, cosβ1*cosα1);
    console.log('σ1', Math.atan2(sinσ1, cosσ1).toDegrees());

    // ω is the longitude on the auxiliary sphere TODO: not used?
    const sinω1 = sinα0 * sinβ1;
    const cosω1 = cosβ1 * cosα1;
    console.log('ω1', Math.atan2(sinω1, cosω1).toDegrees());

    // ε is series expansion parameter
    const k2 = eʹ2 * cosα0 *cosα0;                              // k²; k = eʹ·cosα0
    const ε = k2 / (2 * (1 + Math.sqrt(1+k2)) + k2);            // ε = k² / (√(1+k²) + 1)²

    const ΣC1σ1= ΣC1σ(sinσ1, cosσ1, ε);                           // ...
    const σ1 = Math.atan2(sinσ1, cosσ1);
    const I1σ1 = A1(ε) * (σ1 + ΣC1σ1);                             // I₁(σ): distance integral for s/b
    console.log('A1', A1(ε))
    console.log('I1σ1', I1σ1)

    const sin = Math.sin(I1σ1), cos = Math.cos(I1σ1);
    const sinτ1 = sinσ1*cos + cosσ1*sin;
    const cosτ1 = cosσ1*cos + sinσ1*sin;

    const ΣC3σ1= ΣC1σ(sinσ1, cosσ1, ε);                           // ...

    const τ12 = s12 / (b*A1(ε));
    const sinτ12 = Math.sin(τ12), cosτ12 = Math.cos(τ12);
    //const ΣCʹ1τ2 = ΣCʹ1τ(sinτ2, cosτ2, ε);                      // Σ Cʹ₁ₗsin2lτ2
    const ΣCʹ1τX = ΣCʹ1τ(sinτ1*cosτ12 + cosτ1*sinτ12, cosτ1*cosτ12 + sinτ1*sinτ12, ε);

    const σ12 = τ12 - (ΣCʹ1τX - ΣC1σ1);
    const sinσ12 = Math.sin(σ12), cosσ12 = Math.cos(σ12);

    const sinσ2 = sinσ1*cosσ12 + cosσ1*sinσ12;
    const cosσ2 = cosσ1*cosσ12 - sinσ1*sinσ12;
    console.log('σ2', Math.atan2(sinσ2, cosσ2).toDegrees());

    const AB1 = A1(ε) * (ΣCʹ1τX - ΣC1σ1)

    const sinβ2 = cosα0 * sinσ2;
    const cosβ2 = Math.hypot(sinα0, cosα0 * cosσ2);
    console.log('β2', Math.atan2(sinβ2, cosβ2).toDegrees());

    const sinα2 = sinα0;
    const cosα2 = cosα0*cosσ2;
    console.log('α2', Math.atan2(sinα2, cosα2).toDegrees());

    const sinω2 = sinα0 * sinσ2;
    const cosω2 = cosσ2;
    console.log('ω2', Math.atan2(sinω2, cosω2).toDegrees());

    const E = sinα0 < 0 ? -1 : 1;
    const ω12 =  Math.atan2(sinω2*cosω1 - cosω2*sinω1, cosω2*cosω1 + sinω2*sinω1);


    const ΣC3σ2 = ΣC3σ(sinσ2, cosσ2, ε, n);
    const λ12 = ω12 + A3(ε) * (σ12 + (ΣC3σ2 - ΣC3σ1));

    const φ2 = Math.atan2(sinβ2, this._f1 * cosβ2).toDegrees();

    const α2 = Math.atan2(sinα0, cosσ2);                  // α₂ = final bearing

    console.log('p2', φ2.toDegrees(), this.lon+λ12.toDegrees())
    return {
        point:        new LatLon(φ2.toDegrees(), this.lon+λ12.toDegrees(), this.datum),
        finalBearing: wrap360(α2.toDegrees()),
    };

    // [1]: qv Geodesics on an ellipsoid of revolution (Karney 2011), p8
};


/**
 *
 */
LatLon.prototype.inverse = function(point) {
    const p1 = this, p2 = point;
    let φ1 = p1.lat.toRadians();
    let φ2 = p2.lat.toRadians();
    let λ12 = p2.lon.toRadians() - p1.lon.toRadians();

    const a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b, f = this.datum.ellipsoid.f;

    const n = f / (2-f);     // third flattening
    const e2 = f * (2-f);    // eccentricity squared
    const eʹ2 = e2 / (1-e2); // second eccentricity squared
    const π = Math.PI;

    // canonicalise configuration so that φ₁ ≤ 0, φ₁ ≤ φ₂ ≤ −φ₁, 0 ≤ λ₁₂ ≤ π
    let txLon = λ12>=0 ? 1 : -1;
    λ12 *= txLon;
    const txPts = Math.abs(φ1) < Math.abs(φ2) ? -1 : 1;
    if (txPts < 0) {
        txLon = -txLon;
        [φ1,φ2] = [φ2,φ1]; // swap φ1 & φ2
    }
    const txLat = φ1<0 ? 1 : -1;
    φ1 *= txLat, φ2 *= txLat;

    // β is the reduced latitude on the auxiliary sphere
    const tanβ1 = (1-f) * Math.tan(φ1);
    const cosβ1 = 1 / Math.sqrt((1 + tanβ1*tanβ1));
    const sinβ1 = tanβ1 * cosβ1;
    const tanβ2 = (1-f) * Math.tan(φ2);
    const cosβ2 = 1 / Math.sqrt((1 + tanβ2*tanβ2));
    const sinβ2 = tanβ2 * cosβ2;
    // from geographiclib:
    //var sinβ1 = Math.sin(φ1) * (1-f);
    //var cosβ1 = Math.cos(φ1);
    //sinβ1 /= Math.hypot(sinβ1, cosβ1);
    //cosβ1 /= Math.hypot(sinβ1, cosβ1);
    //var sinβ2 = Math.sin(φ2) * (1-f);
    //var cosβ2 = Math.cos(φ2);
    //sinβ2 /= Math.hypot(sinβ1, cosβ1);
    //cosβ2 /= Math.hypot(sinβ1, cosβ1);

    const sinλ12 = Math.sin(λ12), cosλ12 = Math.cos(λ12);


    // solve asteroid problem; define plane coordinate system (x,y) centered on antipodal point
    // where Δ = f·a·π·cos²β1 is the unit of length
    const Δ = f * a * π * cosβ1*cosβ1;
    const x = (λ12-π) * a*cosβ1 / Δ;
    const β1 = Math.atan2(sinβ1, cosβ1), β2 = Math.atan2(sinβ2, cosβ2); // TODO: fudge for y
    const y = (β1+β2) * a / Δ;
    const μ = astroid(x, y);

    console.log('txPts', txPts, 'txLat', txLat, 'txLon', txLon)
    console.log('x', x);
    console.log('y', y);
    console.log('μ', μ);

    const meridional = sinλ12 == 0 || p1.lat == -90;      // geographiclib; Geodesics on an ellipsoid of revolution p11
    const equatorial = sinβ1 == 0 && sinβ2 == 0;          // geographiclib
    // const meridional = λ12==0 || λ12==π;               // paper
    // const equatorial = φ1==0 && φ2==0 && λ12<=(1-f)*π; // paper

    let s12 = null; //, α1 = null;
    let sinα1 = null, cosα1 = null;
    let sinα2 = null, cosα2 = null;

    if (meridional) {
        console.log('-- meridional');
        let sinα1 = sinλ12, cosα1 = cosλ12; // head to target longitude
        sinα2 = 0, cosα2 = 1;                 // at the target we're heading north
        // tan(bet) = tan(sig) * cos(alp)
        const sinσ1 = sinβ1, cosσ1 = cosα1 * cosβ1;
        const sinσ2 = sinβ2, cosσ2 = cosα2 * cosβ2;
        const σ12 = Math.atan2(Math.max(0, cosσ1*sinσ2 - sinσ1*cosσ2), cosσ1*cosσ2 + sinσ1*sinσ2);
        const ΣC1σ1 = ΣC1σ(sinσ1, cosσ1, n);                        // Σ C₁ₗsin2lσ
        const ΣC1σ2 = ΣC1σ(sinσ2, cosσ2, n);                        // Σ C₁ₗsin2lσ
        const B1 = ΣC1σ2 - ΣC1σ1;
        s12 = A1(n) * (σ12 + ΣC1σ2 - ΣC1σ1) * b;

        // TODO: outside meridional/equatorial
        if (txPts < 0) {
            [sinα1,sinα2] = [sinα2,sinα1]; // swap sinα1 & sinα2
            [cosα1,cosα2] = [cosα2,cosα1]; // swap cosα1 & cosα2
        }
        sinα1 *= txPts * txLon, cosα1 *= txPts * txLon;
        sinα2 *= txPts * txLon, cosα2 *= txPts * txLon;
        //α1 = Math.atan2(sinα1, cosα1);
    }

    if (equatorial) {
        console.log('-- equatorial');
        // α1 = 90°;
        sinα1 = 1, cosα1 = 0;
        sinα2 = 1, cosα2 = 0;
        s12 = a * λ12;           // ?? geographiclib
        const σ12 = λ12 / (1-f); // ?? geographiclib
        const ω12 = λ12 / (1-f); // ?? geographiclib
    }

    if (!meridional && !equatorial) { // general case
        console.log('-- general case');

        //const sinβ12a = sinβ2 * cosβ1 + cosβ2 * sinβ1;
        //console.log('xʹ', (λ12-π) / f * cosβ1 * A3(ε, n) * π)
        //console.log('yʹ', sinβ12a / f * cosβ1 * A3(ε, n) * π * cosβ1)

        let α1 = Math.atan2(-x/(1+μ), y/μ); // initial guess
        sinα1 = Math.sin(α1), cosα1 = Math.cos(α1);
        sinα2 = null, cosα2 = null; // required after iteration loop
        // geographiclib:
        // sinα1 = cosβ2 * sinω12;
        // cosα1 = sinβ12 + cosβ2 * sinβ1 * sinω12*sinω12 / (1 + cosω12)
        console.log('α1@0', α1.toDegrees())

        const iterationLimit = 4;
        let iteration = 0;

        while (iteration++ < iterationLimit) {
            console.log('---- iteration', iteration)
            console.log('β1', Math.atan(tanβ1).toDegrees()); // (invariant)



            // α0 is the azimuth of the geodesic at the equator
            const sinα0 = sinα1 * cosβ1;                                // Clairaut’s relation
            const cosα0 = Math.hypot(cosα1, sinα1*sinβ1);               // [1]
            console.log('α0', Math.atan2(sinα0, cosα0).toDegrees());

            // σ is the arc length from the intersection of the geodesic with the equator
            const sinσ1 = sinβ1       / Math.hypot(sinβ1, cosβ1*cosα1);
            const cosσ1 = cosβ1*cosα1 / Math.hypot(sinβ1, cosβ1*cosα1);
            const σ1 = Math.atan2(sinσ1, cosσ1);               // TODO: where to declare?
            console.log('σ1', Math.atan2(sinσ1, cosσ1).toDegrees());

            // ω is the longitude on the auxiliary sphere
            //const ω1 = Math.atan2(sinα0*sinσ1, cosσ1);                  // ω₁ = Arg(cosσ + i·sinα₀sinσ)
            //const ω2 = Math.atan2(sinα0*sinσ2, cosσ2);                  // ω₂ = Arg(cosσ + i·sinα₀sinσ)

            //const sinα1 = Math.sin(α1);
            //const cosα1 = Math.cos(α1);

            //const sinα0 = sinα1*cosβ1;

            //const ώ = Math.sqrt(1 - e2 * Math.pow((cosβ1+cosβ2)/2, 2)); // √( 1 − e² ((cosβ +cosβ₂)/2)² ) TODO use ** (v8 5.1)

            //const ω12 = λ12 / ώ; // TODO table 3 assumption

            //const sinω12 = Math.sin(ω12), cosω12 = Math.cos(ω12);


            //const z1 = { x:  cosβ1*sinβ2 - sinβ1*cosβ2*cosω12, y: cosβ2*sinω12 };
            //const z2 = { x: -sinβ1*cosβ2 + cosβ1*sinβ2*cosω12, y: cosβ2*sinω12 };
            //const α1 = Math.atan2(z1.y,  z1.x); // TODO: refine by Newton's method...
            sinα2 = sinα0 / cosβ2;                                // Clairaut’s relation
            cosα2 = Math.sqrt(cosα1*cosα1 * cosβ1*cosβ1 + (cosβ2*cosβ2 - cosβ1*cosβ1)) / cosβ2;
            console.log('α2', Math.atan2(sinα2, cosα2).toDegrees());

            const σ2 = Math.atan2(sinβ2, cosα2*cosβ2);
            const sinσ2 = Math.sin(σ2), cosσ2 = Math.cos(σ2);
            console.log('σ2', σ2.toDegrees());

            // ω is the longitude on the auxiliary sphere
            const ω1 = Math.atan2(sinα0*sinσ1, cosσ1);                  // ω₁ = Arg(cosσ + i·sinα₀sinσ)
            const ω2 = Math.atan2(sinα0*sinσ2, cosσ2);                  // ω₂ = Arg(cosσ + i·sinα₀sinσ)
            console.log('ω1', ω1.toDegrees());
            console.log('ω2', ω2.toDegrees());

            console.log('β2', Math.atan(tanβ2).toDegrees()); // (invariant)

            //const ω2 = Math.atan2(sinα0*sinσ2, cosσ2);

            // ε is series expansion parameter
            const k2 = eʹ2 * cosα0 *cosα0;                              // k²; k = eʹ·cosα0
            const ε = k2 / (2 * (1 + Math.sqrt(1+k2)) + k2);            // ε = k² / (√(1+k²) + 1)²
            console.log('k2', k2);
            console.log('ε', ε);

            const ΣC3σ1 = ΣC3σ(sinσ1, cosσ1, ε, n);                     // Σ C₃ₗsin2lσ
            const I3σ1 = A3(ε, n) * (σ1 + ΣC3σ1);                       // I₃(σ) = A₃·(σ + Σ C₃ₗsin2lσ)
            const ΣC3σ2 = ΣC3σ(sinσ2, cosσ2, ε, n);                     // Σ C₃ₗsin2lσ
            const I3σ2 = A3(ε, n) * (σ2 + ΣC3σ2);                       // I₃(σ) = A₃·(σ + Σ C₃ₗsin2lσ)

            const λ1 = ω1 - f*sinα0*I3σ1;                               // λ = ω − f·sinα₀·0I₃(σ)
            const λ2 = ω2 - f*sinα0*I3σ2;                               // λ = ω − f·sinα₀·0I₃(σ)
            console.log('λ1', λ1.toDegrees());
            console.log('λ2', λ2.toDegrees());

            const ΣC1σ1 = ΣC1σ(sinσ1, cosσ1, ε);                        // Σ C₁ₗsin2lσ
            const I1σ1 = A1(ε) * (σ1 + ΣC1σ1);                          // I₁(σ): distance integral for s/b

            const ΣC2σ1 = ΣC2σ(sinσ1, cosσ1, ε);                        // Σ C₁ₗsin2lσ
            const I2σ1 = A2(ε) * (σ1 + ΣC2σ1);                          // I₁(σ): distance integral for s/b

            const Jσ1 = I1σ1 - I2σ1;
            console.log('Jσ1', Jσ1);

            const ΣC1σ2 = ΣC1σ(sinσ2, cosσ2, ε);                        // Σ C₁ₗsin2lσ
            const I1σ2 = A1(ε) * (σ2 + ΣC1σ2);                          // I₁(σ): distance integral for s/b

            const ΣC2σ2 = ΣC2σ(sinσ2, cosσ2, ε);                        // Σ C₁ₗsin2lσ
            const I2σ2 = A2(ε) * (σ2 + ΣC2σ2);                          // I₁(σ): distance integral for s/b


            // ------------ check for convergence

            const Δλ12 = Math.abs((λ2-λ1) - λ12);
            console.log('-- convergence', 'λ2-λ1', (λ2-λ1).toDegrees(), 'Δλ12', Δλ12.toDegrees())
            const tolerance = 1 / Math.pow(2, 52); // IEEE 754 significand bits
            if (Δλ12 < tolerance) {
                const s1 = I1σ1 * b;
                const s2 = I1σ2 * b;
                s12 = s2 - s1;
                console.log('-- converged', 's1', s1, 's2', s2, 's12', s12);
                break;
            }

            // ------------ update α1

            const Jσ2 = I1σ2 - I2σ2;
            const m12 = Math.sqrt(1+k2*sinσ2*sinσ2)*cosσ1*sinσ2 * b
                      - Math.sqrt(1+k2*sinσ1*sinσ1)*sinσ1*cosσ2 * b
                      - cosσ1*cosσ2*(Jσ2-Jσ1) * b;
            const δλ12 = (λ2-λ1-λ12);
            const δα1 = -δλ12 / ( m12 / (a*cosα2*cosβ2) );

            α1 += δα1;
            sinα1 = Math.sin(α1), cosα1 = Math.cos(α1);

            console.log('Jσ2', Jσ2);
            console.log('m12', m12);
            console.log('m12 / (a*cosα2*cosβ2)', m12 / (a*cosα2*cosβ2));
            console.log('δα1', δα1.toDegrees());
            console.log('α1@'+iteration, α1.toDegrees());
        }

        // TODO: outside meridional/equatorial
        if (txPts < 0) {
            [sinα1,sinα2] = [sinα2,sinα1]; // swap sinα1 & sinα2
            [cosα1,cosα2] = [cosα2,cosα1]; // swap cosα1 & cosα2
        }
        sinα1 *= txPts * txLon, cosα1 *= txPts * txLon;
        sinα2 *= txPts * txLon, cosα2 *= txPts * txLon;

        console.log('α1', Math.atan2(sinα1, cosα1).toDegrees());
        console.log('α2', Math.atan2(sinα2, cosα2).toDegrees());

        console.log('total', iteration, 'iterations')
    }

    const s = Number(s12.toFixed(6)); // round to μm precision
    const α1 = Math.atan2(sinα1, cosα1);
    const α2 = Math.atan2(sinα2, cosα2);
    return { distance: s, initialBearing: α1.toDegrees(), finalBearing: α2.toDegrees() };
};

// www.researchgate.net/publication/242330657_SOME_APPLICATIONS_OF_CLENSHAW'S_RECURRENCE_FORMULA_IN_MAP_PROJECTIONS
// geographiclib.sourceforge.net/html/Geodesic_8cpp_source.html
// github.com/devbharat/gtsam/blob/master/gtsam/3rdparty/GeographicLib/matlab/private/SinCosSeries.m


/*
 * Solve μ⁴ + 2μ³ + (1-x²-y²)μ² − 2y²μ − y² = 0 for +ve root μ.
 *
 * From GeographicLib Geocentric::Reverse; qv dlmf.nist.gov/1.11#ii.
 */
function astroid(x, y) {
    const p = x*x;
    const q = y*y;
    const r = (p + q - 1) / 6;
    let μ = null;

    if (!(q == 0 && r <= 0)) {
        // avoid possible division by zero when r = 0 by multiplying equations for s and t by r³ and r, resp.
        const S = p * q / 4; // S = r³·s
        const r2 = r * r;    // r²
        const r3 = r * r2;   // r³
        // discriminant of the quadratic equation for T3; this is zero on the evolute curve p^⅓+q^⅓ = 1
        const discriminant = S * (S + 2*r3);
        let u = r;
        if (discriminant >= 0) {
            // pick the sign on the sqrt to maximize |T³|, to minimize loss of precision due to
            // cancellation; result is unchanged because of the way the T is used in definition of u.
            const T3 = S+r3 < 0 ? S+r3 - Math.sqrt(discriminant) : S+r3 + Math.sqrt(discriminant); // T³ = (r·t)³
            const T = Math.cbrt(T3); // T = r·t; T can be zero; but then r²/T -> 0.
            u += T + (T != 0 ? r2/T : 0);
        } else {
            // T is complex, but the way u is defined the result is real
            const θ = Math.atan2(Math.sqrt(-discriminant), -(S+r3));
            // there are three possible cube roots: choose the root which avoids cancellation;
            // note that discriminant < 0 implies that r < 0.
            u += 2 * r * Math.cos(θ/3);
        }
        const v = Math.sqrt(u*u + q); // (guaranteed positive)
        // avoid loss of accuracy when u < 0.
        const uv = u < 0 ? q / (v - u) : u + v; // u+v, guaranteed positive
        const w = (uv - q) / (2 * v);           // positive?
        // rearrange expression for μ to avoid loss of accuracy due to subtraction;
        // division by 0 not possible because uv > 0, w >= 0
        μ = uv / (Math.sqrt(uv + w*w) + w); // guaranteed positive
    } else { // q == 0 && r <= 0
        // y = 0 with |x| <= 1; handle this case directly; for y small, +ve root is μ = |y|/√(1-x²)
        μ = 0;
    }

    return μ;
}


/*
 * Evaluation of the integrals Iⱼ(σ) = Aⱼ(σ + Σ Cⱼₗsin2l,σ) for j = 1, 2, 3
 */


function A1(ε) { //   ε   ε² ε³    ε⁴ ε⁵     ε⁶
    return horner([1, 0, 1/4, 0, 1/64, 0, 1/256], ε) / (1-ε);
}
function ΣC1σ(sinσ, cosσ, ε) {
    return clenshawSinSeries(C1(ε), sinσ, cosσ); // Σ C₁ₗsin2lσ
}
function C1(ε) {
    return [ null, // ε     ε²     ε³     ε⁴       ε⁵       ε⁶
        horner([0, -1/2,     0,  3/16,     0,    1/32,       0], ε),
        horner([0,    0, -1/16,     0,  1/32,       0, -9/2048], ε),
        horner([0,    0,     0, -1/48,     0,   3/256,       0], ε),
        horner([0,    0,     0,     0, -5/512,      0,   3/512], ε),
        horner([0,    0,     0,     0,     0, -7/1280,       0], ε),
        horner([0,    0,     0,     0,     0,       0, -7/2048], ε),
    ];
}


function ΣCʹ1τ(sinτ, cosτ, ε) {
    return clenshawSinSeries(Cʹ1(ε), sinτ, cosτ); // Σ Cʹ₁ₗsin2lτ
}
function Cʹ1(ε) {
    return [ null,// ε    ε²     ε³        ε⁴         ε⁵           ε⁶
        horner([0, 1/2,    0, -9/32,        0,  205/1536,           0], ε),
        horner([0,   0, 5/16,     0,   -37/96,         0,   1335/4096], ε),
        horner([0,   0,    0, 29/96,        0,   -75/128,           0], ε),
        horner([0,   0,    0,     0, 539/1536,         0,  -2391/2560], ε),
        horner([0,   0,    0,     0,        0, 3467/7680,           0], ε),
        horner([0,   0,    0,     0,        0,         0, 38081/61440], ε),
    ];
}
function A2(ε) { //   ε   ε² ε³    ε⁴ ε⁵      ε⁶
    return horner([1, 0, 1/4, 0, 9/64, 0, 25/256], ε) * (1-ε);
}
function ΣC2σ(sinσ, cosσ, ε) {
    return clenshawSinSeries(C2(ε), sinσ, cosσ); // Σ C₂ₗsin2lσ
}


function C2(ε) {
    return [ null,// ε    ε²    ε³     ε⁴        ε⁵       ε⁶
        horner([0, 1/2,    0, 1/16,      0,    1/32,       0], ε),
        horner([0,   0, 3/16,    0,   1/32,       0, 35/2048], ε),
        horner([0,   0,    0, 5/48,      0,   5/256,       0], ε),
        horner([0,   0,    0,    0, 35/512,       0,   7/512], ε),
        horner([0,   0,    0,    0,      0, 63/1280,       0], ε),
        horner([0,   0,    0,    0,      0,       0, 77/2048], ε),
    ];
}
function A3(ε, n) { //             ε                         ε²                          ε³                ε⁴      ε⁵
    return horner([1, -(1/2 - 1/2*n), -(1/4 + 1/8*n - 3/8*n*n), -(1/16 + 3/16*n + 1/16*n*n), -(3/64 + 1/32*n), -3/128], ε);
}
function ΣC3σ(sinσ, cosσ, ε, n) {
    return clenshawSinSeries(C3(ε, n), sinσ, cosσ); // Σ C₃ₗsin2lσ
}

function C3(ε, n) {
    return [ null, //        ε                        ε²                          ε³               ε⁴       ε⁵
        horner([0, 1/4 - 1/4*n,  1/8          +  1/8*n*n,  3/64 + 3/64*n -  1/64*n*n, 5/128 +  1/64*n,   3/128], ε),
        horner([0,           0, 1/16 - 3/32*n + 1/32*n*n,  3/64 - 1/32*n -  3/64*n*n, 3/128 + 1/128*n,   5/256], ε),
        horner([0,           0,                        0, 5/192 - 3/64*n + 5/192*n*n, 3/128 - 5/192*n,   7/512], ε),
        horner([0,           0,                        0,                          0, 7/512 - 7/256*n,   7/512], ε),
        horner([0,           0,                        0,                          0,               0, 21/2560], ε),
    ];
}


/**
 * Clenshaw summation to sum trigonometric sin series ∑ Cₙsin2nθ.
 *
 * @param {number[]} C - Series expansion coefficients (1-based array).
 * @param {number}   sinθ - Value of sin θ.
 * @param {number}   cosθ - Value of cos θ.
 * @returns {number} Series sum.
 */
function clenshawSinSeries(C, sinθ, cosθ) {
    const a = 2 * (cosθ-sinθ) * (cosθ+sinθ); // 2·cos(2θ)
    let N = C.length-1;                      // O(N)
    let y1 = N%2==1 ? C[N--] : 0;
    let y2 = 0;
    for (let k=N; k>0; k-=2) {
        y2 = a*y1 - y2 + C[k];
        y1 = a*y2 - y1 + C[k-1];
    }
    return 2 * sinθ * cosθ * y1;
}


/**
 * Clenshaw summation to sum trigonometric cos series ∑ Cₙcos(2n+1)θ.
 *
 * @param {number[]} C - Series expansion coefficients (0-based array).
 * @param {number}   sinθ - Value of sin θ.
 * @param {number}   cosθ - Value of cos θ.
 * @returns {number} Series sum.
 */
function clenshawCosSeries(C, sinθ, cosθ) {
    const a = 2 * (cosθ-sinθ) * (cosθ+sinθ); // 2·cos(2θ)
    let N = C.length-1;                      // O(N)
    let y1 = N%2==0 ? C[N--] : 0;
    let y2 = 0;
    for (let k=N; k>0; k-=2) {
        y2 = a*y1 - y2 + C[k];
        y1 = a*y2 - y1 + C[k-1];
    }
    return cosθ * (y1-y2);
}


/*
 * Evaluate polynomial ∑ Cₙ·xⁿ using Horner’s method; rosettacode.org/wiki/Horner's_rule_for_polynomial_evaluation
 *.
 * @param {number[]} C - array of polynomial coefficients.
 * @param {number}   x - value polynomial is to be evaluated for.
 * @returns {number} Value of evaluated polynomial.
 */
function horner(C, x) {
    return C.reduceRight((acc, coeff) => acc*x + coeff, 0);
}


function wrap360(degrees) { return (degrees%360+360) % 360; }       // normalise degrees to 0..360
function wrap180(degrees) { return (degrees%360+180) % 360 - 180; } // normalise degrees to -180..+180


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLon; // CommonJS (Node)
