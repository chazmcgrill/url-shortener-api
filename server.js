const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dns = require('dns');
const AutoIncrement = require('mongoose-sequence')(mongoose);

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({extended: false}));

const urlSchema = new mongoose.Schema({
  url: {type: String, required: true}
});

urlSchema.plugin(AutoIncrement, { inc_field: 'minUrl' });

let Url = mongoose.model('Url', urlSchema);

function saveUrl(url, done) {
  const newUrl = new Url({ url: url });
  newUrl.save((err, data) => {
    if (err) return done(err, null);
    return done(null, data);
  });
}

// serve the main index page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// request a minified url
app.post('/minurl/new', (req, res) => {
  const newUrl = req.body.url;
  Url.findOne({url: newUrl}, (err, data) => {
    if (data) return res.json(data);

    dns.lookup(newUrl,  (err) => {
      if (err) return res.json({ error: "Invalid Url" })
      saveUrl(newUrl,  (err, data) => {
        res.json(err ? { error: "Error Saving, Please Retry!" } : data);
      });
    });
  });
});

// get website from id
app.get('/minurl/:id', (req, res) => {
  Url.findOne({ minUrl: req.params.id}, (err, data) => {
    if (err) return res.json({error: "Invalid URL"});
    res.status(301).redirect(`http://${data.url}`);
  });
});

// setup server
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});