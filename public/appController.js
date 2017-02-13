// refer to the angular module we created and chain on a controller
angular.module('memberApp', [])
    .controller('memberController', memberFunction);

memberFunction.$inject = ['$http'];

function memberFunction($http) {
    var mCtrl = this;

    // we start with no member selected, so we hide the job application form
    mCtrl.selected = false;
    // TODO: for test purposes only
    mCtrl.textMsg = "BCFD170101-000000 FIWILR-Test Call ADD: 123 Main St BLD: APT: LOC: INFO: THIS IS A TEST Time:23:01UNITS:HY3,2866,LY1,2831,2840,4061"

    mCtrl.page = function (d4h) {
        console.log("POST: /page")
        var param = '';
        // simulate a twilio request
        var page = {
            to: '13035877660',
            from: '19706993100',
            body: mCtrl.textMsg
        }
        if (d4h) { param = "?d4h=true"; }
        $http.post('/page' + param, page).then(
            function success(response) {
                // console.log("POST:/page succeeded")
            },
            function failure(response) {
                console.log("POST:/page error:", response)
            }
        )
    }

    // update database with data from d4h
    mCtrl.update = function () {
        console.log("GET: /d4hData")
        $http.get('/D4Hdata').then(
            function success(response) {
                mCtrl.getTeam();
                mCtrl.getMembers();
            },
            function failure(response) {
                console.log("GET:/D4Hdata error:", response)
            }
        )
    }

    // load team from database
    mCtrl.getTeam = function () {
        console.log("GET: /team")
        $http.get('/team').then(
            function success(response) {
                mCtrl.team = response.data;
            },
            function failure(response) {
                console.log("GET:/team error:", response)
            }
        )
    }

    // load members from database
    mCtrl.getMembers = function () {
        console.log("GET: /members")
        $http.get('/members').then(
            function success(response) {
                mCtrl.memberArray = response.data;
                // HACK: why doesn't this reduce function work?
                var rescuer = 0;
                var reserve = 0;
                var associate = 0;
                var adjunct = 0;
                var candidate = 0;
                var non_member = 0;
                for (var i = 0; i < mCtrl.memberArray.length; i++) {
                    var classy = mCtrl.memberArray[i].classification;
                    var oppy = mCtrl.memberArray[i].status.name;
                    var op = oppy == 'Operational' ? true : false;
                    if (classy == 'Rescuer') { 
                        rescuer++;                    
                        if(!op) {
                            console.log(mCtrl.memberArray[i].name,'is',oppy,classy)
                        }
                    }
                    else if (classy == 'Reserve') { 
                        reserve++;                        
                        if(!op) {
                            console.log(mCtrl.memberArray[i].name,'is',oppy,classy)
                        }
                    } else if (classy == 'Adjunct') { 
                        adjunct++;                        
                        if(!op) {
                            console.log(mCtrl.memberArray[i].name,'is',oppy,classy)
                        }
                    } else if (classy == 'Candidate') { 
                        candidate++;                        
                        if(!op) {
                            console.log(mCtrl.memberArray[i].name,'is',oppy,classy)
                        }
                    } else if (classy == 'Associate') { 
                        associate++; 
                        if(op) {
                            console.log(mCtrl.memberArray[i].name,'is',oppy,classy)
                        }
                     } else if (classy == 'Non-Member') { 
                        non_member++; 
                        if(op) {
                            console.log(mCtrl.memberArray[i].name,'is',oppy,classy)
                        }
                    } else  { 
                        console.log("ERROR:",mCtrl.memberArray[i].name, oppy, classy);
                    }
                };
                mCtrl.count_reserve = reserve
                mCtrl.count_rescuer = rescuer
                mCtrl.count_associate = associate
                mCtrl.count_candidate = candidate
                mCtrl.count_adjunct = adjunct
                mCtrl.count_non_member = non_member
                mCtrl.count_voting = mCtrl.count_reserve + mCtrl.count_rescuer;
                mCtrl.quorum = Math.ceil(mCtrl.count_voting / 2);
            },
            function failure(response) {
                console.log("GET:/members error:", response);
            }
        )
    }

    // get member info from database
    mCtrl.getMember = function (member) {
        console.log("GET: /member", member)
        $http.get('/members/' + member.id).then(
            function success(response) {
                // once we set mCtrl.member with updated data, that info
                // is immediately carried forward into our job application form
                mCtrl.member = response.data;
                console.log("Returned:", mCtrl.member)
            }, function failure(response) {
                // here we do nothing if we can't find the selected member, 
                // but in reality we'd probably put up an alert or otherwise
                // notify the user that that member doesn't exist in our database
                console.log("GET: /member/:member error:", response)
            }
        )
        // this will un-hide the detail form
        mCtrl.selected = true;
    }

    // take the additional information from the form and save it to the database
    mCtrl.putMember = function () {
        console.log("PUT: /member", mCtrl.member.name)
        // put takes a second argument that is the data that we want to use to update the database
        $http.put('/member', mCtrl.member).then(
            function success(response) {
                console.log("Updated:", mCtrl.member)
                // if the update was successful, clear the selected name and hide the application form
                mCtrl.memberName = '';
                mCtrl.selected = false;
            },
            function failure(response) {
                // we do nothing here, but in reality we would probably put up an 
                // alert or otherwise notify the user that the update failed.
                console.log("PUT: /member error:", response)
            }
        )
    }

    // add a filter function to identify voting members
    mCtrl.votingFilter = function (element, array, index) {
        if (mCtrl.voting == 'all') {
            return true
        } else if (mCtrl.voting == 'voting') {
            // adjunct, associate, candidate, non-member are non-voting classifications
            // rescuer and reserve are voting classifications
            return element.classification == 'Rescuer' || element.classification == 'Reserve';
        } else {
            return true;
        };
    };

    // add a filter function to identify members of a given classification
    mCtrl.classFilter = function (element, array, index) {
        if (mCtrl.classification == 'all') {
            return true;
        } else if (mCtrl.class == 'rescuer') {
            return element.classification == 'Rescuer';
        } else if (mCtrl.class == 'reserve') {
            return element.classification == 'Reserve';
        } else if (mCtrl.class == 'candidate') {
            return element.classification == 'Candidate';
        } else if (mCtrl.class == 'adjunct') {
            return element.classification == 'Adjunct';
        } else if (mCtrl.class == 'associate') {
            return element.classification == 'Associate';
        } else if (mCtrl.class == 'non-member') {
            return element.classification == 'Non-Member';
        } else {
            return true;
        };
    };

    // add a filter function to identify operational/non-operational members
    mCtrl.operationalFilter = function (element, array, index) {
        if (mCtrl.operational == 'all') {
            return true;
        } else if (mCtrl.operational == 'operational') {
            return element.status.name == 'Operational';
        } else if (mCtrl.operational == 'non-operational') {
            return element.status.name == 'Non-Operational';
        } else {
            return true;
        };
    };

    // initialize page info from database
    mCtrl.getTeam();
    mCtrl.getMembers();

}