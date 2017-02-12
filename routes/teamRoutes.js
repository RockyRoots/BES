var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var Member = require('../models/memberModel.js');
var Team = require('../models/teamModel.js');

// export all of the routes that we will use to the server
module.exports = function (app) {
    // console.log('Member routes loaded');

    const d4hApiRoot = "https://api.d4h.org:443/v2/team/";
    const D4H_TOKEN = process.env.D4H_TOKEN || config.D4H_TOKEN;

    app.use(logger('dev'));

    // our public static route for all our miscellaneous files
    app.use(express.static('./public'));

    // add our body-parser middleware to parse the member API body response
    app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }));

    // GET: / (root route)
    app.get('/', function (req, res) {
        res.sendFile('index.html', { root: './public' });
    });

    function convertD4H(member) {
        // convert custom fields to actual properties
        if (member.custom_fields) {
            for (var i = 0; i < member.custom_fields.length; i++) {
                var key = member.custom_fields[i].label.toLowerCase().trim().replace(' ', '_');
                if (key.indexOf('(') >= 0) { key = key.substring(0, key.indexOf('(')) }
                member[key] = member.custom_fields[i].value_string;
            }
        }
        return member;
    }

    function upsertMember(member) {
        member = convertD4H(member);
        Member.findOneAndUpdate({ id: member.id }, member, { upsert: true },
            function (err, doc) {
                if (err) {
                    console.log("Upsert failed", err.message);
                } else {
                    // console.log("upserting", member.name, member.id);
                }
            }
        );
    }

    // recursively retrive all pages of members
    function getMoreMemberData(offset, members, res) {
        var limit = 25;
        // console.log("URL:", d4hApiRoot + 'members?limit=' + limit + '&offset=' + offset + '&access_token=' + D4H_TOKEN)
        request(d4hApiRoot + 'members?limit=' + limit + '&offset=' + offset + '&access_token=' + D4H_TOKEN,
            function (err, response, body) {
                var myBody = JSON.parse(body); // parse the API response string into an object
                console.log("GET /members status:", myBody.statusCode, 'with', myBody.data.length, 'members')
                if (myBody.statusCode != 200) {
                    console.log("returning", members.length, 'members (status', myBody.statusCode, ')')
                    res.json(members);
                    return;
                }
                members = members.concat(myBody.data);
                console.log("adding", myBody.data.length, 'members (', members.length, ') total');

                getMoreMemberData(offset + limit, members, res);
                // in the background, update the database with detailed data for each member
                myBody.data.forEach(function (member) {
                    // console.log("GET: (background) /members/" + member.id + ":", member.name)
                    request(d4hApiRoot + 'members/' + member.id + '?access_token=' + D4H_TOKEN,
                        function (err, response, body) {
                            var detailMember = JSON.parse(body).data; // parse the API response string into an object
                            // console.log("GET /members/" + detailMember.id + ":", detailMember.name)
                            upsertMember(detailMember);
                        }
                    );
                });
            }
        );
    }

    // GET: /d4hData (update database with D4H data)
    app.get('/d4hData', function (req, res) {
        console.log("GET: /d4hData");

        if (D4H_TOKEN == null) {
            res.status(300).send('D4H token not defined in environment');
            return;
        }
        
        request(d4hApiRoot + 'team_details' + '?access_token=' + D4H_TOKEN,
            function (err, response, body) {
                if (err) {
                    console.log('D4H team error:', err);
                } else {
                    var team = JSON.parse(body).data; // parse the API response string into an object
                    Team.findOneAndUpdate({}, team, { upsert: true },
                        function (err, doc) {
                            if (err) {
                                console.log("Team Upsert failed", err.message);
                            } else {
                                console.log("Updating team");
                            }
                        }
                    );
                }
            }
        );

        getMoreMemberData(0, [], res);
    })

    // GET: /team (get team details)
    app.get('/team', function (req, res) {
        console.log("GET: /team");
        // get team data from database
         Team.findOne({}).exec(
            function (err, team) {
                if (err) {
                    console.log("Team Find failed", err.message);
                    res.status(500).send("Team Find failed", err.message);
                } else if (team) {
                    console.log("returning", team.title, "team data");
                    res.json(team);
                } else {
                    res.status(500).send("Team Find - unknown error")
                }
            }
        );

    });

    // GET: /members (get a list of all members)
    app.get('/members', function (req, res) {
        console.log("GET: /members");

         Member.find({}).sort({name:1}).exec( 
            function (err, doc) {
                if (err) {
                    console.log("Members Find failed", err.message);
                    res.status(500).send("Members Find failed", err.message);
                } else {
                    console.log("returning", doc.length, "members");
                    res.json(doc);
                }
            }
        );
    })

    // GET: /members/##### (get a single member by D4H id)
    app.get('/members/:memberId', function (req, res) {
        console.log("GET: /member/:memberId", req.params.memberId)
        Member.findOne({ id: req.params.memberId }).exec(
            function (err, doc) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    return res.json(doc);
                }
            }
        );
    });

    // PUT:/member (update a member's information)
    app.put('/member', function (req, res) {
        var member = req.body;     // updated html input member
        console.log("PUT ", member.name);
        // same as upsertMember(), but we need to send a response
        Member.findOneAndUpdate({ name: member.name },
            member, { upsert: true },
            function (err, doc) {
                if (err) {
                    console.log("PUT: /member failed ", err);
                    return res.status(500).send(err);
                } else {
                    console.log("PUT: /member OK ", doc.name);
                    return res.send("succesfully saved");
                }
            }
        );
    })
}