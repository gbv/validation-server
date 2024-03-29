# Validation-Server

[![Test](https://github.com/gbv/validation-server/actions/workflows/test.yml/badge.svg?branch=dev)](https://github.com/gbv/validation-server/actions/workflows/test.yml)
[![NPM package version](https://img.shields.io/npm/v/validation-server.svg)](https://www.npmjs.com/package/validation-server)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme)

> Web service to validate data with support of multiple schema languages

Large parts of practical data science or other data processing work is spent by bringing dirty data into shape. **Data formats** define desired shapes of data. To check whether data conforms to a data format, it must be **validated**. This application helps to validate data against data formats. [Validation errors](#validation-errors) show if, where and how a format is violated so data can be cleaned or rejected. Data formats can be configured with **schemas** in multiple [schema languages](#schema-languages).

## Table of Contents

- [Background](#background)
  - [Data Formats](#data-formats)
  - [Schema Languages](#schema-languages)
  - [Locator Languages](#locator-languages)
  - [See Also](#see-also)
- [Install](#install)
  - [From GitHub](#from-github)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Run Server](#run-server)
  - [Deployment](#deployment)
  - [Updates](#updates)
  - [Use as Module](#use-as-module)
  - [Command Line Interface](#command-line-interface)
  - [Run Tests](#run-tests)
- [API](#api)
  - [GET /validate](#get-validate)
  - [POST /{format}](#post-format)
  - [GET /formats](#get-formats)
  - [GET /languages](#get-languages)
  - [GET /schema](#get-schema)
  - [Validation Errors](#validation-errors)
  - [API Errors](#api-errors)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

### Data Formats

Data formats supported by validation server are described as JSON Object with:

- `id` mandatory local format identifier
- `title` optional title
- `short` optional short title (abbreviation or acronym)
- `description` optional short textual description or definition
- `url` optional URL with information about the format
- `wikidata` optional Wikidata identifier of the format
- `mimetypes` optional array of content types
- `base` optional identifier of a base format (e.g. `json` for JSON-based formats)
- `versions` an optional object with format versions, the keys used as version identifier (is `default` if unknown) and each values an object with:
    - `schemas` an optional array with schemas, each an object with:
        - `type` mandatory schema type (identifier of a schema language, e.g. `json-schema`)
        - `url` optional URL to retrieve the schema file from
        - `value` schema as string (mandatory if no `url` given)

This meta-format is defined as **Data About Data Formats** with a JSON Schema at <https://format.gbv.de/validate/format-schema.json>.

API endpoint [/formats](#get-formats) or [command line argument](#command-line-interface) `--list` return data formats supported by an instance of validation server.

### Schema Languages

Schema languages (also known as schema formats or schema types) are data formats used to define other data formats. Formats defined by a schema language all share a common base format. For instance JSON Schema is a schema language to define JSON-based formats, XML Schema is a schema language to define XML-based formats, and regular expressions can be used as schema language to describe character-based formats.

Schema languages supported by validation server are described as [data formats](#data-formats) with additional mandatory keys `restricts` referencing the common base format(s).

The following schema languages are supported for validation of other formats. The list is available via API endpoint [/languages](#get-languages):

- JSON Schema (`json-schema`)
  - Supports `draft-04`, `draft-06`, and `draft-07`
  - Supports format keywords from <https://github.com/ajv-validator/ajv-formats> and <https://github.com/luzlab/ajv-formats-draft2019>

- XML Schema (`xsd`)
  - Requires `xmllint` executable to be installed.

- Regular Expressions (`regexp`)
  - Supports ECMAScript variant with Unicode flag enabled automatically and flags other than `i`, `m`, `s` ignored.
  - Can be given as plain pattern or in form `/${pattern}/${flags}`

### Locator Languages

Locator languages such as XPath and JSON Pointer are used to reference parts of a document. Validation server supports the following languages to locate [validation errors](#validation-errors) and/or to select which parts of a document to validate:

- [JSON Pointer](https://datatracker.ietf.org/doc/html/rfc6901) (`jsonpointer`) for error locations in JSON documents

- Line & Column (`linecol`) for error locations in documents: e.g. `3:7` for line 3 column 7

- Character position (`rfc5147`) for error locations given by character position as defined in [RFC 5147](https://datatracker.ietf.org/doc/html/rfc5147): e.g. `char=23`

- JSONPath (`jsonpath`) limited to value `$.*` to select to validate elements of a JSON array

### See Also

The format registry <http://format.gbv.de/> (mostly German) lists data formats relevant to cultural heritage institutions. The thesis described at <http://aboutdata.org> includes some theoretical background.

## Install

Requires at least Node v14.8.0.

Support of XML Schema based formats requires `xmllint` to be installed:

```bash
sudo apt install libxml2-utils
```

### From GitHub

```bash
git clone https://github.com/gbv/jskos-server.git
cd jskos-server
npm ci
```

### Configuration

The service must be customized via configuration files. By default, this configuration file resides in `config/config.json` (or `config/config.test.json` for tests). Missing keys are defaulted from `config/config.default.json`:

```json
{
  "title": "Validation Service",
  "description": "Web service to validate data against schemas",
  "version": "X.X.X",
  "port": 3700,
  "proxies": [],
  "postLimit": "20MB",
  "timeout": 2000,
  "allErrors": false
  "verbosity": "info",
  "formats": [],
  "cache": "../cache",
}
```

Keys `version` and `description` are defaulted to its value in `package.json`. In addition the environment variable `NODE_ENV` is respected with `development` as default. Alternative values are `production`, `test`, and `debug`.

Key `formats` must contain an array of [data formats](#data-formats) or a file containing such array (JSON, NDJSON or YAML format). The list of formats is automatically extended by some hardcoded formats and schema languages.

Some validators stop after finding the first error. Key `allErrors` configures validators to continue validation to find more errors.

Additional keys `provider` and `links` can be used to adjust the HTML footer.

A JSON Schema to validate configuration is included at [`config/config-schema.json`](config/config-schema.json).

## Usage

This node package is mainily designed to be run as web service but it can also be [used as module](#use-as-module). See [API Reference](#api) for usage of a running server instance instead.

### Run Server

```bash
# Development server with hot reload and auto reconnect at localhost:3700 (default)
npm run start

# To run the server in production, run this:
NODE_ENV=production node ./server.js
```

On startup all configured schemas are downloaded and cached in directory configured with `cache` (set to `false` to use a temporary directory). Addition and updates require to restart the server.

### Deployment

To provide the service behind a nginx web server at path `/validate/` (like at <http://format.gbv.de/validate/>), add this to nginx configuration file:

```
location /validate {
    port_in_redirect off;
    return /validate/;
}
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

The server needs to be restarted to reflect updates in [configuration](#configuration), including formats and schemas to be supported. Script `bin/update.js` can help updating formats and local schema files without breaking things.

### Use as Module

*The internal API is not stable yet!*

```js
const { loadConfig, validateConfig, createService, knownFormats } = require("validation-server")

const config = loadConfig()

createService(config).then(service => {
  const format = service.getFormat("json-schema", { version: "draft-07" })

  // asynchronous validation
  format.valid(data)
    .then(() => console.log("ok"))
    .catch(e => console.error(e.errors))

  // validate a stream of records
  const resultStream = inputStream.pipe(format.validateStream)
})
```

#### loadConfig

Returns a valid configuration object. Location of an optional configuration file can be given as argument (or by setting environment variable `NODE_ENV` to `debug` or `test`):

```js
const config = loadConfig("./config.json")
```

An error is thrown on invalid configuration.

#### validateConfig

Validate a configuration object. Throws an error if configuration is not valid. Returns the passed configuration otherwise.

#### createService

Given a [configuration](#configuration) object, `createService` returns a promise to an initialized service object with methods:

- `getFormat` returns format (or `undefined`), queried by `format` identifier and optional `version` (set to `default` if not specified)

- `listFormats` returns a list of formats, optionally filtered (see [GET /formats](#get-formats) for query parameters)

Schemas of format objects can have an additional `validate` method to validate data in this format.

#### knownFormats

Object with predefined data formats.

### Command Line Interface

The module includes an experimental command line interface:

```bash
npm run validate -- --help  # run from repository
validate --help             # if installed via npm
```

### Run Tests

Tests requires `xmlint` to be installed. Then:

```bash
npm test
npm run debug    # test with logging enabled
npm run coverage # test with code coverage report
```

## API

The response status code should always be 200 (possibly including [validation errors](#validation-errors), unless there was an [API error](#api-errors) such as wrong request parameters or unexpected internal failures.

### GET /validate

Endpoint to validate records passed via query parameter or URL.

**Query parameters**

* `format` format identifier

* `url` Optional URL to load data from

* `data` Data to be validated. Ignored when parameter `url` is given.

* `select` Optional selection of records within the posted data. Only supported for JSON-based formats with JSONPath `select=$` (default: data is one record) and `select=$.*` (records are array or object elements).

* `encoding` Optional alternative encoding for (experimental). Supports `yaml` and `ndjson` for json-based formats, so far.

**Response**

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
      "position": { "rfc5147": "char=1", "linecol": "1:2" }
    }
  ]
]
```

JSON parsing errors are returned with [location](#locator-languages).

The service does not guarantee to return all validation errors but it may stop at the first error.

### POST /{format}

Validate records like [GET /validate](#validate) but data is send via HTTP POST payload or as `multipart/form-data`.

**Query parameters or multipart form fields**

* `format` format identifier. Can also be specified in the URL path, e.g. `/json` is identical to `/?format=json`.

* `version` optional version identifier. Can also be given as part of format as `format@version`

* `select` optional selection of records within the posted data.

* `file` File to be validated (form data only)

* `data` Data to be validated (form data only)

* `encoding` Optional alternative encoding (experimental)

**Response**

Same as response of [GET /validate](#get-validate).

**Examples**

This file `schema.json` contains valid JSON but not a valid JSON Schema:

```
{
  "properties": []
}
```

```sh
curl -X POST 'http://format.gbv.de/validate/json-schema' --data-binary @schema.json
```

```json
[
  {
    "message": "must be object",
    "position": {
      "jsonpointer": "/properties"
    }
  }
]
```

This file `articles.json` contains two records in `vzg-article` format, one invalid and one valid:

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

To validate both records in one query, parameter `select=$.*` must be added:

```sh
curl -X POST 'http://format.gbv.de/validate/vzg-article?select=$.*' --data-binary @articles.json
```

```json
[
  [
    {
      "message": "must have required property 'primary_id'",
      "position": {
        "jsonpointer": ""
      }
    }
  ],
  true
]
```

### GET /formats

Lists all [data formats](#data-formats), optionally filtered by identifier, version, and/or schema type.

**Query Parameters**

* `format=[id]` select format with given format identifier

* `version=[id]` version to filter for

* `type=[string]` schema type filter for

**Success Response**

JSON Array of format objects.

### GET /languages

List schema languages as array of [data formats](#data-formats). The result is a subset of [GET /formats](#get-formats) with same query parameters and response format.

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

### Validation Errors

Validation results (see [GET /validate](#get-validate) and [POST /{format}](#post-format)) can include validation errors. Each error is a JSON object with

* `message` mandatory error message
* `type` optional type of error, given as IRI
* `position` optional object mapping locator formats to [locators](#locator-languages) (e.g.`rfc5147` to locate character positions in a string or `jsonpointer` to reference elements in a JSON document)

Errors may contain additional keys but these may change with future versions of the service!

For instance the following validation error indicates that value of JSON key `authors` was not given as array:

```json
{
  "message": "must be array",
  "position": {
    "jsonpointer": "/authors"
  }
}
```

### API Errors

Non-validation errors such as wrong request parameters or unexpected internal failures are returned as JSON object such as the following:

```json
{
  "error": "MalformedRequest",
  "code": 400,
  "message": "Missing query parameter: format"
}
```

API error types include `MalformedRequest` and `NotFound`.

A stack trace is included in development mode.

## Maintainers

- [@nichtich](https://github.com/nichtich)

## Contributing

PRs accepted against the `dev` branch. Never directly work on the main branch.

For releases (maintainers only) make changes on `dev` and then run the release script:

```bash
npm run release:patch # or minor or major
```

## License

MIT © 2022 Verbundzentrale des GBV (VZG)
