require('dotenv').config({silent: true})

const pg = require('pg')
const express = require('express')
const bp = require('body-parser').urlencoded({extended:false})

const app = express()

app.use(express.static('public'))

app.post('/', bp, (req, res) => {

  console.log(req.body)

  emojis(req.body.text)
  .forEach(function(e){
    console.log(">>>", e)
    // should probably be the other way around
    if(process.env.DATABASE_URL) {
      pg.connect(process.env.DATABASE_URL, function(err, client, done) {

        if(err) return console.error('error fetching client from pool', err);

        client.query({
          text: 'INSERT INTO "public"."emoji"("emoji", "team", "channel", "user") VALUES($1, $2, $3, $4) RETURNING "id", "emoji", "team", "channel", "user", "time"',
          values: [
            e,
            req.body.team_domain,
            req.body.channel_name,
            req.body.user_name
          ]
        }, function(err, result) {
          if(err) {
            return console.error('error running query', err);
          }
          console.log("id:", result.rows[0]);
          done()
        });
      })
    }
  })

  res.send('cool')
})

app.get('*', (req, res) => {
  console.log(req)
  res.send('ok')
})

app.listen(process.env.PORT || 3000)

function emojis(text) {
  const RE = /:(\w+):/g
  const _s = []
  var m
  while(m = RE.exec(text)) _s.push(m[1])
  return _s
}
