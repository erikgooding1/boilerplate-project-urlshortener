require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: { type: Number, required: true }
});

let Url = mongoose.model("URL", urlSchema);

async function getNumUrls(model) {
  return await model.countDocuments({});
}


app.post('/api/shorturl', async (req, res) => {
  //res.json({requestBody: req.body.url});
  let numUrls = await getNumUrls(Url);
  Url.findOne({ original_url: req.body.url })
    .then((url) => {
      if (!url) {
        console.log("URL not found");
        try {
          let urlObj = { original_url: req.body.url, short_url: numUrls + 1 }
          numUrls++;
          Url.create(urlObj);
          res.json(urlObj);
        } catch (error) {
          console.log(error);
        }
      } else {
        res.json({ original_url: url.original_url, short_url: url.short_url });
      }

    })
    .catch((err) => {
      console.log(err);
    })
});

app.get('/api/shorturl/:short', async (req, res) => {
  Url.findOne({ short_url: req.params.short })
    .then((url) => {
      let urlObj = { original_url: url.original_url, short_url: url.short_url }
      res.json(urlObj);
    })
    .catch((err) => {
      console.log(err);
      res.send("Not foud");
    })
})

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
