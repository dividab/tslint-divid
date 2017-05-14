# tslint-divid

[![npm version][version-image]][version-url]
[![travis build][travis-image]][travis-url]
[![MIT license][license-image]][license-url]

[TSLint](https://palantir.github.io/tslint/) rules used in some projects at Divid.

## Background

This package is a colletion of rules we found useful when doing Typescript projects at [Divid](http://www.divid.se).

## Installing

`npm install tslint-divid --save-dev`

See the [example](#sample-configuration-file) tslint.json file for configuration.

## Compability

* tslint-divid is compatible with tslint 5.x.x.

## Rules

* [import-containment](#import-containment)
* [no-arguments](#no-arguments)
* [no-label](#no-label)
* [no-semicolon-interface](#no-semicolon-interface)

### import-containment

ECMAScript modules does not have a concept of a library that can span multiple files and share internal members. If you have a set of files that forms an library, and they need to be able to call each other internally without exposing members to other files outside the library set, this rule can be useful.

### no-arguments

Disallows use of the `arguments` keyword.

### no-label

Disallows the use of labels, and indirectly also `goto`.

### no-semicolon-interface

Ensures that interfaces only use commas as separator instead semicolor.

```typescript
// This is NOT ok.
inferface Foo {
  bar: string;
  zoo(): number;
}
// This is ok.
inferface Foo {
  bar: string,
  zoo(): number,
}
```

## Sample Configuration File

Here's a sample TSLint configuration file (tslint.json) that activates all the rules:

```javascript
{
  "extends": [
    "tslint-divid"
  ],
  "rules": {

    "no-arguments": true,
    "no-label": true,
    "no-semicolon-interface": true,
    "import-containment": [ true,
    {
      "containmentPath": "path/to/libs",
      "allowedExternalFileNames": ["index"],
      "disallowedInternalFileNames": ["index"]
    }]

  }
}
```

[version-image]: https://img.shields.io/npm/v/tslint-divid.svg?style=flat
[version-url]: https://www.npmjs.com/package/tslint-divid
[travis-image]: https://travis-ci.org/jonaskello/tslint-divid.svg?branch=master&style=flat
[travis-url]: https://travis-ci.org/jonaskello/tslint-divid
[license-image]: https://img.shields.io/github/license/jonaskello/tslint-divid.svg?style=flat
[license-url]: https://opensource.org/licenses/MIT
