const fs = require('fs');
const mime = require('mime');

let CONFIG = null;
let COMPONENTS = null;

const directoryIsIncluded = (directory) => {
  return !/components|output|.git/.test(directory);
}

const fileIsIncluded = (file) => {
  return !/curvature-config\.json|.gitignore/.test(file);
}

const getComponentTemplate = (tag) => {
  const componentNameRegex = /(?<=<curvature-).*(?=><)/;
  const componentName = tag.match(componentNameRegex)[0];
  return fs.readFileSync(COMPONENTS[componentName], 'utf-8');
}

const getSpaces = (line) => {
  const chars = line.split('')
      let spaces = '';

      chars.forEach(c => {
        if (c === ' ') spaces += ' ';
      });

      return spaces;
}

// 2. Look for custom tags
const parseCustomTags = (file) => {
  // Read the contents of the file
  const data = fs.readFileSync(file, 'utf-8');

  // Look for tags, and parse out relevant name, that follow
  // the format "<curvature-tag name></curvature-tag name>". This regex will
  // return exclusively the "tag name" part of that tag.
  const customTagRegex = /<curvature-.+><\/curvature-.+>/g;
  const dataLines = data.split('\n');
  // iterate through file lines
  let outputLines = [];

  dataLines.forEach(line => {

    // This assumes that the opening and closing tag for the component
    // are on the same line. If they're on broken up lines, then this
    // will insert the template content twice... need to address this
    if (line.match(customTagRegex)) {

      const spaces = getSpaces(line);
      const template = getComponentTemplate(line);
      const templateLines = template.split('\n');

      templateLines.forEach(tLine => {
        outputLines.push(spaces + tLine);
      });
    } else {
      outputLines.push(line);
    }
  });

  return outputLines.join('\n');
}

const getOutputFilePath = (path) => {
  // Find name of directory(ies) that are nested under the base dir to be able to
  // replicate directory structure in output directory
  const dirNestedInBaseDirRegex = new RegExp(`(?<=${CONFIG.baseDir}).+(?=\/.+\..+)`)

  const match = path.match(dirNestedInBaseDirRegex);

  if (match) {
    return `${CONFIG.outputDir}${match[0]}`;
  }

  return CONFIG.outputDir;
}

const writeToOutputDir = (path, fileName, content, encoding = 'utf-8') => {
  
  if (fileIsIncluded(fileName)) {
    // Need to get directoy path beyond basedir to replicate path
    // in output directory
    const outputFilePath = getOutputFilePath(path);

    // Check if directory exists, and make it if not
    try {
      fs.accessSync(outputFilePath);
    } catch {
      fs.mkdirSync(outputFilePath);
    }

    const outputFile = `${outputFilePath}/${fileName}`;
  
    fs.writeFileSync(outputFile, content, encoding);
  }
}

const readFile = (filePath) => {
  const mimeType = mime.getType(filePath);

  if (mimeType === null || mimeType === undefined) {
    return null;
  }

  // mime.getType returns something like "application/json", but I only
  // care about the "broad" type e.g. "application" so that I know how
  // to read the file.
  const broadMimeType = mimeType.split('/')[0];

  if (broadMimeType === 'image') {
    return [fs.readFileSync(filePath, 'binary'), 'binary'];
  }

  // Assuming that anything that is not an image is encoded in utf-8
  // is absurdly false, and this code will absolutely lead to bugs...
  // But those are bugs for future Gabriel to deal with ;). This is
  // good enough for present Gabriel.
  return [fs.readFileSync(filePath, 'utf-8'), 'utf-8'];
}

const traverseFiles = (baseDir = CONFIG.baseDir) => {
  // Using the synchronous versions of most methods because recursive
  // async functions is damn-near impossibe
  const files = fs.readdirSync(baseDir);

  files.forEach(file => {

    const fullPath = `${baseDir}/${file}`;

    if (fs.lstatSync(fullPath).isFile()) {
      let newContent;
      let encoding;

      if (isHTMLFile(file)) {
        // Now we need to open the file, read it, and parse for custom tags
        newContent = parseCustomTags(fullPath);
      } else {
        // I don't love how readFile() returns the contents and the encoding...
        // Idk maybe not that bad, but I feel like it could be better.
        const contentAndEncoding = readFile(fullPath);

        if (contentAndEncoding) {
          newContent = contentAndEncoding[0];
          encoding = contentAndEncoding[1];
        }
      }

      if (newContent !== null && newContent !== undefined) {
        writeToOutputDir(fullPath, file, newContent, encoding);
      }

    } else if (fs.lstatSync(fullPath).isDirectory()) {
      // We don't want to search-and-replace the code in our components
      if (directoryIsIncluded(fullPath)) {
        traverseFiles(fullPath);
      }
    }
  });
}

const isHTMLFile = (file) => {
  const [name, extension] = file.split('.');

  return extension === 'html';
}

const generateConfigMetadata = () => {
  const config = {};

  config.baseDir = process.argv[2];
  config.configFile = `${config.baseDir}/curvature-config.json`
  config.outputDir = `${config.baseDir}/output`;
  config.componentsDir = `${config.baseDir}/components`;

  CONFIG = config;
}

const ensureDirectoriesExist = () => {
  try {
    fs.accessSync(CONFIG.outputDir);
  } catch {
    fs.mkdirSync(CONFIG.outputDir);
  }
}

const initializeComponents = (components) => {
  const fullPathComponents = {};

  Object.keys(components).forEach(key => {
    fullPathComponents[key] = `${CONFIG.componentsDir}/${components[key]}`;
  });

  COMPONENTS = fullPathComponents;
}

const parseConfigFile = () => {

  const parseConfig = (resolve, reject) => {
    let file;
  
    try {
      file = fs.readFileSync(CONFIG.configFile, 'utf-8');
    } catch (e) {
      console.log(`Unable to read curvature-config.json: ${e}`);
      reject();
    }

    const fileContents = JSON.parse(file);

    try {

      if (fileContents.components === undefined) {
        throw new Error('"components" property missing in curvature-config.json');
      }

      initializeComponents(fileContents.components);
    } catch (e) {
      console.log(`Error determining components: ${e}`);
      reject();
    }

    resolve();
  }

  return new Promise((resolve, reject) => parseConfig(resolve, reject));
}

const main = () => {
  generateConfigMetadata();
  ensureDirectoriesExist();
  parseConfigFile()
  .then(traverseFiles)
  .catch(() => console.log('Unable to run Curvature in this project'));
}

main();