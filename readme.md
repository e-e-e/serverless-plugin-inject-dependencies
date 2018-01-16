# serverless-plugin-inject-dependencies

[![Build Status](https://travis-ci.org/loanmarket/serverless-plugin-inject-dependencies.svg?branch=master)](https://travis-ci.org/loanmarket/serverless-plugin-inject-dependencies)
[![Coverage Status](https://coveralls.io/repos/github/loanmarket/serverless-plugin-inject-dependencies/badge.svg?branch=master)](https://coveralls.io/github/loanmarket/serverless-plugin-inject-dependencies?branch=master)

Easily include only required code your serverless package.

This plugin analyses all handlers in your `serverless.yml` configuration and modifies serverless includes/excludes options accordingly.

## Installation

First install the plugin via NPM.

```
npm install serverless-plugin-inject-dependencies --save-dev
```

Then include the plugin within your serverless.yml config.

```yml
plugins:
  - serverless-plugin-inject-dependencies
```
