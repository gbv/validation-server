/* eslint-disable */
const validateFileForm = document.forms["validateFile"]

function messageDiv(valid, content) {
  const div = document.createElement("div")
  div.className = valid ? "msg valid" : "msg invalid"
  div.innerText = content
  return div
}

validateFileForm.addEventListener("submit", function(evnt) {
  if (typeof fetch === "undefined") return
  if (validateFileForm.rawResult.checked) return

  evnt.preventDefault()
  const format = document.querySelector("h2").textContent
  const result = document.getElementById("validationResult")
  result.innerHTML = ""

  const url = window.location.href.split("?")[0]
  fetch(url, { method: "POST", body: new FormData(validateFileForm) })
    .then(res => res.json())
    .then(res => {
      if (!Array.isArray(res)) throw(res)

      if (res.every(record => record === true)) {
        result.replaceChildren(messageDiv(true, `✌ File is valid ${format}`))
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
})
