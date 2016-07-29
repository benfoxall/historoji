"use strict";

require('dotenv').config({silent: true})

const pg = require('pg')
const express = require('express')
const bp = require('body-parser').urlencoded({extended:false})

const app = express()

app.use(express.static('public'))

app.post('/', bp, (req, res, next) => {

  console.log(req.body)

  const token   = req.body.token
  const domain  = req.body.team_domain
  const channel = req.body.channel_name
  const user    = req.body.user_name
  const emoji   = emojis(req.body.text)

  if(!(domain || channel || user))
    return res.sendStatus(400)

  if(process.env.TOKEN && token != process.env.SLACK_TOKEN)
    return res.sendStatus(400)

  if(!emoji.length)
    return res.sendStatus(202)

  pg.connect(process.env.DATABASE_URL, (err, client, done) => {

    if(err) return console.error('error fetching client from pool', err);

    let count = emoji.length

    emoji.forEach((em) => {
      client.query({
        text: 'INSERT INTO "public"."emoji"("emoji", "team", "channel", "user") VALUES($1, $2, $3, $4) RETURNING "id", "emoji", "team", "channel", "user", "time"',
        values: [
          em,
          req.body.team_domain,
          req.body.channel_name,
          req.body.user_name
        ]
      }, function(err, result) {
        if(err) return next(err)
          if(!--count) {done(); res.sendStatus(200)}

        console.log("saved>", result.rows[0]);
      });
    })
  })
})

app.get('/data', (req, res, next) => {

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {

    if(err) return next(err)

    client.query(`
      SELECT * FROM "public"."emoji"
      order by time desc
      limit 4000
      `,
      function(err, result) {
        if(err) return next(err)
        res.json(result.rows.map((r) => (
          [r.id, + new Date(r.time), r.emoji, r.team, r.channel, r.user]
        )))
        done()
      });
  })

})

app.use(express.static('public'))

app.listen(process.env.PORT || 3000)

function emojis(text) {
  const RE = /:([\w-\+]+):/g
  const _s = []
  var m
  while(m = RE.exec(text)) _s.push(m[1])
  return _s
}
