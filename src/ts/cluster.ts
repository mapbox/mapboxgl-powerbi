module powerbi.extensibility.visual {
    declare var supercluster : any;

    export function createCluster() {
        return supercluster({
            radius: 50,
            maxZoom: 12,
            initial: function() {
                return {
                    count: 0,
                    sum: 0,
                    min: Infinity,
                    max: -Infinity,
                    avg: 0.0,
                    tooltip: '',
                };
            },
            map: function(properties) {
                const count = 1;
                const sum = Number(properties["clusterValue"]);
                const min = Number(properties["clusterValue"]);
                const max = Number(properties["clusterValue"]);
                const avg = Number(properties["clusterValue"]);
                const obj = {
                    count,
                    sum,
                    min,
                    max,
                    avg
                }
                let propertyName = '';
                if (properties.tooltip) {
                    let tooltipData = JSON.parse(properties.tooltip);
                    propertyName = tooltipData.clusterField;
                }
                return {
                    count,
                    sum,
                    min,
                    max,
                    avg,
                    propertyName,
                    tooltip: JSON.stringify({
                        title: propertyName,
                        content: {
                            Sum: sum,
                            Count: count,
                            Min: min,
                            Max: max,
                            Avg: avg,
                        }
                    })
                };
            },
            reduce: function(accumulated, properties) {
                accumulated.sum += Math.round(properties.sum * 100) / 100;
                accumulated.count += properties.count;
                accumulated.min = Math.round(Math.min(accumulated.min, properties.min) * 100) / 100;
                accumulated.max = Math.round(Math.max(accumulated.max, properties.max) * 100) / 100;
                accumulated.avg = Math.round(100 * accumulated.sum / accumulated.count) / 100;
                accumulated.propertyName = properties.propertyName;
                accumulated.tooltip = JSON.stringify({
                    title: properties.propertyName,
                    content: {
                        Sum: accumulated.sum,
                        Count: accumulated.count,
                        Min: accumulated.min,
                        Max: accumulated.max,
                        Avg: accumulated.avg,
                    }
                })
            }
        });
    }
}

