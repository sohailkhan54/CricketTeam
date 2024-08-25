const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbpath = path.join(__dirname, 'cricketTeam.db')
const app = express()
app.use(express.json())

let db = null
const intializeDatabase = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running')
    })
  } catch (e) {
    console.log('Db errror', e)
  }
}

intializeDatabase()

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    select * from cricket_team`
  let players = await db.all(getPlayersQuery)
  let ans = dbresponse => {
    return {
      playerId: dbresponse.player_id,
      playerName: dbresponse.player_name,
      jerseyNumber: dbresponse.jersey_number,
      role: dbresponse.role,
    }
  }
  response.send(players.map(eachplayer => ans(eachplayer)))
})

app.post('/players/', async (request, response) => {
  const newPlayer = request.body
  const {playerName, jerseyNumber, role} = newPlayer
  const UpdatePlayerQuery = `INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES (${playerName} ${jerseyNumber} ${role})

  `
  try {
    await db.run(UpdatePlayerQuery, [playerName, jerseyNumber, role])
    response.send('Player Added to Team')
  } catch (error) {
    console.error(error)
    response.status(500).send('Error adding player to team')
  }
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerQuery = `select * from cricket_team 
  where player_id = ${playerId}`
  let dbresponse = await db.get(playerQuery)

  response.send(dbresponse)
})

app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const playerDetailsUpdateQuery = `
  UPDATE  cricket_team SET
  playerName = "${playerName}",
  jerseryNumber = "${jerseyNumber}",
  role = "${role} "
  WHERE player_id = "${playerId}`
  let updatedResponse = await db.run(playerDetailsUpdateQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `delete from cricket_team where player_id=${playerId}`

  await db.run(deleteQuery)
  response.send('Player Removed')
})
