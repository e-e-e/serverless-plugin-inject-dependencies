/* eslint-env node, mocha */
const chai = require('chai');
const sinon = require('sinon');
const path = require('path');
const dependencyTree = require('dependency-tree');
const { getInstalledPathSync } = require('get-installed-path');
const InjectDependencies = require('../index');

const expect = chai.expect;

chai.use(require('sinon-chai'));

const serverlessPath = getInstalledPathSync('serverless', { local: true });
const Serverless = require(`${serverlessPath}/lib/Serverless`); // eslint-disable-line


const dummyDependencyLists = {
  'path/to/fileA.js': [
    '/Users/name/project/node_modules/sax/lib/sax.js',
    '/Users/name/project/node_modules/xml2js/lib/defaults.js',
    '/Users/name/project/node_modules/xml2js/lib/builder.js',
    '/Users/name/project/node_modules/xml2js/lib/bom.js',
    '/Users/name/project/node_modules/xml2js/lib/processors.js',
    '/Users/name/project/node_modules/xml2js/lib/parser.js',
    '/Users/name/project/node_modules/xml2js/lib/xml2js.js',
  ],
  'path/to/fileB.js': [
    '/Users/name/project/node_modules/sax/lib/sax.js',
    '/Users/name/project/node_modules/something/index.js',
  ],
  'path/to/localDeps.js': [
    '/Users/name/project/local.js',
    '/Users/name/project/src/another.js',
  ],
};

describe('Inject Dependencies', () => {
  let serverless;
  let options;
  let sandbox;
  let plugin;

  before(() => {
    sandbox = sinon.createSandbox();
  });

  beforeEach(() => {
    options = {
      stage: 'myStage',
      region: 'us-east-1',
    };
    sandbox.stub(process, 'cwd').returns('/Users/name/project');
    sandbox.stub(dependencyTree, 'toList').callsFake((obj) => {
      const key = path.relative(process.cwd(), obj.filename);
      return dummyDependencyLists[key];
    });
    serverless = new Serverless(options);
    serverless.cli = new serverless.classes.CLI(serverless);
    serverless.service.service = 'myService';
    serverless.config.servicePath = '';
    serverless.service.package = {};
    serverless.service.functions = {};
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    it('returns InjectDependenciesPlugin object with hook `before:package:initialize`', () => {
      plugin = new InjectDependencies(serverless);
      expect(plugin.hooks).to.have.all.keys('before:package:initialize');
    });
  });

  describe('hook before:package:initialize', () => {
    it('returns synchronously', () => {
      plugin = new InjectDependencies(serverless);
      expect(plugin.hooks['before:package:initialize']()).to.equal(undefined);
    });

    it('sets service to automatically exclude all dependencies', () => {
      plugin = new InjectDependencies(serverless);
      plugin.hooks['before:package:initialize']();
      expect(serverless.service.package.exclude).to.deep.equal(['./**']);
    });

    it('adds detected dependencies to existing includes', () => {
      serverless.service.package.include = ['already/here'];
      serverless.service.functions = {
        post: {
          handler: 'path/to/fileB.post',
        },
      };
      plugin = new InjectDependencies(serverless);
      plugin.hooks['before:package:initialize']();
      const expected = ['already/here', 'node_modules/sax/**', 'node_modules/something/**'];
      expect(serverless.service.package.include).to.deep.equal(expected);
    });

    it('adds only unique dependencies', () => {
      serverless.service.functions = {
        post: {
          handler: 'path/to/fileB.post',
        },
        get: {
          handler: 'path/to/fileA.get',
        },
      };
      plugin = new InjectDependencies(serverless);
      plugin.hooks['before:package:initialize']();
      const expected = ['node_modules/sax/**', 'node_modules/something/**', 'node_modules/xml2js/**'];
      expect(serverless.service.package.include).to.deep.equal(expected);
    });

    it('adds local dependencies', () => {
      serverless.service.functions = {
        local: {
          handler: 'path/to/localDeps.post',
        },
      };
      plugin = new InjectDependencies(serverless);
      plugin.hooks['before:package:initialize']();
      const expected = ['local.js', 'src/another.js'];
      expect(serverless.service.package.include).to.deep.equal(expected);
    });

    it('only analyses files once, even if referenced multiple times', () => {
      serverless.service.package.include = ['already/here'];
      serverless.service.functions = {
        get: {
          handler: 'path/to/fileA.get',
        },
        del: {
          handler: 'path/to/fileA.del',
        },
        func: {
          handler: 'path/to/fileA.func',
        },
      };
      plugin = new InjectDependencies(serverless);
      plugin.hooks['before:package:initialize']();
      const file = '/Users/name/project/path/to/fileA';
      expect(dependencyTree.toList.calledOnce).to.equal(true);
      expect(dependencyTree.toList.calledWithExactly({
        filename: `${file}.js`,
        directory: path.dirname(file),
      })).to.equal(true);
    });
  });
});
