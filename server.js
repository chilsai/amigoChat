#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ejs  = require('ejs');
var bodyparser = require('body-parser');

//userInformtion
var nickNames = [];

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        //self.ipaddress = process.env.IP;
        self.port      = process.env.PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            //self.ipaddress = "127.0.0.1";
        };
    };

    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
          //res.render('chat.html');
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        app.use(express.static(__dirname + '/public'));
        app.use(express.static(__dirname + '/views'));
        self.createRoutes();
        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        //self.populateCache();
        app.engine('html', require('ejs').renderFile);
        app.set('view engine', 'html');
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };

    // Open Home Page
    app.get('/', function(req, res){
      res.render('index.html');
    });

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        http.listen(self.port, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.port);
        });

        io.on('connection', function(socket){

          socket.on('chat message', function(msg){
             console.log('message: ' + msg);
        	   io.emit('chat message', msg);
          });

          socket.on('add user', function(nickName, callback){
             console.log('Nick Name: ' + nickName);
             if(nickNames.indexOf(nickName) != -1){
               callback(false);
             }else{
               callback(true);
               socket.nickName = nickName;
               nickNames.push(socket.nickName);
               console.log('Nick Names list: ' + nickNames);
               updateNickNames();
             }
          });

          function updateNickNames(){
            io.emit('nickNames',nickNames);
          }
          socket.on('disconnect', function () {
            if(!socket.nickName) return;
            nickNames.splice(nickNames.indexOf(socket.nickName),1);
            updateNickNames();
            // remove the username from global usernames list
            //io.sockets.emit('updateUserCount', numUsers);
          });

        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
