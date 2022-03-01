export function stringData(data) {
  return data instanceof Buffer ? data.toString() : data
}

export function jsonPathQuery(data, path="$") {
  if (path === "$") {
    return [data]
  } else if (path === "$.*") {
    if (Array.isArray(data)) {
      return data
    } else if (data instanceof Object) {
      return Object.values(data)
    } else {
      return []
    }
  } else {
    throw new Error("Invalid or unsupported select path. Try '$.*' or '$'!")
  }
}


