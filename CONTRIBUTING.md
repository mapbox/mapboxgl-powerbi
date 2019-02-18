## Adding your changes

1. Clone this repo
2. Create a branch
3. Commit your proposed changes
4. Push the branch
5. Open a PR
6. Get a code review
7. Merge and enjoy!

## Developing

- `npm install -g powerbi-visuals-tools`
- Follow Steps on https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/CertificateSetup.md to setup your PowerBI live visual
- `npm install`
- `npm run build-turf` to refresh the subset of turf.js used in the Mapbox Visual for Power BI from source
- Log into your PowerBI web UI and enable dev tools https://github.com/Microsoft/PowerBI-visuals/blob/master/tools/DebugVisualSetup.md
- `npm start`
- Add a custom visual using the PowerBI custom viz options, using a latitude and longitude variable.

### Developing under MacOS

Due to an open PowerBI [issue](https://github.com/Microsoft/PowerBI-visuals-tools/issues/157) the `npm start` might fail with `FSEvents.framework`.

To mitigate the issue for powerbi-visuals-tools version 1.10.0 may run
```
git apply VisualBuilder-1.10.0.patch
```

### Testing under Windows (when developing under MacOS)

If you would like to test the plugin under Window you can save yourself the setup of a separate Windows environment if you have one under MacOS already by executing the following steps:

1. Start the development server under MacOs (eg.: `npm start`)

1. Get the IP address of your Mac (eg.: `ifconfig`). You need the one which can be used it access your computer from the Windows test machine

1. On your Windows machine start command line with administrator privileges (`cmd`)

1. Run the following command:

   ```
   netsh interface portproxy add v4tov4 8080 <MACOS_IP_ADDRESS> 8080 0.0.0.0
   ```

1. Visit https://localhost:8080 under Windows and accept and store the certificate.

1. You can visit https://app.powerbi.com enable the Dev Visual and test it as it was running on the Windows machine.

### Running the tests

Please consult the [README.md](test/README.md) in the `/test` folder for futher details.

### Building

`npm run package`
The packaged output `pbiviz` file will be in the `/dist` folder.  
