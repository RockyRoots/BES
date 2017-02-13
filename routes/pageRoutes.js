var request = require('request');
var Page = require('../models/pageModel.js');
var Team = require('../models/teamModel.js');
var config = require('../config.js');

// TODO:
const cad2d4h = {
    "UNACCR": "Accident - Unknown if injury",
    "INACCR": "Accident - Injury",
    "MAACCR": "Accident - Major",
    "FIWILR": "Wildland Fire",
    "FISUPR": "Support Services",  // Fire Support
    "FISMOR": "Support Services",  //
    "FIASSR": "Support Services",  // Fire Assist
    "FISSTR": "Structure Fire",    // Fire Structure
    "FINONR": "Support Services",
    "FIINFR": "Support Services",
    "REWATR": "Water Rescue",
    "SUDEVR": "Other",  // Suspicious Device
    "EMSR": "Support Services",
    "MUAIDR": "Support Services",
    "RETECR": "Support Services5",
    "HAMATR": "Other",
    "COLTR": "COLT",
    "": "Air Accident"
}
// var d4hType = cad2d4h[cadType]

module.exports = function (app) {
    // console.log('Page routes loaded');

    // POST: /page?d4h=true (given a text message, create a page entry in the database and optionally create an entry in d4h)
    app.post('/page', function (req, res) {
        var to = req.body.to;
        var from = req.body.from; // bretsa@bretsaps.org
        var textMsg = req.body.body;

        // parse a BRETSA text message and create a call information object
        textMsg = textMsg.trim();
        var upMsg = textMsg.toUpperCase();

        // parse out date/time of page
        var cadNo = textMsg.substring(0, upMsg.indexOf(' ')).trim();
        var cadDateStr = cadNo.replace('BCFD', '')
        var timeArr = textMsg.substring(upMsg.indexOf('TIME:') + 5, upMsg.indexOf('UNITS:')).trim().split(':')
        var cadDate = new Date('20' + cadDateStr.substring(0, 2), cadDateStr.substring(2, 4)-1, cadDateStr.substring(4, 6),
            timeArr[0], timeArr[1], 0, 0);

        // TODO: get location defaults and timezone from GET:/team
        var city = config.city;
        var county = config.county;
        var state = config.state;
        var zip = config.zip;
        var lat = config.lat;
        var lng = config.lng;

        // Google Geo Code - given an address, return a location object with lat/long
        // https://developers.google.com/maps/documentation/geocoding/start?csw=1
        var address = textMsg.substring(upMsg.indexOf('ADD:') + 4, upMsg.indexOf('BLD:')).trim();
        var GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY || config.GOOGLE_MAPS_KEY
        var geoCodeRoot = 'https://maps.googleapis.com/maps/api/geocode/json'
        var geoCodeLocation = '?address=' + address + ', ' + county + ' County, ' + state
        var geoCodeAuth = '&key=' + GOOGLE_MAPS_KEY
        var geoCodeURL = (geoCodeRoot + geoCodeLocation + geoCodeAuth).replace(/ /g, '+')
        // console.log("GEO:", geoCodeURL)

        request(geoCodeURL, function (geoErr, geoResult, geoBody) {
            var myBody = JSON.parse(geoBody);
            if (myBody.status != 'OK' || geoErr) {
                // use defaults
                console.log("Google GeoCode failed:", myBody.status, myBody.error_message, geoErr)
            } else {
                city = myBody.results[0].address_components[2].short_name
                county = myBody.results[0].address_components[3].short_name.replace(' County', '')
                state = myBody.results[0].address_components[4].short_name
                zip = myBody.results[0].address_components[6].short_name
                lat = myBody.results[0].geometry.location.lat
                lng = myBody.results[0].geometry.location.lng
                if (myBody.results.length > 1) {
                    // TODO: how to determine the best address if multiple are found?
                    console.log("WARNING: Google GeoCode found", myBody.results.length,"matching addresses");
                    for (var i = 0; i < myBody.results.length; i++) {
                        console.log("        ", myBody.results[i].formatted_address);
                    }
                }
            }

            // parse off the description from the cad code
            var [cadCode, descr] = textMsg.substring(upMsg.indexOf(' '), upMsg.indexOf('ADD:')).trim().split('-');

            var pageInfo = {
                page: textMsg,
                cadNo: cadNo,
                cadCode: cadCode,
                description: descr,
                address: address,
                city: city,
                county: county,
                state: state,
                zip: zip,
                lat: lat,
                lng: lng,
                building: textMsg.substring(upMsg.indexOf('BLD:') + 4, upMsg.indexOf('APT:')).trim(),
                apt: textMsg.substring(upMsg.indexOf('APT:') + 4, upMsg.indexOf('LOC:')).trim(),
                location: textMsg.substring(upMsg.indexOf('LOC:') + 4, upMsg.indexOf('INFO:')).trim(),
                info: textMsg.substring(upMsg.indexOf('INFO:') + 5, upMsg.indexOf('TIME:')).trim(),
                time: cadDate,
                units: textMsg.substring(upMsg.indexOf('UNITS:') + 6).split(',')
            }

            // overwrite any page related to same cad number
            // TODO: do we want to overwrite?  Cancellation tones will overwrite original
            Page.findOneAndUpdate({ cadNo: pageInfo.cadNo }, pageInfo, { upsert: true },
                function (err, page) {
                    if (err) {
                        console.log("Page Upsert failed", err.message)
                        res.status(500).send("Page Upsert failed:", err)
                    }
                    console.log("upserting", pageInfo.cadNo)
                    res.json(pageInfo)
                }
            );

            // if D4H entry was requested...
            if (req.query.d4h) {
                var incident = {
                    ref: pageInfo.cadNo,
                    title: pageInfo.description + ' at ' + pageInfo.address,
                    activity: 'incident',
                    date: pageInfo.time,
                    enddate: pageInfo.time,
                    description: pageInfo.description + ' at ' + pageInfo.address,
                    streetaddress: pageInfo.address,
                    townaddress: pageInfo.city,
                    regionaddress: pageInfo.state,
                    postcodeaddress: pageInfo.zip,
                    countryaddress: 'USA',
                    lat: pageInfo.lat,
                    lng: pageInfo.lng
                }
                const d4hApiRoot = "https://api.d4h.org:443/v2/team/";
                const D4H_TOKEN = process.env.D4H_TOKEN || config.D4H_TOKEN;
                request.post({ url: d4hApiRoot + 'incidents' + '?access_token=' + D4H_TOKEN, form: incident },
                    function (err, res, body) {
                        if (err) {
                            console.log("D4H Entry FAILED for", incident.title, err)
                        } else {
                            console.log("D4H Entry created for", incident.title)
                        }
                    }
                )
            }
            console.log("PAGE:", pageInfo.description, 'at', pageInfo.address + ', ' + pageInfo.city + ', ' + pageInfo.state, 'at', pageInfo.time)
        })
    });

    // GET: /directions?route=direct (redirect to a map with directions to the most recent call address)
    app.get('/directions', function (req, res) {
        console.log("Directions:", req.query)
        var route = req.query.route;
        const googleMapDirRoot = 'https://www.google.com/maps/dir/';
        // get most recent page
        Page.findOne({}, {}, { sort: { 'created_at': -1 } },
            function (err, page) {
                if (route == 'direct') {
                    // create a URL with directions from current location to the call location
                    console.log('Direct to', page.address);
                    console.log((googleMapDirRoot + 'My Location/' + page.address).replace(/ /g, '+'));
                    res.redirect((googleMapDirRoot + 'My Location/' + page.address).replace(/ /g, '+'));
                } else {
                    // create a URL with directions from current location to the call location via the station

                    Team.findOne({},
                        function (err, team) {
                            var baseLocation = team.title + ', ' + team.address + ', ' + team.city + ', ' + team.state
                            console.log('Route via station to', page.address);
                            console.log((googleMapDirRoot + 'My Location/' + baseLocation + '/' + page.address).replace(/ /g, '+'));
                            res.redirect((googleMapDirRoot + 'My Location/' + baseLocation + '/' + page.address).replace(/ /g, '+'));

                        }
                    )
                }
            }
        );
    })

    // POST: /responder (under construction)
    app.post('/responder', function (req, res) {

    })

    // GET: /location (redirect to a map with directions to the most recent call address)
    app.get('/location', function (req, res) {
        const googleMapRoot = 'https://maps.google.com/';
        // get most recent page
        Page.findOne({}, {}, { sort: { 'time': -1 } },
            function (err, page) {
                var zoom = 10;
                res.redirect((googleMapRoot + '?&z=' + zoom + '&q=' + page.address).replace(/ /g, '+'))  // map with a marker
            }
        );
    })

    // GET: /page 
    app.get('/page', function (req, res) {
        // get most recent page
        Page.findOne({}, {}, { sort: { 'created_at': -1 } },
            function (err, page) {
                res.send(page);
            }
        );
    })
}