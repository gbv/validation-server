import { MalformedRequest } from "../errors.js"
import xmllint from "../xmllint.js"
import xml from "./xml.js"
import unbuffer from "../unbuffer.js"
import { URL } from "url"

// Extract external references
async function xsdReferences(file) {
  const xpath = "//*[namespace-uri()='http://www.w3.org/2001/XMLSchema' and (local-name()='import' or local-name()='redefine' or local-name()='redefine')]/@schemaLocation"
  return xmllint({ xpath, file })
    .then(out => [...out.matchAll(/schemaLocation="(.+)"/g)].map(s => s[1]))
}

async function loadXSD(url, logger, cache) {
  const found = await cache.get(url)
  if (found) {
    return found.path
  }

  logger.debug(`Loading XSD ${url}`)
  return cache.fetch(url).then(async ({path}) => {

    // TODO: rewrite external references to absolute URLs

    /* FIXME: make sure schema is valid XSD
    const metaschema = await cache.get("https://www.w3.org/2009/XMLSchema/XMLSchema.xsd")
    const catalog = await cache.get("catalog.xml")
    console.log({ schema: metaschema.path, data: path, catalog: catalog.path })

    await xmllint({ schema: metaschema.path, data: path, catalog: catalog.path })
      .catch(e => {
        const msg = `Invalid XSD from ${url}`
        throw new Error(msg)
      })
    */

    const refs = await xsdReferences(path)
    return Promise.all(refs.map(ref => loadXSD(new URL(ref, url).href, logger, cache)))
      .then(() => path)
  })
}

async function createValidator({ url, cache, logger }) {

  if (!url) {
    throw new Error("XSD validator requires url")
  }

  logger.debug(`Processing XSD ${url}`)

  const schema = await loadXSD(url, logger, cache)
    .catch(e => { console.error(e); throw e })

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
  mimetypes: ["application/xml"],
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
