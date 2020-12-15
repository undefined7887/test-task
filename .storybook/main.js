const path = require('path');

// your app's webpack.config.js
const custom = require('../webpack.config.js');

module.exports = {
  "stories": [
    "../src/stories/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  webpackFinal: (config) => {
    let newConfig = {...config, resolve: {...config.resolve, alias: custom.resolve.alias}};

    // Hack to inject css modules
    newConfig.module.rules[7].use[1].options.modules = {
      localIdentName: "[name]_[local]_[hash:base64:5]"
    }

    return newConfig
  },
}