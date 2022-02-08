# Validation Service

[![Test](https://github.com/gbv/validation-service/actions/workflows/test.yml/badge.svg)](https://github.com/gbv/validation-service/actions/workflows/test.yml)
[![GitHub package version](https://img.shields.io/github/package-json/v/gbv/validation-service.svg?label=version)](https://github.com/gbv/validation-service)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme)

> Web service to validate data against schemas

This validation service provides methods to validate records against different kinds of schemas to ensure that they conform to known data formats.

## Table of Contents

- [Install](#install)
  - [From GitHub](#from-github)
  - [Configuration](#configuration)
  - [Formats](#formats)
- [Usage](#usage)
  - [Run Server](#run-server)
  - [Run Tests](#run-tests)
- [API](#api)
  - [GET /validate](#get-validate)
  - [POST /validate](#post-validate)
  - [GET /formats](#get-formats)
  - [GET /schema](#get-schema)
  - [Validation errors](#validation-errors)
  - [API errors](#api-errors)
- [Deployment](#deployment)
- [Maintainers](#maintainers)
- [Contribute](#contribute)
- [License](#license)

## Install

Requires at least Node 12.

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
  "description": null,
  "version": null,
  "port": 3700,
  "proxies": [],
  "verbosity": "log",
  "formats": [],
  "formatsDirectory": "./formats",
  "update": "startup",
  "types": [
    { "id": "json-schema" }
  ]
}
```

Keys `version` and `description` are defaulted to its value in `package.json`. In addition the environment variable `NODE_ENV` is respected with `development` as default. Alternative values are `production` and `test`.

### Formats

A format, as specified in array `formats` of the specification must be a JSON Object with keys:

* `id` format identifier
* `schemas` an array of schemas, each with
  * `version` optional version number or name
  * `type` Schema type (`json-schema` or `xsd`)
  * `url` where to retrieve the schema file from
  * `title` optional title
  * `title` optional short title
  * `contentType` optional content type
  * `base` optional base format (e.g. "json" for JSON-based formats)
  * `for` optional serialization format (for schema languages)

## Usage

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
```

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

### POST /validate

Endpoint to validate records like [GET /validate](#validate) but data is send via HTTP POST payload.

**Query Parameters**

* `format=[string]` a known data format (required)

**Success Response**

Same as response of [POST /validate](#post-validate).

**Examples**

```sh
curl -X POST 'http://format.gbv.de/validate/validate?format=json' -d '[]'
```

...

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

### Validation errors

Validation results (see [GET /validate](#get-validate) and [POST /validate](#post-validate)) can include validation errors. Each error is a JSON object with

* `message` mandatory error message
* `error` optional type of error
* `position` optional locator of the error
* `positionFormat` optional locator format (e.g. `rfc5147` to locate character positions in a string or `jsonpointer` to reference elements in a JSON document)

Errors may contain additional keys but these may change with future versions of the service.

### API errors

Non-validation errors such as wrong request parameters or unexpected internal failures are returned as JSON object such as the following:

```json
{
  "error": "MalformedRequest",
  "status": 400,
  "message": "Missing query parameter: format"
}
```

A stack trace is included in development mode.

## Deployment

To provide the service behind a nginx web server at path `/validate/` (like at <http://format.gbv.de/validate/>), add this to nginx configuration file:

```
	location /validate/ {
		proxy_pass http://127.0.0.1:3700/;
	}
```

We recommend to use [PM2](https://pm2.keymetrics.io/) to start and update the service:

```bash
pm2 start ecosystem.config.json
```

To update an instance deployed with PM2:

```bash
# get updates from repository
git pull

# install dependencies
npm ci

# restart the process (adjust process name if needed)
pm2 restart validation-service
```

Automatic update of formats and schemas has *not been implemented yet (<https://github.com/gbv/validation-service/issues/8>).*

## Maintainers

- [@nichtich](https://github.com/nichtich)
- [@stefandesu](https://github.com/stefandesu)

## Contribute

PRs accepted against the `dev` branch. Never directly work on the main branch.

For releases (maintainers only) make changes on `dev` and then run the release script:

```bash
npm run release:patch # or minor or major
```

## License

MIT © 2022 Verbundzentrale des GBV (VZG)
