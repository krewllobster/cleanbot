const {
  authController,
  commandController,
  actionController,
} = require('../controllers')

module.exports = (app) => {

  //public page
  app.get('/', (req, res) => {
    console.log('rendering root')
    res.render('root')
  })

  app.get('/auth', (req, res) => {
    authController(req, res)
  })

  app.post('/slack/actions', (req, res) => {
    actionController(req, res)
  })

  app.post('/slack/command', (req, res) => {
    commandController(req, res)
  })
}
