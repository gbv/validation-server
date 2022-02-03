# Validation Service

[![Test](https://github.com/gbv/validation-service/actions/workflows/test.yml/badge.svg)](https://github.com/gbv/validation-service/actions/workflows/test.yml)
[![GitHub package version](https://img.shields.io/github/package-json/v/gbv/validation-service.svg?label=version)](https://github.com/gbv/validation-service)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme)

> Web service to validate data against schemas

## Table of Contents

- [Install](#install)
  - [From GitHub](#from-github)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Run Server](#run-server)
  - [Run Tests](#run-tests)
- [API](#api)
  - [POST /validate](#post-validate)
  - [GET /validate](#get-validate)
  - [GET /formats](#get-formats)
  - [Errors](#errors)
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

The service must be customized via configuration files. By default, this configuration file resides in `config/config.json`. However, it is possible to adjust this path via the `CONFIG_FILE` environment variable. Missing keys are defaulted from `config/config.default.json`:

```json
{
  "title": "Validation Service",
  "description": null,
  "version": null,
  "port": 3700,
  "proxies": [],
  "verbosity": "log",
  "caching": false,
  "formats": []
}
```

Keys `version` and `description` are defaulted to its value in `package.json`. In addition the environment variable `NODE_ENV` is respected with `development` as default. Alternative values are `production` and `test`.

## Usage

### Run Server

```bash
# Development server with hot reload and auto reconnect at localhost:3700 (default)
npm run start

# To run the server in production, run this:
NODE_ENV=production node ./server.js
```

### Run Tests

```bash
npm test
```

## API

Unless otherwise specified:
- `GET` requests will return code 200 on success.
- `POST` requests will return code 201 on success.
- `DELETE` requests will return code 204 on success.
- `POST`/`PUT`/`PATCH` requests require a JSON body.
- Alternatively, `POST` can also receive the following inputs:
  - any kind of JSON stream
  - mutlipart/form-data with the file in `data`
  - a URL with JSON data as `url` in the request params

### POST /validate

Endpoint to validate records.

* **URL Params**

  `format=[string]` a known data format (required)

* **Success Response**

  Array of same length as the posted data and validation result formeach record.  An element is `true` when the object passed validation, or an array of errors when the object failed validation. Data format of error objects may change in future versions but there is always at least field `message`.

### GET /validate

Endpoint to validate records like [POST /validate](#post-validate) but data is passed via URL or query parameter.

* **URL Params**

  `url=[url]` URL to load data from

  `data=[string]` Serialized data to be validated. Ignored when parameter `url` is given.

* **Success Response**

  Same as response of [POST /validate](#post-validate).

### GET /formats

Lists all formats as JSON Array.

### Errors

Non-validation errors such as invalid request parameters or unexpected internal failures are returned as JSON object such as the following:

```json
{
  error: "MalformedRequestError",
  status: 400,
  message: "Missing query parameter: format"
}
```

A stack trace is included in development mode.

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
