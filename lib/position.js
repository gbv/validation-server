export function lineColFromIndex(str, index) {
  const lines = str.split("\n")

  let totalLength = 0
  let lineStart = 0

  // Returned position may be one character after the end!
  if (index <= 0) {
    return "1:1"
  } else if (index >= str.length) {
    return `${lines.length}:${lines[lines.length-1].length+1}`
  }

  for (var i = 0; i < lines.length; i++) {
    totalLength += lines[i].length + 1
    if (index < totalLength) {
      return `${i+1}:${index-lineStart+1}`
    }
    lineStart = totalLength
  }
}
