# Overview

# Usage

Basic usage with `sass-loader`. This goes in your webpack configuration
object.

```js
var scssImporter = require('sass-loader-smooth-importer');

module.exports = {
  sassLoader: {
    importer: scssImporter({
      modules: [
        // Applies the importer to all modules in this namespace
        '@namespaced-styles', 

        // Applies the importer only to imports of gridle
        'gridle'
      ]
    })
  }
};
```