const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const uuid = require('uuid/v4');
const pg = require('pg');

let app = express();

//config/setup
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//db
app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});

//routes TODO:extract
app.get('/', (req, res) => res.redirect('boards'))

app.get('/boards', (req, res) => {
	let newUuid = uuid();
	res.redirect('boards/' + newUuid)
});

app.get('/boards/:uuid', (req, res) => {

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM boards WHERE identifier = \'' + req.params.uuid + '\'', function(err, result) {
      done();
      if (err) {
        console.error(err); res.send("Error " + err);
      } else if (result.rows.length > 0) {
        res.render('pages/boards', {board: result.rows[0]});
      } else {
        let query = 'INSERT INTO boards (identifier) values (\'{' + req.params.uuid + '}\') returning *';
        client.query(query, function(err, result) {
          done();
          if (err) {
            console.error(err); res.send("Error " + err);
          } else {
            res.render('pages/boards', {board: result.rows[0]});
          }
        });
      }
    });
  });


  //TODO: here we should start out by checking if we have a board in the db, otherwise someone is playing with our url and should just receive a 404
	//res.render('pages/boards', { 'uuid' : req.params.uuid })
});


//start our listener
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))