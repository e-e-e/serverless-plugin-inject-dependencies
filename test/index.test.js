/* eslint-env node, mocha */
const chai = require('chai');
const sinon = require('sinon');
const { getInstalledPathSync } = require('get-installed-path');

const InjectDependencies = require('../index');

const expect = chai.expect;

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

const serverlessPath = getInstalledPathSync('serverless', { local: true });
const AwsProvider = require(`${serverlessPath}/lib/plugins/aws/provider/awsProvider`); // eslint-disable-line
const Serverless = require(`${serverlessPath}/lib/Serverless`); // eslint-disable-line

describe('Inject Dependencies', () => {
  let serverless;
  let options;
  let sandbox;

  before(() => {
    sandbox = sinon.sandbox.create();
  });

  beforeEach(() => {
    options = {
      stage: 'myStage',
      region: 'us-east-1',
    };
    serverless = new Serverless(options);
    serverless.cli = new serverless.classes.CLI(serverless);
    serverless.service.service = 'myService';
    serverless.setProvider('aws', new AwsProvider(serverless, options));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {

  });

  describe('before:package:initialize', () => {
    it('should return', () => {
      const plugin = new InjectDependencies(serverless);
      return expect(plugin.hooks['before:package:initialize']()).to.equal(undefined);
    });
  });
});
