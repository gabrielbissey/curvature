const fs = require('fs');

const detectCircularDependencies = (directoryToCheck, componentMappings) => {
  const files = fs.readdirSync(directoryToCheck);
  let circularDependency;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    circularDependency = detectCircularDependenciesInFile(
      directoryToCheck, file, componentMappings);

    // If the dependency is a string, then it's a string representing the dependency
    // that was found. If it's a boolean, then it's false, indicating no curcular
    // dependency.
    if (typeof circularDependency === 'string') {
      break;
    }
  }

  return circularDependency;
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

const formatFilePath = (directory, file) => {
  if (directory === null) {
    return file;
  }

  return `${directory}/${file}`;
}

const formatCircularDependencyGraph = (ancestorComponents, component) => {
  let graph = '';

  ancestorComponents.forEach(ancestor => {
    graph += `${ancestor} --> `;
  });

  graph += component;

  return graph;
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
    return formatCircularDependencyGraph(visitedComponents, componentName);
  }

  const filePath = formatFilePath(directory, file);
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
        alreadyVisited = component;
      }
    });
  
    if (typeof alreadyVisited === 'string') {
      return formatCircularDependencyGraph(visitedComponents, alreadyVisited);
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

    if (typeof circularDependencyDetected === 'string') {
      break;
    }
  }

  return circularDependencyDetected;
}

exports.detectCircularDependencies = detectCircularDependencies;