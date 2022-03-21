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

    const validateData = document.forms.validateData
    const validateFile = document.forms.validateFile

    var dataAction = validateData.action.replace(/&version=.+$/,"")
    var fileAction = validateFile.action.replace(/@[^@]+$/,"")

    if (!isDefaultVersion) {
      dataAction = dataAction + "&version=" + version
      fileAction = fileAction + "@" + version
    }
    validateFile.action = fileAction
    validateData.action = dataAction

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

function messageDiv(valid, content) {
  const div = document.createElement("div")
  div.className = valid ? "msg valid" : "msg invalid"
  div.innerText = content
  return div
}

function submitValidate(evnt, form, method) {
  if (typeof fetch === "undefined") return

  if (document.getElementById("rawResult").checked) return
  evnt.preventDefault()

  var request
  if (method === "GET") {
    const url = form.action + "?" + new URLSearchParams(new FormData(form))
    request = fetch(url)
  } else {
    request = fetch(form.action, { method: "POST", body: new FormData(form) })
  }

  const format = document.querySelector("#format-title").textContent
  const result = document.getElementById("validationResult")
  result.innerHTML = ""

  request
    .then(res => res.json())
    .then(res => {
      if (!Array.isArray(res)) throw(res)

      if (res.every(record => record === true)) {
        result.replaceChildren(messageDiv(true, `✌ Data is valid ${format}`))
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

            return messageDiv(false, `☹  #${i}: ${message}`)
          })
        }).flat().filter(Boolean))
      }
    })
    .catch(function(e) {
      result.replaceChildren(messageDiv(false, e.message))
    })
}
