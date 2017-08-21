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
 * ellipsoid – qv:
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



/**
 * Direct solution: destination point given distance / initial bearing from start point.
 */
LatLon.prototype.direct = function(distance, initialBearing) {
    const φ1 = this.lat.toRadians();
    const α1 = initialBearing.toRadians();
    const s12 = distance;
    //console.log('p1', this.lat, this.lon, s12, initialBearing)

    const a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b, f = this.datum.ellipsoid.f;

    const n = f / (2-f);        // third flattening
    const eSq = f * (2-f);      // eccentricity squared
    const eʹSq = eSq / (1-eSq); // second eccentricity squared
    const π = Math.PI;

    const sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1);
    const sinα1 = Math.sin(α1), cosα1 = Math.cos(α1);

    // note that Karney regularly uses the notation θ = ph(x, i·y) where ph is the phase of a
    // complex number, from which θ = atan2(y, x); since θ = atan2(sinθ, cosθ), this gives us
    // sinθ = y, cosθ = x from the original θ = ph(x, i·y).

    // β is the reduced latitude (on the auxiliary sphere); tanβ = (1-f)·tanφ
    const sinβ1 = sinφ1*(1-f) / Math.hypot(sinφ1*(1-f), cosφ1);
    const cosβ1 = cosφ1       / Math.hypot(sinφ1*(1-f), cosφ1);
    //console.log('β1', Math.atan2(sinβ1, cosβ1).toDegrees());

    // α0 is the azimuth of the geodesic at the equator
    const sinα0 = sinα1 * cosβ1;                                // Clairaut’s relation
    const cosα0 = Math.hypot(cosα1, sinα1*sinβ1);               // [1]
    //console.log('α0', Math.atan2(sinα0, cosα0).toDegrees());

    // σ₁ is the arc length from the intersection of the geodesic with the equator
    const sinσ1 = sinβ1       / Math.hypot(sinβ1, cosβ1*cosα1);
    const cosσ1 = cosβ1*cosα1 / Math.hypot(sinβ1, cosβ1*cosα1);
    //console.log('σ1', Math.atan2(sinσ1, cosσ1).toDegrees());

    // ε is series expansion parameter
    const kSq = eʹSq * cosα0 *cosα0;                            // k²; k = eʹ·cosα0
    const ε = kSq / (2 * (1 + Math.sqrt(1+kSq)) + kSq);         // ε = k² / (√(1+k²) + 1)²

    // distance integral I₁(σ) = s/b
    const B1σ1 = clenshawSinSeries(C1(ε), sinσ1, cosσ1);        // B₁(σ₁) = Σ C₁ₗsin2lσ₁
    const σ1 = Math.atan2(sinσ1, cosσ1);
    const I1σ1 = A1(ε) * (σ1 + B1σ1);                           // I₁(σ₁): distance integral for s/b
    //console.log('A1', A1(ε))
    //console.log('I1σ1', I1σ1)

    // s₁, s₂ are distances from intersection of the geodesic with the equator
    const s1 = I1σ1 * b;                                        // from distance integral for s/b
    const s2 = s1 + s12;
    const τ2 = s2 / (b*A1(ε));
    const sinτ2 = Math.sin(τ2), cosτ2 = Math.cos(τ2);
    const Bʹ1τ2 = clenshawSinSeries(Cʹ1(ε), sinτ2, cosτ2);      // Bʹ₁(τ₂) = Σ Cʹ₁ₗsin2lτ₂
    const σ2 = τ2 + Bʹ1τ2;
    // σ₂ is the arc length from the intersection of the geodesic with the equator
    const sinσ2 = Math.sin(σ2), cosσ2 = Math.cos(σ2);
    const tanβ2 = cosα0*sinσ2 / Math.hypot(cosα0*cosσ2, sinα0); // β = Arg(|cosα0cosσ +i·sinα0| + i·cosα0sinσ)
    //console.log('τ2', τ2.toDegrees())
    //console.log('σ2', Math.atan2(sinσ2, cosσ2).toDegrees());
    //console.log('β2', Math.atan(tanβ2).toDegrees());

    // distance integral  λ = ω − f·sinα₀·I₃(σ)
    const B3σ1 = clenshawSinSeries(C3(ε, n), sinσ1, cosσ1);     // B₃(σ₁) = Σ C₃ₗsin2lσ₁
    const I3σ1 = A3(ε, n) * (σ1 + B3σ1);                        // I₃(σ₁) = A₃·(σ₁ + Σ C₃ₗsin2lσ₁)
    const B3σ2 = clenshawSinSeries(C3(ε, n), sinσ2, cosσ2);     // B₃(σ₂) = Σ C₃ₗsin2lσ₂
    const I3σ2 = A3(ε, n) * (σ2 + B3σ2);                        // I₃(σ₂) = A₃·(σ₂ + Σ C₃ₗsin2lσ₂)

    // ω is the longitude on the auxiliary sphere
    const ω1 = Math.atan2(sinα0*sinσ1, cosσ1);                  // ω₁ = Arg(cosσ₁ + i·sinα₀·sinσ₁)
    const ω2 = Math.atan2(sinα0*sinσ2, cosσ2);                  // ω₂ = Arg(cosσ₂ + i·sinα₀·sinσ₂)
    //console.log('ω1', ω1.toDegrees());
    //console.log('ω2', ω2.toDegrees());

    // λ₁, λ₂ are the longitudes relative to the intersection of the geodesic with the equator
    const λ1 = ω1 - f*sinα0*I3σ1;                               // λ = ω₁ − f·sinα₀·I₃(σ₁)
    const λ2 = ω2 - f*sinα0*I3σ2;                               // λ = ω₂ − f·sinα₀·I₃(σ₂)
    //console.log('λ1', λ1.toDegrees())
    //console.log('λ2', λ2.toDegrees())

    const λ12 = (λ2+2*π)%(2*π) - λ1;                            // need to clamp λ₂ on cross-equatorial paths
    const φ2 = Math.atan(tanβ2 / (1 - f));                      // tanβ = (1-f)·tanφ
    const α2 = Math.atan2(sinα0, cosα0*cosσ2);                  // α₂ = final bearing
    //console.log('λ12', λ12.toDegrees())
    //console.log('α2', α2.toDegrees());

    //console.log('p2', φ2.toDegrees(), this.lon+λ12.toDegrees())
    return {
        point:        new LatLon(φ2.toDegrees(), this.lon+λ12.toDegrees(), this.datum),
        finalBearing: wrap360(α2.toDegrees()),
    };

    // [1]: qv Geodesics on an ellipsoid of revolution (Karney 2011), p8
};


