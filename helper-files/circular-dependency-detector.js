const fs = require('fs');



/**
 * Consider a graph like
 * 
 * a -> b -> a
 * a: [b],
 * b: [a]
 * 
 * this graph has a circular depencency
 * 
 * All we have to do to detect this is implement a depth first search,
 * or breadth first search (I think breadth first is better), and for
 * every node we visit, we add it to a visited array. Then, if we see a
 * new node that is in said visited array, we know we've seen this node
 * before, and a circular dependency has then been detected.
 * 
 * Perform the following steps for all components
 * 1. Construct a graph (adjacency list) for each component
 * 
 * 2. Implement a breadth first search, keeping track of which
 * components we've vited
 * 
 * 3. Return boolean indicating whether a circular dependency has been
 * detected or not
 * 
 * 
 * 
 * 
 */

const detectCircularDependencies = (directoryToCheck, componentMappings) => {
  const files = fs.readdirSync(directoryToCheck);

  
  // Keep a running boolean for if a circular dependency has been
  // detected or not
  let circularDependencyDetected = false;
  
  
  // Iterate through all files in directory

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (detectCircularDependenciesInFile(directoryToCheck, file, componentMappings) === true) {
      circularDependencyDetected = true;
      break;
    }
  }

  return circularDependencyDetected;
}

const getComponentName = (file, componentMappings) => {
  let foundComponentName;

  Object.entries(componentMappings).forEach(([componentName, componentFilePath]) => {

    if (componentFilePath.includes(file)) {
      foundComponentName = componentName;
    }


  });

  return foundComponentName;

}

const detectCircularDependenciesInFile = (directory, file, componentMappings, visitedComponents = []) => {

  const componentName = getComponentName(file, componentMappings);

  if (!visitedComponents.includes(componentName)) {
    visitedComponents.push(componentName);
  } else {
    return true;
  }

  let filePath;

  if (directory === null) {
    filePath = file;
  } else {
    filePath = `${directory}/${file}`;
  }

  // Read in file contents
  const data = fs.readFileSync(filePath, 'utf-8');

  if (data === undefined) {
    throw new Error(`Unable to read file contents: ${e}`);
  }

  // Parse file for any component tags
  const componentNameRegex = /(?<=<curvature-).+(?=\/>)/g;


  const nestedComponents = data.match(componentNameRegex);

  // check if nested components are present in the visited components list
  // if so return true

  let alreadyVisited = false;

  if (nestedComponents === null || nestedComponents === undefined) {
    // No nested components found, and therefore a circular dependency cannot exist.
    return false;
  } else {
    nestedComponents.forEach(component => {

      if (visitedComponents.includes(component) === true) {
        alreadyVisited = true;
      }
  
    });
  
    if (alreadyVisited === true) {
  
      return true;
    }
  }





  let circularDependencyDetected = false;


  for (let i = 0; i < nestedComponents.length; i++) {
    component = nestedComponents[i];

    const componentFile = componentMappings[component];

    circularDependencyDetected = detectCircularDependenciesInFile(
      null, componentFile, componentMappings, visitedComponents);

    if (circularDependencyDetected === true) {
      break;
    }
  }

  return circularDependencyDetected;
}

exports.detectCircularDependencies = detectCircularDependencies;