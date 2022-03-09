/* eslint-disable */
const validateFileForm = document.forms["validateFile"]

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
      if (res[0] === true) {
        result.className = "msg valid"
        result.innerHTML = `✌ File is valid ${format}`
      } else {
        result.className = "msg invalid"
        message = res[0].map(({message, position}) => {
          if (position) {
            const pos = Object.entries(position)
              .map(e=>`${e[0]}: ${e[1]}`).join(", ")
            message = `${message} (${pos})`
          }
          return `☹  ${message}`
        }).join(" ")
        result.innerText = message
      }
    })
    // TODO: catch error
})
