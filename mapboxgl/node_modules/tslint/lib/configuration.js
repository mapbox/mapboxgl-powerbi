"use strict";
var fs = require("fs");
var path = require("path");
var findup = require("findup-sync");
exports.CONFIG_FILENAME = "tslint.json";
exports.DEFAULT_CONFIG = {
    "rules": {
        "class-name": true,
        "comment-format": [true, "check-space"],
        "indent": [true, "spaces"],
        "no-duplicate-variable": true,
        "no-eval": true,
        "no-internal-module": true,
        "no-trailing-whitespace": true,
        "no-var-keyword": true,
        "one-line": [true, "check-open-brace", "check-whitespace"],
        "quotemark": [true, "double"],
        "semicolon": true,
        "triple-equals": [true, "allow-null-check"],
        "typedef-whitespace": [true, {
                "call-signature": "nospace",
                "index-signature": "nospace",
                "parameter": "nospace",
                "property-declaration": "nospace",
                "variable-declaration": "nospace"
            }],
        "variable-name": [true, "ban-keywords"],
        "whitespace": [true,
            "check-branch",
            "check-decl",
            "check-operator",
            "check-separator",
            "check-type"
        ],
    }
};
function findConfiguration(configFile, inputFileLocation) {
    var configPath = findConfigurationPath(configFile, inputFileLocation);
    return loadConfigurationFromPath(configPath);
}
exports.findConfiguration = findConfiguration;
function findConfigurationPath(suppliedConfigFilePath, inputFilePath) {
    if (suppliedConfigFilePath != null) {
        if (!fs.existsSync(suppliedConfigFilePath)) {
            throw new Error("Could not find config file at: " + path.resolve(suppliedConfigFilePath));
        }
        else {
            return suppliedConfigFilePath;
        }
    }
    else {
        var configFilePath = findup("package.json", { cwd: inputFilePath, nocase: true });
        if (configFilePath != null && require(configFilePath).tslintConfig != null) {
            return configFilePath;
        }
        configFilePath = findup(exports.CONFIG_FILENAME, { cwd: inputFilePath, nocase: true });
        if (configFilePath != null && fs.existsSync(configFilePath)) {
            return configFilePath;
        }
        var homeDir = getHomeDir();
        if (homeDir != null) {
            configFilePath = path.join(homeDir, exports.CONFIG_FILENAME);
            if (fs.existsSync(configFilePath)) {
                return configFilePath;
            }
        }
        return undefined;
    }
}
exports.findConfigurationPath = findConfigurationPath;
function loadConfigurationFromPath(configFilePath) {
    if (configFilePath == null) {
        return exports.DEFAULT_CONFIG;
    }
    else if (path.basename(configFilePath) === "package.json") {
        return require(configFilePath).tslintConfig;
    }
    else {
        var fileData = fs.readFileSync(configFilePath, "utf8");
        fileData = fileData.replace(/^\uFEFF/, "");
        return JSON.parse(fileData);
    }
}
exports.loadConfigurationFromPath = loadConfigurationFromPath;
function getHomeDir() {
    var environment = global.process.env;
    var paths = [
        environment.USERPROFILE,
        environment.HOME,
        environment.HOMEPATH,
        environment.HOMEDRIVE + environment.HOMEPATH
    ];
    for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
        var homePath = paths_1[_i];
        if (homePath != null && fs.existsSync(homePath)) {
            return homePath;
        }
    }
}
function getRelativePath(directory, relativeTo) {
    if (directory != null) {
        var basePath = relativeTo || process.cwd();
        return path.resolve(basePath, directory);
    }
}
exports.getRelativePath = getRelativePath;
function getRulesDirectories(directories, relativeTo) {
    var rulesDirectories = [];
    if (directories != null) {
        if (typeof directories === "string") {
            rulesDirectories = [getRelativePath(directories, relativeTo)];
        }
        else {
            rulesDirectories = directories.map(function (dir) { return getRelativePath(dir, relativeTo); });
        }
    }
    for (var _i = 0, rulesDirectories_1 = rulesDirectories; _i < rulesDirectories_1.length; _i++) {
        var directory = rulesDirectories_1[_i];
        if (!fs.existsSync(directory)) {
            throw new Error("Could not find custom rule directory: " + directory);
        }
    }
    return rulesDirectories;
}
exports.getRulesDirectories = getRulesDirectories;
