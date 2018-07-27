const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({extended: false}));

const test = [{min: 1, url: 'http://hurricanecharlie.co.uk'}];

// serve the main index page
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// request a minified url
app.post('/api/minurl/new', function(req, res) {
  res.json({url: req.body.url, minurl: 1});
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