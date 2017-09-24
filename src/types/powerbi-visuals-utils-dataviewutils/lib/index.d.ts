declare module powerbi.extensibility.utils.dataview {
    import DataViewValueColumn = powerbi.DataViewValueColumn;
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import DataViewValueColumns = powerbi.DataViewValueColumns;
    import DataViewValueColumnGroup = powerbi.DataViewValueColumnGroup;
    import ISQExpr = powerbi.data.ISQExpr;
    module DataViewTransform {
        function createValueColumns(values?: DataViewValueColumn[], valueIdentityFields?: ISQExpr[], source?: DataViewMetadataColumn): DataViewValueColumns;
        function setGrouped(values: DataViewValueColumns, groupedResult?: DataViewValueColumnGroup[]): void;
        /** Group together the values with a common identity. */
        function groupValues(values: DataViewValueColumn[]): DataViewValueColumnGroup[];
    }
}
declare module powerbi.extensibility.utils.dataview {
    import DataViewValueColumnGroup = powerbi.DataViewValueColumnGroup;
    import DataViewCategoryColumn = powerbi.DataViewCategoryColumn;
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import DataView = powerbi.DataView;
    import DataViewValueColumn = powerbi.DataViewValueColumn;
    module DataRoleHelper {
        function getMeasureIndexOfRole(grouped: DataViewValueColumnGroup[], roleName: string): number;
        function getCategoryIndexOfRole(categories: DataViewCategoryColumn[], roleName: string): number;
        function hasRole(column: DataViewMetadataColumn, name: string): boolean;
        function hasRoleInDataView(dataView: DataView, name: string): boolean;
        function hasRoleInValueColumn(valueColumn: DataViewValueColumn, name: string): boolean;
    }
}
declare module powerbi.extensibility.utils.dataview {
    import IDataViewObject = powerbi.DataViewObject;
    module DataViewObject {
        function getValue<T>(object: IDataViewObject, propertyName: string, defaultValue?: T): T;
        /** Gets the solid color from a fill property using only a propertyName */
        function getFillColorByPropertyName(object: IDataViewObject, propertyName: string, defaultColor?: string): string;
    }
}
declare module powerbi.extensibility.utils.dataview {
    import IDataViewObject = powerbi.DataViewObject;
    module DataViewObjects {
        /** Gets the value of the given object/property pair. */
        function getValue<T>(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: T): T;
        /** Gets an object from objects. */
        function getObject(objects: DataViewObjects, objectName: string, defaultValue?: IDataViewObject): IDataViewObject;
        /** Gets the solid color from a fill property. */
        function getFillColor(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultColor?: string): string;
        function getCommonValue(objects: DataViewObjects, propertyId: DataViewObjectPropertyIdentifier, defaultValue?: any): any;
    }
}
declare module powerbi.extensibility.utils.dataview {
    import DataViewCategorical = powerbi.DataViewCategorical;
    import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
    import PrimitiveValue = powerbi.PrimitiveValue;
    import MiscellaneousTypeDescriptor = powerbi.MiscellaneousTypeDescriptor;
    import DataView = powerbi.DataView;
    module converterHelper {
        function categoryIsAlsoSeriesRole(dataView: DataViewCategorical, seriesRoleName: string, categoryRoleName: string): boolean;
        function getSeriesName(source: DataViewMetadataColumn): PrimitiveValue;
        function isImageUrlColumn(column: DataViewMetadataColumn): boolean;
        function isWebUrlColumn(column: DataViewMetadataColumn): boolean;
        function getMiscellaneousTypeDescriptor(column: DataViewMetadataColumn): MiscellaneousTypeDescriptor;
        function hasImageUrlColumn(dataView: DataView): boolean;
    }
}
declare module powerbi.extensibility.utils.dataview {
    import DataViewObjectPropertyIdentifier = powerbi.DataViewObjectPropertyIdentifier;
    import DataView = powerbi.DataView;
    import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
    import VisualObjectInstanceEnumeration = powerbi.VisualObjectInstanceEnumeration;
    interface DataViewProperty {
        [propertyName: string]: DataViewObjectPropertyIdentifier;
    }
    interface DataViewProperties {
        [propertyName: string]: DataViewProperty;
    }
    class DataViewObjectsParser {
        private static InnumerablePropertyPrefix;
        static getDefault(): DataViewObjectsParser;
        private static createPropertyIdentifier(objectName, propertyName);
        static parse<T extends DataViewObjectsParser>(dataView: DataView): T;
        private static isPropertyEnumerable(propertyName);
        static enumerateObjectInstances(dataViewObjectParser: DataViewObjectsParser, options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration;
        getProperties(): DataViewProperties;
    }
}
