// refer to the angular module we created and chain on a controller
angular.module('memberApp', [])
    .controller('memberController', memberFunction);

memberFunction.$inject = ['$http'];

function memberFunction($http) {
    var mCtrl = this;

    // we start with no member selected, so we hide the job application form
    mCtrl.selected = false;
    // TODO: for test purposes only
    mCtrl.textMsg = "BCFD170210-001494 FIWILR-Wildland/Grass Fire ADD: 5255 Rogers Rd BLD: APT: LOC: INFO: ARIAL PHOTOGRAPHY REQUEST Time:05:47UNITS:HY3,2866,LY1,2831,2840,4061"

    mCtrl.page = function (d4h) {
        var param = '';
        if (d4h) { param="?d4h=true";}
        $http.post('/page'+param, { page: mCtrl.textMsg }).then(
            function success(response) {
                console.log("POST:/page succeeded")
            },
            function failure(response) {
                console.log("POST:/page error:", response)
            }
        )
    }

    mCtrl.update = function () {
        console.log("GET: /d4hData")
        $http.get('/D4Hdata').then(
            function success(response) {
                getTeam();
                getMembers();
            },
            function failure(response) {
                console.log("GET:/D4Hdata error:", response)
            }
        )
    }

    // initialize team
    function getTeam() {
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
    getTeam();

    // initialize list members
    function getMembers() {
        console.log("GET: /members")
        $http.get('/members').then(
            function success(response) {
                mCtrl.memberArray = response.data;
                // HACK: why doesn't this reduce function work?
                var x = 0;
                var s = mCtrl.memberArray.reduce(function(sum,member){ 
                    if (member.classification == 'Rescuer' 
                        || member.classification == 'Reserve') {
                            // console.log('INC', sum)
                            x++;
                            return sum+1;
                        }
                },0);
                // console.log("DBG:", s,x)
                mCtrl.count_voting = x;
                mCtrl.quorum = Math.ceil(mCtrl.count_voting/2);
            },
            function failure(response) {
                console.log("GET:/members error:", response);
            }
        )
    }
    getMembers();

    // select a single member and get more detailed info
    // use that detailed info to start populating a job application
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
        // this will un-hide the job application form
        mCtrl.selected = true;
    }

    // submit a job application and apply for the job!
    // take the additional information from the form and save it all to the database
    mCtrl.putMember = function () {
        console.log("PUT: /member", mCtrl.member.name);
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
    mCtrl.votingFilter = function(element, array, index) {
		if (mCtrl.voting == 'all') {
			return true
		} else if (mCtrl.voting == 'voting') {
            // adjunct, associate, candidate, non-member are non-voting
			return element.classification == 'Rescuer' || element.classifiction == 'Reserve';
		} else {
			return true;
		};
	};

}