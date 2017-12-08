var express = require('express');
var fs = require('fs');
var tableify = require('tableify')
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

// Settings
url = 'http://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Index?bookcode=O32828&marketCode=US&languageCode=EN&VIN=&div=l'
app.set('view engine', 'ejs') // set the view engine to ejs // set app settings
app.use(express.static(__dirname + '/public')); // for css file
var parsedResults = [];
var fetchedHtml = null

// Default
app.get('/', function(req, res) {
   table = ''
   parsedResults = [];
   res.render('index', {table})
})

app.post('/step1', function(req, res) {
   //const url = req.body.frmUrl
   request(url, function(error, response, html){
      if(error){
         console.log(error)
         table = error
         res.render('index', {table})
         table = ''
      } else {
         fetchedHtml = html
         table = fetchedHtml
         res.render('index',{table})
         table = ''
      }
   })
})

app.post('/step2', function(req, res){
   var $ = cheerio.load(fetchedHtml)
   //const tag1 = req.body.frmTag1
   //const tag2 = req.body.frmTag2
   //const tag3 = req.body.frmTag3
   $('li','ul').each(function(i, element){
      let data = $(this)
      let text = data.children().text()
      //let href = tag3 +data.children().attr('href')
      let href = "http://www.fordservicecontent.com" +data.children().attr('href')
      parsedResults.push({ 'nr': i, 'name': text, 'url': href })
   })
   let tmp = JSON.stringify(parsedResults)
   const jsonObj = JSON.parse(tmp)
   let table = tableify(jsonObj)
   res.render('index', {table})
})

app.post('/step3', function(req, res){
  parsedResults.forEach(function(value){
     request(value.url, function(error, response, html) {
        if(error){
           console.log(error)
           table = error
           res.render('index', {table})
           table = ''
        } else {
           var $ = cheerio.load(html)
           var directory = `./tmp/${value.name}.html`
           // TO DO:
           // Now create your JSON format from the html page and store it.
           fs.writeFile(directory, html, function(error){
              if(error){ 
                 console.log(error)
              } else {
                 console.log(`File ${value.name} was written succesfully to ${directory}`)
              }
           })
        }
     })
  })
  res.end('Done. Check filesystem')
})

app.listen('3000')
console.log('Magic happens on port 3000');
