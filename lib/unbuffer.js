export default function unbuffer(data) {
  return data instanceof Buffer ? data.toString() : data
}
