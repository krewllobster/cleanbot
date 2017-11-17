const path = require('path')

const {
  authController,
  commandController,
  actionController,
  leaderBoardController,
} = require('../controllers')

module.exports = (app) => {

  //public page
  app.get('/', (req, res) => {
    console.log('rendering root')
    res.render('root')
  })

  app.get('/leaderboards/images/*.png', (req, res) => {
    res.sendFile(path.join(__dirname, '../../leaderboards', req.params['0'] + '.png'))
  })

  app.get('/leaderboards/*', (req, res) => {
    leaderBoardController(req, res)
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
