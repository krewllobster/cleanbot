module.exports = (prom) => {
  return prom.then(data => {
    return [null, data]
  }).catch(err => {
    return [err]
  })
}
