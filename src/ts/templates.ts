module powerbi.extensibility.visual {
    export module Templates {
        export const MissingToken = `
            <h4>Start building with Mapbox in 3 steps:
                <a class="mapboxLink" href="https://mapbox.com/account/access-tokens?source=PowerBI">Click here to get a free Mapbox access token</a>
            </h4>
            <ol>
                <li style="font-size: 18px;"> 1. Copy your Mapbox access token from the link above.</li>
                <img style="padding-bottom: 20px;" src="https://dl.dropbox.com/s/heywck8rrxw8fd0/copy_mapbox_access_token.png"></img><br>
                <li style="font-size: 18px;"> 2. Paste your Mapbox access token into the PowerBI Viz format pannel.</li>
                <img style="padding-bottom: 20px;" src="https://dl.dropbox.com/s/akn1lyw5qwtmxyn/add-access-token.png"></img><br>
                <li style="font-size: 18px;"> 3. Add latitude and longitude fields to your viz.</li><br>
                <img style="padding-bottom: 20px;" src="https://dl.dropbox.com/s/aobsdsrzn0ewc2t/add-long-lat.png"></img><br>
                <li style="font-size: 18px;"> Select a map style, then design heatmaps, circles, and cluster visualizations in the format pannel.</li><br>
                <img style="padding-bottom: 20px;" src="https://dl.dropbox.com/s/dc9ibu2f71t4t23/start-visualizing.png"></img><br>
                <li style="font-size: 18px;"> Still have questions? </li>
                <a class="mapboxLink" href="https://www.mapbox.com/contact/support?source=PowerBI">Contact Support</a>
                <img src="https://dl.dropbox.com/s/5io6dvr1l8gcgtp/mapbox-logo-color.png"/>
            </ol>
        `

        export const WebGLUnsupported = `
            <h4>
                Your browser doesnt support WebGL.  Please try a different browser.
            </h4>
            <h3>
                Still have issues?
            </h3>
            <a class="mapboxLink" href="https://www.mapbox.com/contact/support?source=PowerBI">Contact Mapbox Support</a>
            <img src="https://dl.dropbox.com/s/5io6dvr1l8gcgtp/mapbox-logo-color.png"/>
        `

        export const MissingGeo = `
            <h4>
                Add longitude & latitude fields to see your Mapbox viz.
            </h4>
            <img style="padding-bottom: 20px;" src="https://dl.dropbox.com/s/aobsdsrzn0ewc2t/add-long-lat.png"></img><br>
            <img src="https://dl.dropbox.com/s/5io6dvr1l8gcgtp/mapbox-logo-color.png"></img>
        `

        export const MissingLocationOrColor = `
            <h4>
                Add Location & Color fields to use a choropleth layer.
            </h4>
           <img src="https://dl.dropbox.com/s/5io6dvr1l8gcgtp/mapbox-logo-color.png"></img>
        `

        export const MissingCluster = `
            <h4>
                Add a cluster field to use a cluster layer.
            </h4>
           <img style="padding-bottom: 20px;" src="https://dl.dropbox.com/s/io61ltmj69xlt75/add-cluster.png"></img><br>
            <img src="https://dl.dropbox.com/s/5io6dvr1l8gcgtp/mapbox-logo-color.png"></img>
        `
    }
}

