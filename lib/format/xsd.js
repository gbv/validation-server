import { MalformedRequest } from "../errors.js"
import xmllint from "../xmllint.js"
import xml from "./xml.js"
import unbuffer from "../unbuffer.js"

/*
function xmlcatalog(uris) {
  const entries = Object.entries(uris)
    .map(([uri,path]) => `<system systemId="${uri}" uri="file://${path}"/>`)
    .join("\n")

  return `<?xml version="1.0"?>
<!DOCTYPE catalog PUBLIC "-//OASIS//DTD Entity Resolution XML Catalog V1.0//EN" "http://www.oasis-open.org/committees/entity/release/1.0/catalog.dtd">
<catalog xmlns="urn:oasis:names:tc:entity:xmlns:xml:catalog">
${entries}
</catalog>`
}
*/

async function createValidator({ url, cache, logger }) {

  if (!url) {
    throw new Error("XSD validator requires url")
  }

  const schema = await cache.fetch(url).then(({path}) => path)

  logger.info(`Compiling XSD ${url}`)

  // TODO: extract xsd:include, xsd:import, xsd:refine
  // await xmllint({ xpath: "/", file: schema })
  //  .then(out => console.log(out))

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

    return xmllint({ schema, data })
      .then(() => [true])
      .catch(e => {
        return [[{message: e.message}]]
      })
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
