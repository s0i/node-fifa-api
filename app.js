'use strict';

var express = require("express");
var fs = require("fs");
var request = require("request");
var cheerio = require("cheerio");
var app = express();
var cors = require("cors");
var Fifa = require("./lib/Fifa");
var Observer = require("./lib/Observer");
var url = "http://www.fifa.com/worldcup/matches/index.html";
var IPs = new Observer.IPCollection();

// Allows for cross origin requests
app.use(cors());

// Getting matchup data everyday leading up to today
app.get("/api/today", function(req, res) {
    console.log("GET Request from %s", req.ip);

    var user = new Observer.User(req.ip);
    IPs.push(user);

    // Checking for local data
    fs.exists("./public/assets/data/fifa-matchup-data.json", function(exists) {
        if (!exists) {
            console.log("No data found. Scraping for latest Fifa matchup data.");
            request(url, function(err, response, html) {
                if (!err && response.statusCode === 200) {
                    var matchData = Fifa.today(html);
                    var date = Fifa.date();

                    Fifa.setTime(date);
                    Fifa.saveToday(matchData);
                    Fifa.exporter(Fifa.getTodayData());

                    res.send(matchData);
                } else {
                    throw err;
                }
            });
        } else {
            var curr = Fifa.date();

            // Checking if local data is up-to-date
            if (curr > Fifa.last()) {
                console.log('Data is outdated. Updating to latest FIFA match data.');
                request(url, function(err, response, html) {
                    if (!err && response.statusCode === 200) {
                        var matchData = Fifa.today(html);
                        var date = Fifa.date();

                        Fifa.setTime(date);
                        Fifa.saveToday(matchData);
                        Fifa.exporter(Fifa.getTodayData());

                        res.send(matchData);
                    } else {
                        throw err;
                    }

                });
                return;
            } else {
                fs.readFile("./public/assets/data/fifa-matchup-data.json", {
                    encoding: "utf8"
                }, function(err, data) {
                    // File should exist since it just checked
                    // Another layer of error checking just in case 
                    if (err) {
                        console.log('Local match data copy not found unexpectedly...');

                        var matchData = Fifa.today(html);
                        var date = Fifa.date();

                        Fifa.setTime(date);
                        Fifa.saveToday(matchData);
                        Fifa.exporter(Fifa.geTodayData());

                        res.send(Fifa.getData());
                    } else {
                        console.log("Sending local data...");
                        res.send(data);
                        console.log("Local data successfully sent.");
                    }
                });
            }
        }
    });
});

// Gets all matchup data > today
app.get('/api/tomorrow', function(req, res) {
    console.log('GET request from %s', req.ip);

    var user = new Observer.User(req.ip);
    IPs.push(user);

    fs.exists("./public/assets/data/fifa-future-matchup-data.json", function(exists) {
        if (!exists) {
            console.log('No local data found. Searching for future match data.');

            request(url, function(err, response, html) {
                if (!err && response.statusCode === 200) {
                    var matchData = Fifa.tomorrow(html);
                    var date = Fifa.date();

                    Fifa.saveTomorrow(matchData);
                    Fifa.exportTomorrow(Fifa.getTomorrowData());
                    res.send(Fifa.getTomorrowData());
                }
            });
        } else {
            fs.readFile("./public/assets/data/fifa-future-matchup-data.json", {
                encoding: "utf8"
            }, function(err, data) {
                if (err) {
                    console.log('Local future match data copy not found unexpectedly...');

                    var matchData = Fifa.today(html);
                    var date = Fifa.date();

                    Fifa.setTime(date);
                    Fifa.saveToday(matchData);
                    Fifa.exporter(Fifa.geTodayData());

                    res.send(Fifa.getData());
                } else {
                    console.log("Sending local future data...");
                    res.send(data);
                    console.log("Local future data successfully sent.");
                }
            });
        }
    });
});

var server = app.listen(8081, function() {
    console.log('Awaiting connections on port %d', server.address().port);
});

exports = module.exporters = app;