export const asArray = x => Array.isArray(x) ? x : [x]

export const addToArray = (obj, key, value) => {
  if (key in obj) {
    obj[key] = asArray(obj[key])
    obj[key].push(value)
  } else {
    obj[key] = [value]
  }
}
