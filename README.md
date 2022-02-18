# Validation-Server

[![Test](https://github.com/gbv/validation-server/actions/workflows/test.yml/badge.svg?branch=dev)](https://github.com/gbv/validation-server/actions/workflows/test.yml)
[![NPM package version](https://img.shields.io/npm/v/validation-server.svg)](https://www.npmjs.com/package/validation-server)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme)

> Web service to validate data against schemas

Provides methods to validate records against different kinds of schemas to ensure that they conform to known data formats.

## Table of Contents

- [Background](#background)
  - [Formats](#formats)
  - [Schema Languages](#schema-languages)
  - [See Also](#see-also)
- [Install](#install)
  - [From GitHub](#from-github)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Run Server](#run-server)
  - [Run Tests](#run-tests)
  - [Deployment](#deployment)
  - [Updates](#updates)
  - [Use as Module](#use-as-module)
- [API](#api)
  - [GET /validate](#get-validate)
  - [POST /validate](#post-validate)
  - [GET /formats](#get-formats)
  - [GET /schema](#get-schema)
  - [Validation Errors](#validation-errors)
  - [API Errors](#api-errors)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

Large parts of practical data science or other data processing work is spent by cleaning dirty data. To detect errors in data or to ensure that data is good enough, it must be **validated** against some critera. A **data format** is a set of digital objects (aka records) that meet some defined criteria. This application helps to check whether records conform to known data formats. [Validation errors](#validation-errors) show when and how a format is violated so data can be cleaned or rejected.

### Formats

Data formats are described as JSON Object with keys:

- `id` mandatory format identifier
- `title` optional title
- `short` optional short title
- `homepage` optional URL with information about the format
- `mimetype` optional content type
- `base` optional identifier of a base format (e.g. `json` for JSON-based formats)
- `schemas` an optional array of schemas, each with
  - `version` optional version number or name (set to `"default"` if missing)
  - `type` Schema type (identifier of a schema language, e.g. `json-schema`)
  - `url` where to retrieve the schema file from
- `for` identifier or list of identifiers of base format(s) of formats defined by this schema language (only for [schema formats](#schema-languages))

 of the base format that is tailored by the schema language (e.g. regular expressions are for character sequences)


A JSON Schema of this object is included in the configuration schema at [`config/schema.json`](config/schema.json).

API endpoint [/formats](#get-formats) can be used to list formats supported by an instance of validation server.

By default all schema languages and the data formats `json` and `isbn` are supported.

### Schema Languages

Schem languages (also known as schema formats or schema types) are data formats used to define other data formats. Formats defined by a schema language all share a common base format. For instance JSON Schema is a schema language to define JSON-based formats, XML Schema is a schema language to define XML-based formats, and regular expressions can be used as schema language to describe character-based formats. Schema languages must reference this base formats with description key `for`.

The following schema languages are supported for validation of other formats. The list is available via API endpoint [/types](#get-types) and the languages are also included as formats via API endpoint [/formats](#get-formats):

- JSON Schema (`json-schema`)
  - Supports `draft-04`, `draft-06`, and `draft-07`
  - Supports format keywords from <https://github.com/ajv-validator/ajv-formats> and <https://github.com/luzlab/ajv-formats-draft2019>

### See Also

The format registry <http://format.gbv.de/> (mostly German) lists data formats relevant to cultural heritage institutions. The thesis described at <http://aboutdata.org> includes some theoretical background.

## Install

Requires at least Node v14.8.0.

### From GitHub

```bash
git clone https://github.com/gbv/jskos-server.git
cd jskos-server
npm ci
```

### Configuration

The service must be customized via configuration files. By default, this configuration file resides in `config/config.json` (or `config/config.test.json` for tests). However, it is possible to adjust this path via the `CONFIG_FILE` environment variable. Missing keys are defaulted from `config/config.default.json`:

```json
{
  "title": "Validation Service",
  "description": "Web service to validate data against schemas",
  "version": "X.X.X",
  "port": 3700,
  "proxies": [],
  "postLimit": "20MB",
  "verbosity": "log",
  "formats": [],
  "formatsDirectory": "./formats",
  "update": "startup"
}
```

Keys `version` and `description` are defaulted to its value in `package.json`. In addition the environment variable `NODE_ENV` is respected with `development` as default. Alternative values are `production`, `test`, and `debug`.

Key `formats` must contain an array of [formats](#formats) or a file containing such array. The list of formats is automatically extended by some hardcoded formats and schema languages.

A JSON Schema to validate configuration is included at [`config/schema.json`](config/schema.json).

## Usage

This node package is mainily designed to be run as web service but it can also be [used as module](#use-as-module).

See [API Reference](#api) for usage of a running server instance.

### Run Server

```bash
# Development server with hot reload and auto reconnect at localhost:3700 (default)
npm run start

# To run the server in production, run this:
NODE_ENV=production node ./server.js
```

On startup all configured schemas are downloaded to `formatsDirectory` (set `update` to `"missing"` will only download missing schema files) and compiled. Addition and updates require to restart the server.

### Run Tests

```bash
npm test
npm run debug    # test with logging enabled
npm run coverage # test with code coverage report
```

### Deployment

To provide the service behind a nginx web server at path `/validate/` (like at <http://format.gbv.de/validate/>), add this to nginx configuration file:

```
location /validate/ {
    proxy_pass http://127.0.0.1:3700/;
}
```

We recommend to use [PM2](https://pm2.keymetrics.io/) to start and update the server:

```bash
pm2 start ecosystem.config.json
```

### Updates

To update an instance deployed with PM2:

```bash
# get updates from repository
git pull

# install dependencies
npm ci

# restart the process (adjust process name if needed)
pm2 restart validation-server
```

The server needs to be restarted to reflect updates in [configuration](#configuration), including formats and schemas to be supported. Script `bin/update.js` can help to updating formats and local schema files without breaking things.

### Use as Module

```js
const { loadConfig, createService } = require("validation-server")'

const config = await loadConfig()

createService(config).then(service => {
  const format = service.getFormat({ format: "json-schema", version: "draft-07" })

  const { validator } = format.schemas[0]

  const result = validator(data)
  if (!result) {
    console.error(validator.errors)
  }
})
```

#### loadConfig

Returns a promise to a configuration object. Loading can be controlled by environment variables `CONFIG_FILE` and `NODE_ENV` or by arguments of same name:

```js
const config = await loadConfig({ CONFIG_FILE: "config.json" })
```

An error is thrown on invalid configuration.

#### createService

Given a [configuration](#configuration) object, `createService` returns a promise to an initialized service object with methods:

- `getFormat` returns format (or `undefined`), queried by `format` identifier and optional `version` (set to `default` if not specified)

- `listFormats` returns a list of formats, optionally filtered (see [GET /formats](#get-formats) for query parameters)

Schemas of format objects can have an additional `validator` method to validate data in this format.

### parseableFormats

JSON object of [formats](#formats), each with async method `parse`.

### validationFormats

JSON object of [schema languages](#schema-languages), each with an async `createValidator` method.

## API

The response status code should always be 200 (possibly including [validation errors](#validation-errors), unless there was an [API error](#api-errors) such as wrong request parameters or unexpected internal failures.

### GET /validate

Endpoint to validate records passed via query parameter or URL.

**URL Params**

`url=[url]` URL to load data from

`data=[string]` Serialized data to be validated. Ignored when parameter `url` is given.

**Success Response**

Array of same length as the posted data and validation result formeach record.  An element is `true` when the object passed validation, or an array of [validation errors](#validation-errors) when the object failed validation.

**Examples**

Check whether a simple string such as `{}` or `[x]` is valid or invalid JSON:

```sh
curl -g 'http://format.gbv.de/validate/validate?format=json&data={}'
```

```json
[
  true
]
```

```sh
curl -g 'http://format.gbv.de/validate/validate?format=json&data=[x]'
```

```json
[
  [
    {
      "message": "Unexpected token x in JSON at position 1",
      "position": "char=1",
      "positionFormat": "rfc5147"
    }
  ]
]
```

JSON parsing errors are returned with character position in [RFC 5147](https://datatracker.ietf.org/doc/html/rfc5147) format.

The service does not guarantee to return all validation errors but it may stop at the first error.

### POST /validate

Endpoint to validate records like [GET /validate](#validate) but data is send via HTTP POST payload.

**Query Parameters**

* `format=[string]` a known data format (required)

**Success Response**

Same as response of [POST /validate](#post-validate).

**Examples**

This file `articles.json` contains two records in vzg-article format, one invalid and one valid:

```json
[
  { },
  {
    "primary_id": {
      "id": "123",
      "type": "unknown"
    },
    "title": "An example article",
    "lang_code": [ "ger" ],
    "journal": {
      "title": "Journal of Examples",
      "year": "2022"
    }
  }
]

```

```sh
curl -X POST 'http://format.gbv.de/validate/validate?format=vzg-article' -d @articles.json
```

```json
[
  [
    {
      "message": "must have required property 'primary_id'",
      "position": "",
      "positionFormat": "jsonpointer"
    }
  ],
  true
]
```

### GET /formats

Lists all [formats](#formats), optionally filtered by identifier, version, and/or schema type.

**Query Parameters**

* `format=[id]` select format with given format identifier

* `version=[string]` version to filter for

* `type=[string]` schema type filter for

* **Success Response**

  JSON Array of format objects.

### GET /schema

Get a schema file.

**Query Parameters**

* `format=[id]` format identifier

* `version=[string]` optional version (set to `default` by default)

* `type=[string]` optional schema type

**Success Response**

The schema file is served with corresponding content type.

**Error Resonse**

An [API error](#api-errors) with status code 404 is returned in no corresponding schema was found.

### GET /types

List schema types as array of [formats](#formats).

**Query Parameters**

* `type=[string]` optional schema type

**Success Response**

JSON Array of format objects.

### Validation Errors

Validation results (see [GET /validate](#get-validate) and [POST /validate](#post-validate)) can include validation errors. Each error is a JSON object with

* `message` mandatory error message
* `error` optional type of error
* `position` optional locator of the error
* `positionFormat` optional locator format (e.g. `rfc5147` to locate character positions in a string or `jsonpointer` to reference elements in a JSON document)

Errors may contain additional keys but these may change with future versions of the service.

For instance the following validation error indicates that value of JSON key `authors` was not given as array:

```json
{
  "message": "must be array",
  "position": "/authors",
  "positionFormat": "jsonpointer"
}
```

### API Errors

Non-validation errors such as wrong request parameters or unexpected internal failures are returned as JSON object such as the following:

```json
{
  "error": "MalformedRequest",
  "status": 400,
  "message": "Missing query parameter: format"
}
```

A stack trace is included in development mode.

## Maintainers

- [@nichtich](https://github.com/nichtich)
- [@stefandesu](https://github.com/stefandesu)

## Contributing

PRs accepted against the `dev` branch. Never directly work on the main branch.

For releases (maintainers only) make changes on `dev` and then run the release script:

```bash
npm run release:patch # or minor or major
```

## License

MIT © 2022 Verbundzentrale des GBV (VZG)
