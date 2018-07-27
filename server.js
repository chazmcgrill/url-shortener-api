const express = require('express');
const app = express();
const mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/minurl', { useNewUrlParser: true });

app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({extended: false}));

const urlSchema = new mongoose.Schema({
  minUrl: {type: Number, required: true},
  url: {type: String, required: true}
})

let Url = mongoose.model('Url', urlSchema);

const test = [{min: 1, url: 'http://hurricanecharlie.co.uk'}];

function saveUrl(url, done) {
  const newUrl = new Url({ url: url, minUrl: 1 });
  newUrl.save((err, data) => {
    if (err) return done(err, null);
    return done(null, data);
  });
}

// serve the main index page
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// request a minified url
app.post('/api/minurl/new', function(req, res) {
  saveUrl(req.body.url, function(err, data) {
    res.json(data);
  }) 
});

// get website from id
app.get('/api/minurl/:id', function(req, res) {
  const min = Number(req.params.id);
  const url = test.filter(t => t.min === min)[0].url;
  res.json({url: url})
});

// setup server
const port = process.env.PORT || 8080;

app.listen(port, function() {
  console.log(`server running on port ${port}`);
});