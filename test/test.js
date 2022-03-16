import chai from "chai"
import chaiAsPromised from "chai-as-promised"
chai.use(chaiAsPromised)
const { expect } = chai

import path from "path"
import fs from "fs"
import { URL } from "url"
const __dirname = new URL(".", import.meta.url).pathname

const file = name => path.resolve(__dirname, name)
const readFile = path => fs.readFileSync(file(path))
const jsonFile = path => JSON.parse(readFile(path))

export { chai, expect, file, readFile, jsonFile }
