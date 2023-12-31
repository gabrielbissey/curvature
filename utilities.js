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

exports.isHTMLFile = isHTMLFile;
exports.directoryIsIncluded = directoryIsIncluded;
exports.fileIsIncluded = fileIsIncluded;