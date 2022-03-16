import chai from "chai"
import chaiAsPromised from "chai-as-promised"
chai.use(chaiAsPromised)
const { expect } = chai

import path from "path"
import fs from "fs"
import { URL } from "url"
const __dirname = new URL(".", import.meta.url).pathname

const file = name => path.resolve(__dirname, name)
const jsonFile = path => JSON.parse(fs.readFileSync(file(path)))

export { chai, expect, file, jsonFile }
