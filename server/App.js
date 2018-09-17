import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { Server as httpServer } from 'http'
import {
  postMatch,
  getMatches,
} from 'Server/api'
import {
  resolveLadderFromMatches,
} from 'Server/utils'


const PORT = process.env.PORT || 3000
const app = express()
const server = httpServer(app)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('dist/client'))



app.post('/api/match', async (req, res) => {
  console.info('POST /api/match')

  const {
    text,
  } = req.body

  if (!text) {
    return res.sendStatus(400)
  }

  const players = text
    .split(' ')
    .filter(x => Boolean(x.trim()))
    .map(x => x.toLowerCase().trim().replace(/[^a-z]/gi, ''))

  if (players.length !== 2) {
    return res.sendStatus(400)
  }

  const winner = players[0]
  const loser = players[1]

  try {
    await postMatch(winner, loser)
    res.status(200).json({
      text: `Got it, ${winner} won ${loser} 🏆 \n _ps. notify luffis if you made a mistake_`
    })
  } catch (error) {
    console.error('[ERROR]', error)
    res.sendStatus(500)
  }
})

app.get('/api/matches', async (req, res) => {
  console.info('GET /api/matches')
  try {
    const matches = await getMatches()
    res.status(200).json(matches)
  } catch (error) {
    console.error('[ERROR]', error)
    res.sendStatus(500)
  }
})

app.post('/api/ladder', async (req, res) => {
  console.info('POST /api/ladder')
  let matches
  try {
    matches = await getMatches()
  } catch (error) {
    console.error('[ERROR]', error)
    return res.sendStatus(500)
  }
  const ladder = resolveLadderFromMatches(matches)
  res.status(200).json({
    text: '>>> \n' + ladder
      .map((name, i) => `${i+1}. ${name}${i === 0 ? ' 👑' : ''}`)
      .join('\n')
  })
})

app.get('/api/ladder', async (req, res) => {
  console.info('GET /api/ladder')
  let matches
  try {
    matches = await getMatches()
  } catch (error) {
    console.error('[ERROR]', error)
    return res.sendStatus(500)
  }
  const ladder = resolveLadderFromMatches(matches)
  res.status(200).json(ladder)
})




server.listen(PORT, () => {
  console.log(`Server listening port -> ${PORT}`)
})