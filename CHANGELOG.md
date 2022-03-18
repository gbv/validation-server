# Changelog

## 0.6.0

- Support validing with XML Schema (based on xmllint)
- UI: Support validating via GET request
- UI: Ceanup and extension
- Rename configuration `cachePath` to `cache` and allow `false` for non-persistent cache

## 0.5.1

- Support JSKOS format validation
- Support selection of JSON array elements in file upload form

## 0.5.0

- Support validation via file upload
- Improve command line client
- More refactoring

## 0.4.2

- Fix HTML Links in format pages with / in format identifier
- Add "Data About Data Formats" as format with Schema
- Add command line interface

## 0.4.1

- Improve HTML layout and add format pages
- Extend format description
- Support validating XML

## 0.4.0

- API: Renamed /types endpoint to /languages
- API: Moved POST /validate to POST /:format
- API: Validate multiple records given as JSON array requires new parameter `select`
- API: Change result format of error positions
- Major internal refactoring
- Modified configuration file format
