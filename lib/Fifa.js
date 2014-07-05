'use strict';

var cheerio = require("cheerio");
var fs = require("fs");

var Fifa = (function() {
    var todayData = null;
    var tomorrowData = null;
    var URL = "http://www.fifa.com/worldcup/matches/index.html";
    var timeStamp = null;

    function getToday(data) {
        console.log('Gathering new FIFA match data.');

        var $ = cheerio.load(data);
        var teamAway, teamHome, date, time, scoreAway, scoreHome, arena, group, flagAway, flagHome;
        var matches = [];
        var id = 1;

        $(".match-list").find(".match-list-date.anchor").find(".col-xs-12.clear-grid").find(".mu.result").each(function() {
            var data = $(this);
            teamAway = data.children(".mu-m-link").children(".mu-m").children(".t.away").children(".t-n").children(".t-nText").text();
            teamHome = data.children(".mu-m-link").children(".mu-m").children(".t.home").children(".t-n").children(".t-nText").text();
            date = data.children(".mu-m-link").children(".mu-i").children(".mu-i-date").text();
            var tempTime = data.children(".mu-m-link").children(".mu-i").children(".mu-i-datetime").text();
            var timeSplit = tempTime.split("-");
            time = timeSplit[1].replace(/^\s+|\s+$/g, "");
            var tempScore = data.children(".mu-m-link").children(".mu-m").children(".s").children().children().children().text();
            var scoreSplit = tempScore.split("-");
            scoreAway = scoreSplit[1];
            scoreHome = scoreSplit[0];
            arena = data.children(".mu-m-link").children(".mu-i").children(".mu-i-location").children(".mu-i-stadium").text();
            group = data.children(".mu-m-link").children(".mu-i").children(".mu-i-group").text();
            flagAway = "images/flags/".concat(teamAway, ".png");
            flagHome = "images/flags/".concat(teamHome, ".png")
            var match = new Match(id, teamAway, teamHome, flagAway, flagHome, date, scoreAway, scoreHome, arena, group, time);
            matches.push(match);

            console.log("Match ".concat(teamAway, " vs. ", teamHome, " retrieved."));
            id++;
        });
        matches.reverse();

        console.log("Data gathering was successful.");
        return matches;
    }

    function getTomorrow(data) {
        // Scraping future games, i.e., > today
        console.log('Gathering future FIFA match data.');

        var $ = cheerio.load(data);
        var teamAway, teamHome, date, arena, group, flagAway, flagHome;
        var matches = [];
        var id = 0;

        $(".match-list").find(".match-list-date.anchor").find(".col-xs-12.clear-grid").find(".mu.fixture").each(function() {
            var data = $(this);
            if (data.children('.mu-m-link').length === 0) {
                teamAway = data.children(".mu-m").children(".t.away").children(".t-n").children(".t-nText").text();
                teamHome = data.children(".mu-m").children(".t.home").children(".t-n").children(".t-nText").text();
                date = data.children(".mu-i").children(".mu-i-datetime").text();
                arena = data.children(".mu-i").children(".mu-i-location").children(".mu-i-stadium").text();
                group = data.children(".mu-i").children(".mu-i-group").text();
            } else {
                teamAway = data.children('.mu-m-link').children(".mu-m").children(".t.away").children(".t-n").children(".t-nText").text();
                teamHome = data.children('.mu-m-link').children(".mu-m").children(".t.home").children(".t-n").children(".t-nText").text();
                date = data.children('.mu-m-link').children(".mu-i").children(".mu-i-datetime").text();
                arena = data.children('.mu-m-link').children(".mu-i").children(".mu-i-location").children(".mu-i-stadium").text();
                group = data.children('.mu-m-link').children(".mu-i").children(".mu-i-group").text();
            }

            flagAway = "images/flags/".concat(teamAway, ".png");
            if (flagAway.search("\\[") != -1) {
                flagAway.replace(/\[.*?\]/g, '');
                flagAway = "images/flags/".concat("blank", ".png")
            }
            flagHome = "images/flags/".concat(teamHome, ".png")
            if (flagHome.search("\\[") != -1) {
                flagHome.replace(/\[.*?\]/g, '');
                flagHome = "images/flags/".concat("blank", ".png")
            }

            var match = new TomorrowMatch(id, teamAway, teamHome, flagAway, flagHome, date, arena, group);
            matches.push(match);

            console.log("Match ".concat(teamAway, " vs. ", teamHome, " retrieved."));
            id--;
        });
        matches.reverse();

        console.log("Data gathering was successful.");
        return matches;
    }

    function SaveTodayData(data) {
        todayData = data;
    }

    function SaveTomorrowData(data) {
        tomorrowData = data;
    }

    function clearSavedData() {
        if (typeof todayData === 'null' || 'undefined') {
            console.log('There was no data to be cleared.');

            return false;
        } else {
            todayData = null;
        }
        return;
    }

    function LastUpdate() {
        return timeStamp;
    }

    function getCurrentDate(ip) {
        console.log("Creating timestamp for user...");

        var date = new Date();
        date = date.toLocaleDateString();

        return date;
    }

    function setUpdateTime(date) {
        if (Date.parse(date)) {
            console.log("Timestamp has been recorded for this update.");
            timeStamp = date;
        } else {
            console.log('Date is in a improper format.');
            return false;
        }
        return;
    }

    function exportSavedData(data) {
        console.log("Attempting to export saved match data...");

        fs.writeFile("./public/assets/data/fifa-matchup-data.json", JSON.stringify(data, null, 4), function(err) {
            if (err) {
                console.log('There was an error exporting saved match data.');
                throw err;
            }
            console.log("Match data successfully exported.");
        });
    }

    function exportTomorrow(data) {
        console.log("Attempting to export saved future match data...");

        fs.writeFile("./public/assets/data/fifa-future-matchup-data.json", JSON.stringify(data, null, 4), function(err) {
            if (err) {
                console.log('There was an error exporting saved future match data.');
                throw err;
            }
            console.log("Future match data successfully exported.");
        });
    }

    function getTodayData() {
        return todayData;
    }

    function getTomorrowData() {
        return tomorrowData;
    }

    function Match(id, teamAway, teamHome, flagAway, flagHome, date, scoreAway, scoreHome, arena, group, time) {
        this.id = id;
        this.teamAway = teamAway;
        this.teamHome = teamHome;
        this.flagAway = flagAway;
        this.flagHome = flagHome;
        this.date = date;
        this.scoreAway = scoreAway;
        this.scoreHome = scoreHome;
        this.arena = arena;
        this.group = group;
        this.time = time;
    }

    function TomorrowMatch(id, teamAway, teamHome, flagAway, flagHome, date, arena, group) {
        this.id = id;
        this.teamAway = teamAway;
        this.teamHome = teamHome;
        this.flagAway = flagAway;
        this.flagHome = flagHome;
        this.date = date;
        this.arena = arena;
        this.group = group;
    }

    return {
        today: getToday,
        tomorrow: getTomorrow,
        saveToday: SaveTodayData,
        saveTomorrow: SaveTomorrowData,
        clear: clearSavedData,
        last: LastUpdate,
        date: getCurrentDate,
        setTime: setUpdateTime,
        exporter: exportSavedData,
        exportTomorrow: exportTomorrow,
        getTodayData: getTodayData,
        getTomorrowData: getTomorrowData,
        Match: Match,
        TomorrowMatch: TomorrowMatch
    }
}());

exports = module.exports = Fifa;