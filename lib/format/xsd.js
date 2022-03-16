import { MalformedRequest } from "../errors.js"
import xmllint from "../xmllint.js"
import xml from "./xml.js"
import unbuffer from "../unbuffer.js"


// Extract external references
async function xsdReferences(file) {
  const xpath = "//*[namespace-uri()='http://www.w3.org/2001/XMLSchema' and (local-name()='import' or local-name()='redefine' or local-name()='redefine')]/@schemaLocation"
  return xmllint({ xpath, file })
    .then(out => [...out.matchAll(/schemaLocation="(.+)"/g)].map(s => s[1]))
}

async function cacheReferences(schema, logger, cache) {
  // TODO: apply recursively without getting trapped in a loop
  const refs = await xsdReferences(schema)
    .catch(e => {
      logger.warn(e)
      throw new Error("Missing xmllint or XSD is no wellformed XML")
    })
  return Promise.all(refs.map(async url => {
    logger.debug(`Caching referenced XSD ${url}`)
    return cache.fetch(url)
  }))
}

async function createValidator({ url, cache, logger }) {

  if (!url) {
    throw new Error("XSD validator requires url")
  }

  logger.info(`Processing XSD ${url}`)

  const schema = await cache.fetch(url).then(({path}) => path)

  await cacheReferences(schema, logger, cache)

  // TODO: make sure schema is valid XSD

  return (async (data, select) => {
    if (typeof select !== "undefined" && select !== null) {
      throw new MalformedRequest("Validator does not support selection")
    }
    try {
      data = unbuffer(data)
      xml.parse(data)
    } catch(e) {
      return [[e]]
    }

    const catalog = await cache.get("catalog.xml")
    return xmllint({ schema, data, catalog: catalog.path })
      .then(() => [true])
      .catch(e => [[e]])
  })
}

export default {
  title: "XML Schema",
  short: "XSD",
  base: "xml",
  restricts: "xml",
  url: "https://www.w3.org/XML/Schema",
  description: "Most common schema language for XML",
  wikidata: "Q16342",
  versions: {
    1.1: {
      schemas: [
        {
          url: "http://www.w3.org/2009/XMLSchema/XMLSchema.xsd",
          type: "xsd",
        }, {
          url: "http://www.w3.org/2009/XMLSchema/XMLSchema.dtd",
          type: "dtd",
        },
      ],
    },
    "1.0": {
      schemas: [
        {
          url: "http://www.w3.org/2001/XMLSchema.xsd",
          type: "xsd",
        },
        {
          url: "http://www.w3.org/2001/XMLSchema.dtd",
          type: "dtd",
        },
      ],
    },
  },
  createValidator,
}
