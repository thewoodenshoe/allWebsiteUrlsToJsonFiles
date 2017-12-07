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

// Default
app.get('/', function(req, res) {
   table = ''
   res.render('index', {table})
})

app.post('/step1', function(req, res){
   request(url, function(error, response, html){
      if(error){
         console.log(error)
         res.end(error)
     } else {
         var $ = cheerio.load(html)
         $('li','ul').each(function(i, element){
            let data = $(this)
            let text = data.children().text()
            let href = "http://www.fordservicecontent.com" +data.children().attr('href')
            parsedResults.push({ 'nr': i, 'link name': text, 'url': href })
         })
         let tmp = JSON.stringify(parsedResults)
         const jsonObj = JSON.parse(tmp)
         let table = tableify(jsonObj)
         res.render('index', {table})
      } 
   })
})

app.post('/step2', function(req, res){
  var i = 0
  parsedResults.forEach(function(value){
     i += 1
     request(value.url, function(error, response, html) {
        if(error){
           console.log(error)
           res.end(error)
        } else {
          var $ = cheerio.load(html)
          fs.writeFile('./tmp/'+i+'.html',html,function(err){
             console.log(`File ${i} was written succesfully to ./tmp/${i}.html`)
          })
        }
     })
  })
  res.end()
})

app.listen('3000')
console.log('Magic happens on port 3000');
