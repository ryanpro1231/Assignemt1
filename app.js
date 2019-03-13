var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var port = 3000;
var path = require('path');
var router = express.Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


mongoose.Promise = global.Promise;

//connect to mongodb using mongoose 
mongoose.connect("mongodb://localhost:27017/gameEntries", {
    useMongoClient:true
}).then(function(){
    console.log("Connected to the Monogo Database")
}).catch(function(err){
    console.log(err);
});

require('./models/Entry');
var Entry = mongoose.model('Entries');

app.engine('handlebars', exphbs({
    defaultLayout:'main'
}));
app.set('view engine', 'handlebars');

// functions to use body parser 
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//route to index.html
router.get('/',function(req, res){
    //res.sendFile(path.join(__dirname+'/index.html'));
    //var title = "Welcome to the game app";
    res.render('index');
});

app.get('/', function(req,res){
    console.log("Request made from fetch");
    Entry.find({}).then(function(entries){
        res.render('index', {entries:entries})
    });
});

//route to entries
router.get('/entries',function(req, res){
    res.render('gameEntries/addgame')
});

//route to Edit entries
router.get('/gameentries/edit/:id',function(req, res){
Entry.findOne({
_id:req.params.id
}).then(function(entry){
    res.render('gameentries/editgame', {entry:entry});
});

    
});

//route to put edited entry
router.post('/editgame/:id', function(req,res){
    Entry.findOne({
        _id:req.params.id
    }).then(function(entry){
        entry.title = req.body.title;
        entry.genre = req.body.genre;

        entry.save().then(function(idea){
            res.redirect('/');
        })
    });
});

//route to login
router.get('/login',function(req, res){
    res.render('login')
});



//post for form on index
app.post('/addgame', function(req,res){
    console.log(req.body);
    var newEntry = {
        title:req.body.title,
        genre:req.body.genre
    }

    new Entry(newEntry).save().then(function(entry){
        res.redirect('/');
    });
});
//Delete your entry
app.post('/:id', function(req,res){
    Entry.remove({_id:req.params.id}).then(function(){
        //req.flash("game removed");
        res.redirect('/');
    });
});

//routs for paths
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/scripts'))
app.use('/', router);

//starts the server 
app.listen(port, function(){
    console.log("server is running on port: " + port);
});