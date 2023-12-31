const isHTMLFile = (file) => {
  const [name, extension] = file.split('.');

  return extension === 'html';
}

const directoryIsIncluded = (directory) => {
  return !/components|output|.git/.test(directory);
}

const fileIsIncluded = (file) => {
  return !/curvature-config\.json|.gitignore/.test(file);
}

const getSpaces = (line) => {
  const chars = line.split('')
  let spaces = '';

  // But what if they're tabs???
  chars.forEach(c => {
    if (c === ' ') spaces += ' ';
  });

  return spaces;
}

const ensureDirectoriesExist = () => {
  try {
    fs.accessSync(CONFIG.outputDir);
  } catch {
    fs.mkdirSync(CONFIG.outputDir);
  }
}

exports.isHTMLFile = isHTMLFile;
exports.directoryIsIncluded = directoryIsIncluded;
exports.fileIsIncluded = fileIsIncluded;
exports.getSpaces = getSpaces;
exports.ensureDirectoriesExist = ensureDirectoriesExist;