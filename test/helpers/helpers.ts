/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */


import { RgbColor, parseColorString } from "powerbi-visuals-utils-colorutils"
import { getRandomNumber } from "powerbi-visuals-utils-testutils"
import * as _ from "lodash"

const MinColorValue: number = 0;
const MaxColorValue: number = 16777216;

export function getSolidColorStructuralObject(color: string): any {
    return { solid: { color } };
}

export function areColorsEqual(firstColor: string, secondColor: string): boolean {
    const firstConvertedColor: RgbColor = parseColorString(firstColor),
        secondConvertedColor: RgbColor = parseColorString(secondColor);

    return firstConvertedColor.R === secondConvertedColor.R
        && firstConvertedColor.G === secondConvertedColor.G
        && firstConvertedColor.B === secondConvertedColor.B;
}

export function getRandomUniqueIntegers(
    count: number,
    min: number = 0,
    max: number): number[] {

    const result: number[] = [];

    for (let i: number = 0; i < count; i++) {
        result.push(getRandomNumber(min, max, result, Math.floor));
    }

    return result;
}

export function getRandomUniqueHexColors(count: number): string[] {
    return getRandomUniqueIntegers(
        count,
        MinColorValue,
        MaxColorValue).map(getHexColorFromNumber);
}

export function getHexColorFromNumber(value: number): string {
    const hexColor: string = value.toString(16).toUpperCase(),
        color: string = hexColor.length === 6
            ? hexColor
            : `${_.range(0, 6 - hexColor.length, 0).join("")}${hexColor}`;

    return `#${color}`;
}
