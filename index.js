const path = require('path');
const _ = require('lodash');
const dependencyTree = require('dependency-tree');

function getHandlerFilePath(servicePath, handler) {
  const handlerPath = handler.slice(0, handler.lastIndexOf('.'));
  return path.resolve(path.join(servicePath, handlerPath));
}

function resolveToBaseModuleGlob(file) {
  const relative = path.relative(process.cwd(), file);
  const match = relative.match(/^((\.\.\/)*node_modules\/\S+?\/)/);
  if (match) {
    return `${match[1]}**`;
  }
  return relative;
}

function injectDependencies(serverless) {
  const functions = serverless.service.functions;
  const servicePath = _.get(serverless, 'config.servicePath', '');
  const files = new Set();
  Object.keys(functions).forEach((name) => {
    const file = getHandlerFilePath(servicePath, functions[name].handler);
    files.add(file);
  });
  const dependencies = [];
  files.forEach((file) => {
    const tree = dependencyTree.toList({
      filename: `${file}.js`,
      directory: path.dirname(file),
    });
    dependencies.push(tree);
  });

  const uniq = _(dependencies)
    .flatten()
    .map(resolveToBaseModuleGlob)
    .uniq()
    .filter(a => !!a)
    .value();
  const include = serverless.service.package.include || [];
  serverless.service.package.include = [...include, ...uniq];
  serverless.service.package.exclude = ['./**'];
}

class InjectDependenciesPlugin {
  constructor(serverless, options) {
    this.hooks = {
      'before:package:initialize': injectDependencies.bind(null, serverless, options),
    };
  }
}

module.exports = InjectDependenciesPlugin;
