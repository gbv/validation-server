import { MalformedRequest } from "../errors.js"
import xmllint from "../xmllint.js"
import xml from "./xml.js"
import unbuffer from "../unbuffer.js"
import { URL } from "url"
import fs from "fs"

async function loadXSD(url, logger, cache) {

  // Get from cache if schema has been loaded and validated
  const found = await cache.get(url)
  if (found && found.metadata.valid) return found.path

  // Download otherwise
  logger.debug(`Loading XSD ${url}`)
  const {path, metadata} = await cache.fetch(url)

  // Make sure schema is valid XSD
  const metaschema = await cache.get("http://www.w3.org/2009/XMLSchema/XMLSchema.xsd")
  const catalog = await cache.get("catalog.xml")
  await xmllint({ schema: metaschema.path, path, catalog: catalog.path })
    .catch((e) => {console.log(e);throw new Error(`Invalid XSD ${url}`)})

  // Rewrite external references to absolute URLs
  // Yes, manipulating XML with regex is not a nice way but...
  const refs = {}
  const xml = fs.readFileSync(path).toString()
  const pattern = /(\sschemaLocation\s*=\s*)"([^"]*)"/gm
  const rewritten = xml.replace(pattern, (match, attr, href) => {
    const absolute = new URL(href, url).href
    if (absolute !== url) { // condition because of http://www.w3.org/2001/xml.xsd
      refs[href] = absolute
    }
    return `${attr}"${absolute}"`
  })

  // Recursively load external references
  const hrefs = Object.values(refs)
  if (hrefs.length) {
    Object.entries(refs)
      .map(([ref, absolute]) => ref !== absolute ? [ref, absolute] : [absolute])
      .map(urls => logger.debug([url, ...urls].join(" => ")))
    await Promise.all(hrefs.map(href => loadXSD(href, logger, cache)))
  }

  // Store rewritten schema, marked as valid
  await cache.put(url, rewritten, { ...metadata, valid: true })
  logger.debug(`Got valid XSD ${url}`)

  return path
}

async function createValidator({ url, cache, logger }) {

  if (!url) {
    throw new Error("XSD validator requires url")
  }

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
