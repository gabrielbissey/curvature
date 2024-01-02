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
  // We need to copy over the visited components array because otherwise the array is
  // shared among all recursive calls (which is desirable in some recursive algorithms,
  // but not in our case). We DONT want this because, let's say component A contains component B
  // and component C. Additionally, component B also contains component C. If the visited components
  // array is shared among all recursive calls, when we visit component C for the first time from
  // component B (we're doing a depth first search by nature of recursion), that will mark component C
  // as visited. Then, when we see component C again from component A, we'll see that component C has
  // been visited, and this algorithm will falsely say that there is a circular dependency.
  //
  // By making a copy of the visited components array, we keep the ancestral history of our
  // depth first search, but we get rid of our shared array. Therefore, each time this function is
  // called, the visited components array is guaranteed to contain ancestors exclusively.
  visitedComponents = [...visitedComponents];

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

    // By virture of this recursive descention, we're arguably doing a depth-first
    // search.
    circularDependencyDetected = detectCircularDependenciesInFile(
      null, componentFile, componentMappings, visitedComponents);

    if (circularDependencyDetected === true) {
      break;
    }
  }

  return circularDependencyDetected;
}

exports.detectCircularDependencies = detectCircularDependencies;