/**
 * Inverse solution: distance / bearings between two points.
 */
LatLon.prototype.inverse = function(point) {
    const p1 = this, p2 = point;
    let φ1 = p1.lat.toRadians();
    let φ2 = p2.lat.toRadians();
    let λ12 = p2.lon.toRadians() - p1.lon.toRadians();
    console.log(p1.toString('d',6), p2.toString('d',6))
    console.log('λ12', λ12.toDegrees()+'°')

    const a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b, f = this.datum.ellipsoid.f;

    const n = f / (2-f);        // third flattening
    const eSq = f * (2-f);      // eccentricity squared
    const eʹSq = eSq / (1-eSq); // second eccentricity squared

    const δ = 1 / Math.pow(2, 53-1); // floating-point precision: IEEE 754 has 53 bits of precision
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
    console.log('txPts', txPts, 'txLat', txLat, 'txLon', txLon)

    // β is the reduced latitude on the auxiliary sphere, (1-f)·tanφ
    const tanβ1 = (1-f) * Math.tan(φ1);
    const cosβ1 = 1 / Math.sqrt((1 + tanβ1*tanβ1));
    const sinβ1 = tanβ1 * cosβ1;
    const tanβ2 = (1-f) * Math.tan(φ2);
    const cosβ2 = 1 / Math.sqrt((1 + tanβ2*tanβ2));
    const sinβ2 = tanβ2 * cosβ2;
    // note geographiclib uses:
    // const sinβᵢ = sinφᵢ*(1-f) / Math.hypot(sinφᵢ*(1-f), cosφᵢ);
    // const cosβᵢ = cosφᵢ       / Math.hypot(sinφᵢ*(1-f), cosφᵢ);
    const sinφ1ʹ = Math.sin(φ1), cosφ1ʹ = Math.cos(φ1);
    const sinφ2ʹ = Math.sin(φ2), cosφ2ʹ = Math.cos(φ2);
    const sinβ1ʹ = sinφ1ʹ*(1-f) / Math.hypot(sinφ1ʹ*(1-f), cosφ1ʹ);
    const cosβ1ʹ = cosφ1ʹ       / Math.hypot(sinφ1ʹ*(1-f), cosφ1ʹ);
    const sinβ2ʹ = sinφ2ʹ*(1-f) / Math.hypot(sinφ2ʹ*(1-f), cosφ2ʹ);
    const cosβ2ʹ = cosφ2ʹ       / Math.hypot(sinφ2ʹ*(1-f), cosφ2ʹ);
    //console.log('Δsinβ1', sinβ1-sinβ1ʹ)
    //console.log('Δcosβ1', cosβ1-cosβ1ʹ)
    //console.log('Δsinβ2', sinβ2-sinβ2ʹ)
    //console.log('Δcosβ2', cosβ2-cosβ2ʹ)
    console.log('β1', sinβ1, cosβ1, Math.atan2(sinβ1, cosβ1).toDegrees()+'°');
    //console.log('β2', Math.atan2(sinβ2, cosβ2).toDegrees()+'°');



    const sinβ12  = sinβ2*cosβ1 - cosβ2*sinβ1; // sin(β₁−β₁)
    const cosβ12  = cosβ2*cosβ1 + sinβ2*sinβ1; // cos(β₁−β₁)
    const sinβ12a = sinβ2*cosβ1 + cosβ2*sinβ1; // sin(β₁+β₁)
    //console.log('sinβ12a', sinβ12a)

    const sinβm = (sinβ1+sinβ2)/2;
    const cosβm = (cosβ1+cosβ2)/2;
    const ώ = Math.sqrt(1 - eSq * cosβm*cosβm); // ω = √(1 − e²·cos²βₘ) // geod. eq 20, alg. eq 48
    const ω12 = λ12 / ώ;

    const sinω12 = Math.sin(ω12), cosω12 = Math.cos(ω12);
    // geographiclib: const sinβ12a = sinβ2 * cosβ1 + cosβ2 * sinβ1; // TODO: ??
    //console.log('sinβ12/a', sinβ12, sinβ12a)

    // ----------------------------------------------------------------------- WHY α1 HERE? ON WHAT DESCRIPTION?

    // geographiclib code:
    //let sinα1 = cosβ2 * sinω12;
    //let cosα1 = cosω12 >= 0
    //          ? sinβ12 + cosβ2 * sinβ1 * sinω12*sinω12 / (1 + cosω12)
    //          : sinβ12a - cosβ2 * sinβ1 * sinω12*sinω12 / (1 - cosω12); // TODO: sinβ12a?
    //const sinσ12 = Math.hypot(sinα1, cosα1);
    //const cosσ12 = sinβ1 * sinβ2 + cosβ1 * cosβ2 * cosω12;
    //console.log('σ12', sinσ12, cosσ12, Math.atan2(sinσ12, cosσ12).toDegrees()+'°')


    const z1x = cosβ1*sinβ2 - sinβ1*cosβ2*cosω12;    // cosα1; geod. eq 68, alg. eq 49
    const z1y = cosβ2 * sinω12;                      // sinα1
    // TODO? replace zᵢᵣ with better conditioned equivalent sin(β₁∓β₂) ± sin²ω₁₂·sinβ₁·cosβ₂ / (1 ± cosω₁₂) for cosω₁₂ ≷ 0
    // geographiclib: const z1x = sinβ12 + cosβ2 * sinβ1 * sinω12*sinω12 / (1 + cosω12);
    console.log('cosω12', cosω12);
    console.log('β2', Math.atan2(sinβ2, cosβ2).toDegrees()+'°');

    const sinσ12 = Math.hypot(z1x, z1y);             // geod. eq 70, alg. eq 51
    const cosσ12 = sinβ1*sinβ2 + cosβ1*cosβ2*cosω12;

    // ----------------------------------------------------------------------- WHY α1 HERE? ON WHAT DESCRIPTION?

    let s12 = null;
    let sinα1 = null, cosα1 = null;
    let sinα2 = null, cosα2 = null;

    //const meridional = sinλ12 == 0 || p1.lat == -90;      // geographiclib; Geodesics on an ellipsoid of revolution p11
    //const equatorial = sinβ1 == 0 && sinβ2 == 0;          // geographiclib
    const meridional = λ12==0 || λ12==π;               // paper
    const equatorial = φ1==0 && φ2==0 && λ12<=(1-f)*π; // paper

    if (meridional) {
        console.log('-- meridional');
        const sinλ12 = Math.sin(λ12), cosλ12 = Math.cos(λ12);
        sinα1 = sinλ12, cosα1 = cosλ12; // head N/S to target longitude
        sinα2 = 0, cosα2 = 1;           // at the target we're heading north
        // tanβ = tanσ·cosα
        const sinσ1 = sinβ1;
        const cosσ1 = cosα1*cosβ1;
        const sinσ2 = sinβ2;
        const cosσ2 = cosα2*cosβ2;
        const σ12 = Math.atan2(Math.max(0, cosσ1*sinσ2 - sinσ1*cosσ2), cosσ1*cosσ2 + sinσ1*sinσ2);
        const B1σ1 = clenshawSinSeries(C1(n), sinσ1, cosσ1);          // Σ C₁ₗsin2lσ₁
        const B1σ2 = clenshawSinSeries(C1(n), sinσ2, cosσ2);          // Σ C₁ₗsin2lσ₂
        const B1 = B1σ2 - B1σ1;
        s12 = A1(n) * (σ12 + B1σ2 - B1σ1) * b;
        //α1 = Math.atan2(sinα1, cosα1);
    }

    if (equatorial) {
        console.log('-- equatorial');
        // α1 = 90°;
        sinα1 = 1, cosα1 = 0;
        sinα2 = 1, cosα2 = 0;
        s12 = a * λ12;                   // ?? geographiclib
        //const σ12 = λ12 / (1-f);       // ?? geographiclib
        //const ω12 = λ12 / (1-f);       // ?? geographiclib
    }

    if (!meridional && !equatorial) { // general case

        // ---- method chosen depends on length of line: very short, short, intermediate, long, very long

        const σ12 = Math.atan2(sinσ12, cosσ12);
        console.log('σ12', sinσ12, cosσ12, σ12.toDegrees()+'°', σ12, Math.sqrt(δ) / 0.01)

        const shortLine = λ12 < π/6 && sinβ12 < 0.5;            // λ₁₂ < 30° & β₁₂ < 30°
        // geographiclib: cosβ12 >= 0 && sinβ12 < 0.5 && cosβ2 * λ12 < 0.5;
        const shortShortLine = shortLine && σ12 < Math.sqrt(δ) / 0.01; // σ₁₂ < √δ / max(0.1,|e²|)
        // geographiclib: sinσ12 < 0.1 * Math.sqrt(Math.pow(0.5, 52)) / Math.sqrt( f * (1 - f/2) / 2 );
        const longLine = σ12 > π * (1 - 3*f*A3(n,n)*cosβ1*cosβ1);
        console.log('long', σ12, π * (1 - 3*f*A3(n,n)*cosβ1*cosβ1))
        const intermediateLine = !shortLine && !longLine;

        //console.log('longLine', σ12, A3(n,n), π * (1 - 3*f*A3(n,n)*cosβ1*cosβ1), longLine)


        if (shortLine) {
            console.log('-- short line');
            // get ω₁₂ for use in obtaining initial guess for α₁ (geod p.12)

            // ω₁₂ = λ₁₂ / √(1 − e²·cos²β), using average of β₁ & β₂
            // dnm = √(1 + eʹ²·(sin²β/(sin²βₘ+cos²βₘ))) where βₘ = (β₁+β₂)/2
            //const dnm = Math.sqrt(1 + eʹSq * sinβm*sinβm / (sinβm*sinβm * cosβm*cosβm));
            // geographiclib: ω = (1-f)·√(1 + eʹ²·sin²βₘ / sin²βₘ·cos²βₘ)
            console.log('ώ', ώ)

            const ω12 = λ12 / ώ;
            const sinω12 = Math.sin(ω12), cosω12 = Math.cos(ω12);
            console.log('ω12', sinω12, cosω12, ω12.toDegrees()+'°')

            // ---- now can get starting guess for α₁ (from z₁) for Newton’s method (Geod. eq 68)

            sinα1 = cosβ2*sinω12;
            cosα1 = cosβ1*sinβ2 - sinβ1*cosβ2*cosω12; // per eq 68
            cosα1 = cosω12>= 0
                ? sinβ12  + sinω12*sinω12*sinβ1*cosβ2 / (1+cosω12)
                : sinβ12a - sinω12*sinω12*sinβ1*cosβ2 / (1-cosω12); // Geod p.11
            const t = Math.hypot(sinα1, cosα1);
            sinα1 /= t;
            cosα1 /= t;


            console.log('α1 starting guess (short)', sinα1, cosα1, Math.atan2(sinα1, cosα1).toDegrees()+'°', cosω12);
        }

        if (intermediateLine) {
            console.log('-- intermediate line');
            // get ω₁₂ for use in obtaining initial guess for α₁ (geod p.12)
            const ω12 = λ12;
            const sinω12 = Math.sin(ω12), cosω12 = Math.cos(ω12);

            // ---- now can get starting guess for α₁ (from z₁) for Newton’s method (Geod. eq 68)

            sinα1 = cosβ2*sinω12;
            cosα1 = cosβ1*sinβ2 - sinβ1*cosβ2*cosω12; // per eq 68
            cosα1 = cosω12>= 0
                ? sinβ12  + sinω12*sinω12*sinβ1*cosβ2 / (1+cosω12)
                : sinβ12a - sinω12*sinω12*sinβ1*cosβ2 / (1-cosω12); // Geod p.11
            const t = Math.hypot(sinα1, cosα1);
            sinα1 /= t;
            cosα1 /= t;


            console.log('α1 starting guess (int)', sinα1, cosα1, Math.atan2(sinα1, cosα1).toDegrees()+'°', cosω12);
        }

        if (longLine) { console.log('-- long line');
            // solve astroid problem to obtain initial guess for α₁

            // solve asteroid problem; define plane coordinate system (x,y) centered on antipodal point
            // where Δ = f·a·π·cos²β1 is the unit of length
            //const Δ = f * a * π * cosβ1*cosβ1;
            //const xʹ = (λ12-π) * a*cosβ1 / Δ;
            //const β1 = Math.atan2(sinβ1, cosβ1), β2 = Math.atan2(sinβ2, cosβ2); // TODO: fudge for y
            //const yʹ = (β1+β2) * a / Δ;
            //const μʹ = astroid(xʹ, yʹ);

            // note Algorithms for geodesics uses Δ = f·a·π·cos²β1, λ₁₁ = π + x·Δ / a·cosβ₁, β₁ = y·Δ/a − β₁
            // – the following is taken from Geodesics on an ellipsoid of revolution / geographiclib

            // ε = k² / (2·(1 + √(1 + k²)) + k²) where k = eʹ·sinβ1 (from geographiclib)
            const kSq = eʹSq * sinβ1*sinβ1;
            const ε = kSq / (2*(1 + Math.sqrt(1+kSq)) + kSq);

            // Δλ = f·π·A3(ε,n)·cosβ1, Δβ = cosβ1·Δλ (from Geodesics on an ellipsoid of revolution)
            const Δλ = f * π * A3(ε, n) * cosβ1;           // Δλ = f·π·A₃·cosβ₁ (geod p.9)
            const Δβ = cosβ1 * Δλ;                         // Δβ = cosβ₁·Δλ
            console.log('Δλ', Δλ, 'Δβ', Δβ)

            console.log('λ12-π', λ12 - π)
            const x = (λ12 - π) / Δλ;                      // [x = sin(λ₁−λ₁−π) / Δλ] TODO: sin?
            const y = sinβ12a / Δβ;                        // [y = sin(β₁+β₁)·a / Δβ]
            const μ = astroid(x, y);
            //console.log('y/yʹ', y, yʹ, y-yʹ)

            // const ω12 = π + Δλ * μ * x / (1+μ);                    // geod eq. 67 TODO: not used!
            // geographiclib: ω12 = f * cosβ1 * A3(ε,n) * π * -x * μ/(1 + μ);


            // ---- now can get starting guess for α₁ for Newton’s method

            // qv Algorithms for geodesics Fig. 6
            sinα1 = -x / (1+μ); // alg. eq 56, geod. eq 66
            cosα1 = y / μ;

            // from geographiclab code...
            const ω12a = Δλ * -x * μ/(1 + μ);
            const sinω12 = Math.sin(ω12a);
            const cosω12 = -Math.cos(ω12a);
            sinα1 = cosβ2 * sinω12;
            cosα1 = sinβ12a - cosβ2*sinβ1*sinω12*sinω12 / (1-cosω12);
            const t = Math.hypot(sinα1, cosα1);
            sinα1 /= t;
            cosα1 /= t;

            if (y == 0) { // if y = 0, solution is found by taking the limit y → 0
                sinα1 = -x; // alg. eq 57
                cosα1 = Math.sqrt(Math.max(0, 1 - x*x));
            }

            // TODO: geographiclib uses cosα1 = sinβ12a - cosβ2 * sinβ1 * sinω12*sinω12 / (1 - cosω12) for long lines

            console.log('astroid', 'x', x, 'y', y, 'μ', μ);
            console.log('α1', sinα1, cosα1, Math.atan2(sinα1, cosα1).toDegrees()+'°')
        }


        // ---- we have starting guess for α₁, now solve for α₁, α₂, s₁₂


        if (shortShortLine) { // can get full solution from z₂
            console.log('--- short-short line')

            sinα2 = cosβ2*sinω12;
            cosα2 = -sinβ1*cosβ2 + cosβ1*sinβ2*cosω12;

            s12 = a * ώ * σ12;
            console.log('α2', sinα2, cosα2, Math.atan2(sinα2,cosα2).toDegrees()+'°')
            console.log('s12', s12)

            // geographiclib: sinα2 = cosβ1 * sinω12 / Math.hypot(sinα2, cosα2);
            // geographiclib: cosα2 = sinβ12 - cosβ1 * sinβ2 * (cosω12 >= 0 ? sinω12*sinω12 / (1 + cosω12) : 1 - cosω12) / Math.hypot(sinα2, cosα2);
            // TODO: ?? σ12 = Math.atan2(sinσ12, cosσ12);
        }

        if (!shortShortLine) { // Newton’s method

            const sinσ1 = sinβ1;        // eq 11
            const cosσ1 = cosα1 * cosβ1;
            console.log('σ1', sinσ1, cosσ1, Math.atan2(sinσ1,cosσ1).toDegrees()+'°')
            //const sinω12 = sinα0*sinσ1; // eq 12
            //const cosω12 = cosσ;

            // TODO: ?? const sinσ12 = Math.hypot(sinα1, cosα1);         // |zᵢ|
            // TODO: ?? const cosσ12 = sinβ1*sinβ2 + cosβ1*cosβ2*cosω12; // sinβ1·sinβ2 + cosβ1·cosβ2·cosω12
            // TODO: ?? let σ12 = Math.atan2(sinσ12, cosσ12);
            console.log('α1 starting guess', sinα1, cosα1, Math.atan2(sinα1, cosα1).toDegrees()+'°'); // TODO: not exact to table 3 [shortline?]
            //console.log('α2 starting guess', sinα2, cosα2, Math.atan2(sinα2, cosα2).toDegrees()+'°'); // TODO: not exact to table 3 [shortline?]

            const iterationLimit = 6;
            let iteration = 0;

            while (iteration++ < iterationLimit) {
                console.log('---- iteration', iteration)

                // α0 is the azimuth of the geodesic at the equator
                const sinα0 = sinα1 * cosβ1;                                // Clairaut’s relation
                const cosα0 = Math.hypot(cosα1, sinα1 * sinβ1);               // [1]

                // σ is the arc length from the intersection of the geodesic with the equator
                const sinσ1 = sinβ1 / Math.hypot(sinβ1, cosβ1 * cosα1);
                const cosσ1 = cosβ1 * cosα1 / Math.hypot(sinβ1, cosβ1 * cosα1);
                const σ1 = Math.atan2(sinσ1, cosσ1);               // TODO: where to declare?

                //console.log('---- cosβ1/cosβ2', cosβ1, cosβ2, cosβ1-cosβ2)
                sinα2 = sinα0 / cosβ2;                                // Clairaut’s relation
                cosα2 = Math.sqrt(cosα1 * cosα1 * cosβ1 * cosβ1 + (cosβ2 * cosβ2 - cosβ1 * cosβ1)) / cosβ2;
                //sinα2 = sinα0; // geographiclib code
                //cosα2 = Math.sqrt((cosα1*cosβ1)*(cosα1*cosβ1) + (cosβ1 < -sinβ1
                //                                         ? (cosβ2 - cosβ1) * (cosβ1 + cosβ2)
                //                                         : (sinβ1 - sinβ2) * (sinβ1 + sinβ2))) / cosβ2


                //const σ2 = Math.atan2(sinβ2, cosα2 * cosβ2);
                //const sinσ2 = Math.sin(σ2), cosσ2 = Math.cos(σ2);
                // geographiclab code here gives same result as above...
                let sinσ2 = sinβ2;
                let cosσ2 = cosα2 * cosβ2;
                const t = Math.hypot(sinσ2, cosσ2);
                sinσ2 /= t;
                cosσ2 /= t;
                const σ2 = Math.atan2(sinσ2, cosσ2);


                // ε is series expansion parameter
                const kSq = eʹSq * cosα0 * cosα0;                          // k²; k = eʹ·cosα₀
                const ε = kSq / (2 * (1 + Math.sqrt(1 + kSq)) + kSq);      // ε = k² / (√(1+k²) + 1)²

                // distance integral I₁(σ) = s/b
                const B1σ1 = clenshawSinSeries(C1(ε), sinσ1, cosσ1);       // Σ C₁ₗsin2lσ₁
                const I1σ1 = A1(ε) * (σ1 + B1σ1);                          // I₁(σ₁): distance integral for s/b
                const B1σ2 = clenshawSinSeries(C1(ε), sinσ2, cosσ2);       // Σ C₁ₗsin2lσ₂
                const I1σ2 = A1(ε) * (σ2 + B1σ2);                          // I₁(σ₂): distance integral for s/b

                // ...
                const B2σ1 = clenshawSinSeries(C2(ε), sinσ1, cosσ1);       // Σ C₁ₗsin2lσ₁
                const I2σ1 = A2(ε) * (σ1 + B2σ1);                          // I₁(σ₁): distance integral for s/b
                const B2σ2 = clenshawSinSeries(C2(ε), sinσ2, cosσ2);       // Σ C₁ₗsin2lσ₂
                const I2σ2 = A2(ε) * (σ2 + B2σ2);                          // I₁(σ₂): distance integral for s/b

                // distance integral λ = ω − f·sinα₀·I₃(σ)
                const B3σ1 = clenshawSinSeries(C3(ε, n), sinσ1, cosσ1);    // Σ C₃ₗsin2lσ₁
                const I3σ1 = A3(ε, n) * (σ1 + B3σ1);                       // I₃(σ) = A₃·(σ₁ + Σ C₃ₗsin2lσ₁)
                const B3σ2 = clenshawSinSeries(C3(ε, n), sinσ2, cosσ2);    // Σ C₃ₗsin2lσ₂
                const I3σ2 = A3(ε, n) * (σ2 + B3σ2);                       // I₃(σ) = A₃·(σ₂ + Σ C₃ₗsin2lσ₂)

                //console.log('β1', Math.atan(tanβ1).toDegrees()+'°; invariant');
                console.log('α0', sinα0, cosα0, Math.atan2(sinα0, cosα0).toDegrees()+'°');
                //console.log('σ1', sinσ1, cosσ1, Math.atan2(sinσ1, cosσ1).toDegrees()+'°');
                //console.log('α2', sinα2, cosα2, Math.atan2(sinα2, cosα2).toDegrees()+'°');
                //console.log('β2', sinβ2, cosβ2, Math.atan(tanβ2).toDegrees()+'°'); // (invariant)
                //console.log('σ2', sinσ2, cosσ2, σ2.toDegrees()+'°');
                console.log('kSq', kSq, 'ε', ε);
                //console.log('ε', ε);

                // ------------ check for convergence (variation of actual λ₁₂ from projection from current α₁)

                // ω is the longitude on the auxiliary sphere
                //const ω1 = Math.atan2(sinα0 * sinσ1, cosσ1);               // ω₁ = Arg(cosσ₁ + i·sinα₀sinσ₁)
                const ω2 = Math.atan2(sinα0 * sinσ2, cosσ2);               // ω₂ = Arg(cosσ₂ + i·sinα₀sinσ₂)
                // geographiclib code:
                const sinω1 = sinα0 * sinβ1; // α0 ok to 13 dig; β1 ok to 16 dig
                const cosω1 = cosα1 * cosβ1; // α1 ok to 14 dig
                const ω1 = Math.atan2(sinω1, cosω1);
                console.log('ω1', sinω1, cosω1, ω1.toDegrees()+'°');
                console.log('ω2', sinα0 * sinσ2, cosσ2, ω2.toDegrees()+'°');

                const λ1 = ω1 - f * sinα0 * I3σ1;                          // λ = ω − f·sinα₀·0I₃(σ₁)
                const λ2 = ω2 - f * sinα0 * I3σ2;                          // λ = ω − f·sinα₀·0I₃(σ₂)
                console.log('λ1', λ1.toDegrees()+'°');
                console.log('λ2', λ2.toDegrees()+'°');



                // geographiclib code:
                const sinλ12 = Math.sin(λ2-λ1), cosλ12 = Math.cos(λ2-λ1);
                const η = Math.atan2(sinω12 * cosλ12 - cosω12 * sinλ12, cosω12 * cosλ12 + sinω12 * sinλ12);   // TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO THIS IS FIRST DIFF
                console.log('η @', iteration, sinω12, cosω12, sinλ12, cosλ12)
                const B3σ12 = B3σ2 - B3σ1;
                const δλ12ʹ = η - f * A3(ε, n) * sinα0 * (σ12 + B3σ12); // => ν in convergence test
                console.log('δλ12ʹ/ν', δλ12ʹ.toDegrees()+'°', η, f, A3(ε, n), sinα0, σ12, B3σ12)



                const Δλ12 = Math.abs((λ2 - λ1) - λ12);
                console.log('Δλ12', Δλ12.toDegrees()+'°')
                console.log('-- convergence', 'λ2-λ1', (λ2 - λ1).toDegrees()+'°', 'Δλ12', Δλ12.toDegrees()+'°')

                if (δλ12ʹ < δ * 4) { // TODO: why greater tolerance required?
                    // converged: break out of loop with (sin/cos)α₁, (sin/cos)α₂, and s₁₂
                    const s1 = I1σ1 * b;
                    const s2 = I1σ2 * b;
                    s12 = s2 - s1;
                    console.log('-- converged', 's1', s1, 's2', s2, 's12', s12);
                    break;
                }

                // ------------ update α1

                const Jσ1 = I1σ1 - I2σ1;
                const Jσ2 = I1σ2 - I2σ2;
                const m12 = Math.sqrt(1 + kSq*sinσ2*sinσ2) * cosσ1*sinσ2*b // m₁₂ = √(1+k²·sin²σ₂) · cosσ₁·sinσ₂·b
                          - Math.sqrt(1 + kSq*sinσ1*sinσ1) * sinσ1*cosσ2*b //     − √(1+k²·sin²σ₁) · sinσ₁·cosσ₂·b
                          - cosσ1 * cosσ2 * (Jσ2-Jσ1) * b;                 //     − cosσ₁·cosσ₂·Jσ₁₂·b
                const δλ12 = (λ2 - λ1 - λ12);
                const δα1 = -δλ12 / ( m12 / (a * cosα2 * cosβ2) );

                const α1ʹ = Math.atan2(sinα1, cosα1) + δα1;
                sinα1 = Math.sin(α1ʹ);
                cosα1 = Math.cos(α1ʹ);

                //console.log('Jσ1', Jσ1);
                //console.log('Jσ2', Jσ2);
                //console.log('m12', m12);
                //console.log('m12 / (a*cosα2*cosβ2)', m12 / (a * cosα2 * cosβ2));
                //console.log('δα1', δα1.toDegrees()+'°');
                console.log('α1 @' + iteration, α1ʹ.toDegrees()+'°');
            }
            if (iteration > iterationLimit) throw new Error('failed to converge on '+p1.toString('d',12)+' '+p2.toString('d',12))
            console.log('total', iteration, 'iterations')
        } // /!shortShortLine (newton's method)

        console.log('α1', sinα1, cosα1, Math.atan2(sinα1, cosα1).toDegrees()+'°');
        console.log('α2', sinα2, cosα2, Math.atan2(sinα2, cosα2).toDegrees()+'°');

    } // /general-case

    // revert canonicalisation operation
    if (txPts < 0) {
        [sinα1,sinα2] = [sinα2,sinα1]; // swap sinα1 & sinα2
        [cosα1,cosα2] = [cosα2,cosα1]; // swap cosα1 & cosα2
    }
    sinα1 *= txPts * txLon, cosα1 *= txPts * txLon;
    sinα2 *= txPts * txLon, cosα2 *= txPts * txLon;

    const α1 = Math.atan2(sinα1, cosα1);
    const α2 = Math.atan2(sinα2, cosα2);
    console.log({
        distance:       s12,
        initialBearing: α1.toDegrees()+'°',
        finalBearing:   α2.toDegrees()+'°',
    })
    return {
        distance:       s12,
        initialBearing: α1.toDegrees(),
        finalBearing:   α2.toDegrees(),
    };
};

