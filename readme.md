# BES App

## Team
`GET: /team`  
Return a json object with information about the team

`GET: /members`  
Return a json object with information about the members

`GET: /member`  
Return a json object with detailed information about a specific member

`GET: /d4hData` (Under Construction)  
Update the database with complete team and detailed member information from the D4H API.

## Page 
`POST: /page`  
Creates a new page entry from the text message page in the database and uses that information to begin a D4H incident entry

`GET: /directions`  (route via station)  
`GET: /directions?route=direct` (direct route)  
Redirects user to a Google map with directions from your location to the scene location described in the page.  

`GET: /location`  
Redirects user to a Google map with the location of the incident described in the text page.

`GET: /page`  
Return a json object containing the call information from the page.

`POST: /responder` (TBD)  
Adds a member to the list of those responding and estimates arrival time.  
Cordova app?

