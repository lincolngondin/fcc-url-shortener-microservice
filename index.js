require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('node:dns');
const { DBUrl } = require('./db');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// use the body parsing middleware
app.use(express.urlencoded({extended: true}))

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// create an short url
app.post("/api/shorturl", function(req, res){
  const receivedURL = req.body.url;
  const invalidURLObject = {error: 'invalid url'}

  let parsedURL;
  try{
    parsedURL = new URL(String(receivedURL));
  }
  catch(err) {
    parsedURL = null
  }

  // check if is an valid URL
  if(parsedURL === null || (parsedURL.protocol != "http:" && parsedURL.protocol != 'https:')) {
    res.json(invalidURLObject);
    return;
  }

  dns.lookup(parsedURL.hostname, (err, address, family)=>{

    if(err !== null){
      res.json(invalidURLObject);
    }
    else{
      // create the instance in mongoDB
      const createdURL = new DBUrl({original_url: receivedURL});
      createdURL.save();
      res.json({
        original_url: receivedURL,
        short_url: createdURL._id
      });
    }
  })
})

app.get("/api/shorturl/:short", function(req, res){
  const shortURL = req.params.short;
  DBUrl.findById(shortURL).exec().then((value)=>{
    if(value === null){
      res.redirect("/api/shorturl");
    }
    else{
      const toRedirectURL = value.original_url;
      res.redirect(toRedirectURL);
    }
  });
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
