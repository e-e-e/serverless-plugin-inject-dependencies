# serverless-plugin-inject-dependencies

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
  - serverless-inject-dependencies
```
