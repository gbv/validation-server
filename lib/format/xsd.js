//import xml from "./xml.js"

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
}
