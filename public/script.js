/* eslint-disable */
const { validateFile, validateData } = document.forms
for (let [form, method] of [[validateFile,"POST"],[validateData,"GET"]]) {
  if (form) {
    form.addEventListener("submit", e => submitValidate(e, form, method))
  }
}

function onChange(element, listener) {
  element = document.getElementById(element)
  if (element) {
    element.addEventListener("change", () => listener(element))
    listener(element)
  }
}

function setText(selector, text) {
  document.querySelectorAll(selector).forEach(e => { e.textContent = text })
}

const query = { encoding: "", select: "" }
function setQueryOption(key, value) {
  query[key] = value
  const fields = Object.keys(query).filter(key => query[key] !== "")
  setText(".query", fields.length ? "?" + fields.map(key => key + "=" + query[key]).join("&") : "")
}

onChange("jsonArray", ({checked}) => {
  const value = checked ? "$.*" : ""
  validateData.elements.select.value = value
  validateFile.elements.select.value = value
  setText(".and-select", checked ? "&select=$.*" : "")
  setQueryOption("select", value)
})

onChange("encodingSelect", ({value}) => {
  const encoding = value && value !== "default" ? value : ""
  validateData.elements.encoding.value = encoding
  validateFile.elements.encoding.value = encoding
  setText(".and-encoding", encoding ? "&encoding=" + encoding : "")
  setQueryOption("encoding", encoding)
})

onChange("versionSelect", element => {
  const version = element.value
  const isDefault = version == "" || version == "default"

  validateData.elements.version.value = version

  validateFile.action = validateFile.action.replace(/@[^@]+$/,"")
  if (!isDefault) {
    validateFile.action += "@" + version
  }

  setText(".at-version", isDefault ? "" : "@" + version)
  setText(".and-version", isDefault ? "" : "&version=" + version)
})


function messageDiv(type, content) {
  const div = document.createElement("div")
  div.className = "msg " + type
  div.innerText = content
  return div
}

function submitValidate(evnt, form, method) {
  if (typeof fetch === "undefined") return

  if (document.getElementById("rawResult").checked) return
  evnt.preventDefault()

  const result = document.getElementById("validationResult")
  result.replaceChildren(messageDiv("", "loading..."))

  var request
  if (method === "GET") {
    const url = form.action + "?" + new URLSearchParams(new FormData(form))
    request = fetch(url)
  } else {
    request = fetch(form.action, { method: "POST", body: new FormData(form) })
  }

  const format = document.querySelector("#format-title").textContent

  request
    .then(res => res.json())
    .then(res => {
      if (!Array.isArray(res)) throw(res)

      if (res.every(record => record === true)) {
        result.replaceChildren(messageDiv("valid", `✌ Data is valid ${format}`))
      } else {
        // TODO: if number of records is too large don't show all
        var i=0
        result.replaceChildren(...res.map(record => {
          i++;
          if (record === true) return
          return record.map(({message, position}) => {
            if (position) {
              const pos = Object.entries(position)
                .map(e=>`${e[0]}: \"${e[1]}\"`).join(", ")
               message = `${message} (${pos})`
            }

            return messageDiv("invalid", `☹  #${i}: ${message}`)
          })
        }).flat().filter(Boolean))
      }
    })
    .catch(function(e) {
      result.replaceChildren(messageDiv("invalid", e.message))
    })
}
