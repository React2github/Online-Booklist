const express= require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser')
const { Client } = require('pg');
const pgCamelCase = require('pg-camelcase');

pgCamelCase.inject(require('pg'));
require('dotenv').config();

const app = express();

const mustache = mustacheExpress();
mustache.cache = null;
app.engine('mustache', mustache);
app.set('view engine','mustache');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.get('/books', (req, res) => {

const client = new Client();
client.connect()
    .then(() => {
    return  client.query('SELECT * FROM public.books;');
    })
    .then((results) => {
        res.render('book-list', {
            books: results.rows 
        });
    })
    .catch((err) => {
        console.log('error', err);
        res.send('Something bad happened');
    });

});

app.get('/book/add', (req, res) => {
    res.render('book-form');
});

app.post('/book/add', (req, res) => {
    console.log('post body', req.body);

    const client = new Client();
    client.connect()
       .then(() => {
           const sql='INSERT INTO public.books (name, authors) VALUES ($1, $2)'
           const params=[req.body.title, req.body.authors];
       return client.query(sql, params);
 
       })
       .then((results) => {
        //    console.log('results?', results);
           res.redirect('/books');
       })
       .catch((err) => {
           console.log('error', err);
           res.send('Something bad happened')
       });
    });

    app.post('/book/delete/:id', (req, res) => {
      console.log('deleting id', req.params.id);

      const client = new Client();
      client.connect()
      .then(() => {
          const sql = 'DELETE FROM public.books WHERE bookid = $1;'
          const params = [req.params.id];
         return client.query(sql, params);
      })
      .then((results) => {
        console.log('delete results', results);
        res.redirect('/books')
      })
      .catch((err) => {
          console.log('err', err);
          res.redirect('/books');
      });
    });


    app.get('/book/edit/:id', (req, res) => {
      const client = new Client();
      client.connect()
      .then(() => {
          const sql="Select * from public.books where bookid = $1;"
          const params = [req.params.id];
          return client.query(sql, params);
      })
      .then((results) => {

        if(results.rowCount === 0) {
            res.redirect('/books');
            return;
        }
          res.render('book-edit', {
              book: results.rows[0]
          });
      })
    .catch((err) => {
        console.log('edit get err', err);
        res.redirect('/books');
    });
});

app.post('/book/edit/:id', (req,res) => {
    const client = new Client();
    client.connect()
    .then(() => {
        const sql ='UPDATE books SET name = $1, authors = $2 WHERE bookid = $3';  
        const params = [req.body.title, req.body.authors, req.params.id];
      return client.query(sql, params);
    })
    .then((results) => {
        console.log('update results', results);
        res.redirect('/books');
    })
    .catch((err) => {
        console.log('update err', err);
        res.redirect('/books');
    });
});

app.listen(process.env.PORT, function () {
    console.log(`"listening on port ${process.env.PORT}"`)

})