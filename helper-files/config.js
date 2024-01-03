const fs = require('fs');

const generateConfigMetadata = () => {
  const config = {};

  config.baseDir = process.argv[2];
  config.configFile = `${config.baseDir}/curvature-config.json`
  config.outputDir = `${config.baseDir}/curvature-output`;
  config.componentsDir = `${config.baseDir}/components`;

  return config;
}

const parseCurvatureConfigFile = (configFile) => {

  const parseConfig = (resolve, reject) => {
    let file;
    let curvatureConfig;

    try {
      file = fs.readFileSync(configFile, 'utf-8');
    } catch (e) {
      console.log(`Unable to read ${configFile}: ${e}`);
      reject();
    }

    curvatureConfig = JSON.parse(file);

    try {

      if (curvatureConfig.components === undefined) {
        throw new Error(`"components" property missing in ${configFile}`);
      }

    } catch (e) {
      console.log(`Error determining components: ${e}`);
      reject();
    }

    resolve(curvatureConfig);
  }

  return new Promise((resolve, reject) => parseConfig(resolve, reject));
}

const initializeComponents = (componentsDir, components) => {
  const fullPathComponents = {};

  Object.keys(components).forEach(key => {
    fullPathComponents[key] = `${componentsDir}/${components[key]}`;
  });

  return fullPathComponents;
}

exports.generateConfigMetadata = generateConfigMetadata;
exports.parseCurvatureConfigFile = parseCurvatureConfigFile;
exports.initializeComponents = initializeComponents;