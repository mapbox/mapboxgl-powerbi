/// external libraries
/// <reference path="../node_modules/@types/d3/index.d.ts" />
/// <reference path="../node_modules/@types/jasmine/index.d.ts" />
/// <reference path="../node_modules/@types/jasmine-jquery/index.d.ts" />
/// <reference path="../node_modules/@types/jquery/index.d.ts" />


// Power BI API
/// <reference path="../.api/v1.10.0/PowerBI-visuals.d.ts" />

// Power BI libraries
/// <reference path="../node_modules/powerbi-visuals-utils-typeutils/lib/index.d.ts" />
/// <reference path="../node_modules/powerbi-visuals-utils-dataviewutils/lib/index.d.ts" />
/// <reference path="../node_modules/powerbi-visuals-utils-testutils/lib/index.d.ts"/>

/// visual output
/// <reference path="../.tmp/drop/visual.d.ts" />

// Test
// <reference path=""visualData.ts" />
// <reference path=""visualBuilder.ts" />

/// specific imports
import Visual = powerbi.extensibility.visual.PBI_CV_EB3A4088_75C5_4746_9D8B_255A7B7ECD6C.MapboxMap;
import Utils = powerbi.extensibility.visual.PBI_CV_EB3A4088_75C5_4746_9D8B_255A7B7ECD6C.mapboxUtils;
import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import MockIVisualHost = powerbi.extensibility.utils.test.mocks.MockIVisualHost;
import MockIColorPalette = powerbi.extensibility.utils.test.mocks.MockIColorPalette;
import MockISelectionManager = powerbi.extensibility.utils.test.mocks.MockISelectionManager;
import MockITooltipService = powerbi.extensibility.utils.test.mocks.MockITooltipService;
import MockILocale = powerbi.extensibility.utils.test.mocks.MockILocale;
import MockIAllowInteractions = powerbi.extensibility.utils.test.mocks.MockIAllowInteractions;

// powerbi.extensibility.utils.type
import ValueType = powerbi.extensibility.utils.type.ValueType;
