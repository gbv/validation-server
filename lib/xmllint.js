import child_process from "child_process"
import { ValidationError } from "./errors.js"

// TODO: extract more error details
// See https://gitlab.gnome.org/GNOME/libxml2/-/blob/master/error.c#L245
function mapError(msg) {
  const messageFormat = /^(.+?):([0-9]+): (.+?)\n?$/m
  const match = messageFormat.exec(msg)
  const error = { message: match ? match[3] : msg }
  if (match) {
    error.position = {
      rfc5147: `line=${match[2]}`,
    }
  }
  return new ValidationError(error)
}

function escapeShellArg(arg) {
  arg = arg.replace(/'/g, "'\\''")
  return `'${arg}'`
}

const xmllint = ({schema, data, path, xpath, catalog}) => new Promise((resolve, reject) => {
  const args = ["--nonet"]
  const options = {
    shell: true,
    env: {
      SGML_CATALOG_FILES: "",
      XML_CATALOG_FILES: catalog ?? "",
      XML_DEBUG_CATALOG: undefined,  // for testing
    },
  }

  if (schema) {
    args.push("--schema", schema)
  }

  if (xpath) {
    args.push("--xpath", xpath)
  } else {
    args.push("--noout")
  }

  // we only want errors
  args.push("--nowarning")

  if (data) {
    args.push("-")
  } else if (path) {
    args.push(path)
  } else {
    reject(new Error("xmllint requires path or data to process"))
  }

  const cmd = child_process.spawn("xmllint", args.map(escapeShellArg), options)

  let out = ""
  cmd.stdout.on("data", data => (out += data.toString()))
  cmd.stderr.on("data", data => (out += data.toString()))
  cmd.on("error", reject)
  cmd.on("close", code => {
    // console.warn(out)
    if (code === 0) {
      return resolve(out)
    } else {
      if (xpath && code == 10 && /^XPath set is empty/.test(out)) {
        return resolve("")
      }
      return reject(mapError(out))
    }
  })

  if (data) {
    cmd.stdin.end(data)
  }
})

export default xmllint
