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

/// <reference path="../_references.ts"/>

module powerbi.extensibility.visual.test.helpers {
    // powerbi.extensibility.utils.test
    import RgbColor = powerbi.extensibility.utils.test.helpers.color.RgbColor;
    import getRandomNumber = powerbi.extensibility.utils.test.helpers.getRandomNumber;
    import parseColorString = powerbi.extensibility.utils.test.helpers.color.parseColorString;

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
}
