require('dotenv').config({silent: true})

const pg = require('pg')
const express = require('express')
const bp = require('body-parser').urlencoded({extended:false})

const app = express()

app.use(express.static('public'))

app.post('/', bp, (req, res) => {

  console.log(req.body)

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query('SELECT $1::int AS number', ['1'], function(err, result) {
      done();
      if(err) {
        return console.error('error running query', err);
      }
      console.log(result.rows[0].number);
    });
  });

  res.send('cool')
})

app.get('*', (req, res) => {
  console.log(req)
  res.send('ok')
})

app.listen(process.env.PORT || 3000)
