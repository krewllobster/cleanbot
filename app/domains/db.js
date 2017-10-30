const { to } = require('../utils')

const dbInterface = () => {
  const models = require('../models')

  return {
    execute: async ({entity, operation, match, update, options}) => {
      if(models[entity] && models[entity][operation]) {
        const [err, response] = await to(models[entity][operation](match, update, options))
        if (err) return err
        return response
      } else {
        return  new Error('model or operation does not exist')
      }
    }
  }
}
// class dbInterface {
//   constructor() {
//     Object.keys(models).forEach(m => {
//       this[m] = models[m]
//     })
//   }
//
//   async execute(command) {
//     const {entity, operation, match, update, options} = command
//     if(this[entity] && this[entity][operation]) {
//       let [err, response] = await to(this[entity][operation](match, update, options))
//       if (err) return err
//       return response
//     } else {
//       return new Error('model or operation does not exist')
//     }
//   }
// }
//
// const dbInt = new dbInterface()

module.exports = dbInterface()
