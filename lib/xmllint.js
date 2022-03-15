import child_process from "child_process"

const xmllint = ({schema, data, file, xpath, catalog}) => new Promise((resolve, reject) => {
  const args = ["--nonet"]
  const options = {
    shell: true,
    env: {
      SGML_CATALOG_FILES: "",
      XML_CATALOG_FILES: catalog ?? "",
      XML_DEBUG_CATALOG: "1",  // for testing
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

  if (data) {
    args.push("-")
  } else if (file) {
    args.push(file)
  } else {
    reject(new Error("xmllint requires file or data to process"))
  }

  const cmd = child_process.spawn("xmllint", args, options)

  let out = ""
  cmd.stdout.on("data", data => (out += data.toString()))
  cmd.stderr.on("data", data => (out += data.toString()))
  cmd.on("error", reject)
  cmd.on("close", code => {
    if (code === 0) {
      return resolve(out)
    } else {
      return reject(new Error(out))
    }
  })

  if (data) {
    cmd.stdin.end(data)
  }
})

export default xmllint
