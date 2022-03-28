/* eslint-disable */
Object.entries({
  validateFile: "POST",
  validateData: "GET"
}).forEach(([id, method]) => {
  const form = document.forms[id]
  if (form) {
    form.addEventListener("submit", e => submitValidate(e, form, method))
  }
})

const versionSelect = document.getElementById("versionSelect")
if (versionSelect) {
  function selectVersion() {
    const version = versionSelect.value
    const isDefaultVersion = version == "" || version == "default"

    document.forms.validateData.elements.version.value = version

    const validateFile = document.forms.validateFile

    validateFile.action = validateFile.action.replace(/@[^@]+$/,"")
    if (!isDefaultVersion) {
      validateFile.action += "@" + version
    }

    document.querySelectorAll(".at-version").forEach(e => {
      e.textContent = isDefaultVersion ? "" : "@" + version
    })
    document.querySelectorAll(".and-version").forEach(e => {
      e.textContent = isDefaultVersion ? "" : "&version=" + version
    })
  }

  versionSelect.addEventListener("change", selectVersion)
  selectVersion()
}

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
