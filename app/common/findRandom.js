const random = (max) => Math.floor(Math.random() * (max + 1))

const shuffle = (a) => {
  let length = a.length
  const shuffled = Array(length)
  for (let i = 0, rand; i < length; ++i) {
    rand = random(i)
    if (rand !== i) shuffled[i] = shuffled[rand]
    shuffled[rand] = a[i]
  }
  return shuffled
}

const findRandom = (array, limit) => {

  let count = array.length

  if (count < limit) limit = array.length

  let selected = []

  for(i = 0; i < limit; ++i) {
    array = shuffle(array)
    selected.push(array.pop())
  }

  return selected
}

module.exports = {
  findRandom,
  shuffle
}
