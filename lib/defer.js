export default function deferred () {
  let resolve, reject
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  return { resolve, reject, promise }
}