// www.researchgate.net/publication/242330657_SOME_APPLICATIONS_OF_CLENSHAW'S_RECURRENCE_FORMULA_IN_MAP_PROJECTIONS
// geographiclib.sourceforge.net/html/Geodesic_8cpp_source.html
// github.com/devbharat/gtsam/blob/master/gtsam/3rdparty/GeographicLib/matlab/private/SinCosSeries.m


/*
 * Solve astroid problem μ⁴ + 2μ³ + (1-x²-y²)μ² − 2y²μ − y² = 0 for +ve root μ.
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
 * Series expansions of Aⱼ & Cⱼ for j = 1, 2, 3
 */


function A1(ε) { //   ε   ε² ε³    ε⁴ ε⁵     ε⁶
    return horner([1, 0, 1/4, 0, 1/64, 0, 1/256], ε) / (1-ε);
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
    return horner([1, 0, 1/4, 0, 9/64, 0, 25/256], ε) / (1+ε); // /(1+ε) converges faster than *(1-ε)
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
 *
 * @param {number[]} C - array of polynomial coefficients.
 * @param {number}   x - value polynomial is to be evaluated for.
 * @returns {number} Value of evaluated polynomial.
 */
function horner(C, x) {
    let accum = 0;
    for (let i=C.length; i--; i<=0) accum = accum*x + C[i];
    return accum;
    // more idiomatically JavaScript version: return C.reduceRight((accum, coeff) => accum*x + coeff, 0);
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
