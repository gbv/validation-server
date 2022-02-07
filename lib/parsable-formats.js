module.exports = {
  json: {
    id: "json",
    async parse(data) {
      if (typeof data === "object") {
        return Array.isArray(data) ? data : [data]
      } else {
        data = JSON.parse(data)
        return Array.isArray(data) ? data : [data]
      }
    },
  },
}
