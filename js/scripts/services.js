var myServices = angular.module('myApp.services', []);

app.run(function (editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

myServices.factory('filterService', function () {
    return {
        activeFilters: {},
        searchText: '',
    };
});

//strips characters for MS dates in this format: '/Date(1390272893353)/' .... then use <td>{{item.CreatedOn | cleanDate | date: 'yyyy-MM-dd HH:mm'}}</td>
myServices.filter('cleanDate', function () {
    return function (x) {
        if (x) {
            return new Date(parseInt(x.substr(6)));
        } else { // if not empty, clean the date. else return as empty.
            return x;
        }
    };
});

myServices.filter('htmlToPlaintext', function () { // remove HTML tags
    return function (text) {
        var result = String(text).replace(/<[^>]+>/gm, '');
        return result.replace(/&nbsp;/g, ' ');
    }
});


myServices.filter('cleanMetadata', function () { // clean metadata tags from SharePoint. There seems to be a bug with ng-grid. the FilterService doesnt work when this is applied.
    return function (text) {
        var result = String(text).replace(/\|[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+/g, ""); // finds guid after "|" and replaces with "" (blank)
        result = String(result).replace(/\;+/g, "; "); // find ";" and replace with "; ". At some point this needs to be smarter.
        if (text) {
            return result;
        } else { // if the text is blank, return the processed result
            return "";
        } // otherwise return blank
    }

});

myServices.filter('unsafe', function ($sce) { //this filter allows HTML data to be displayed correctly .. use it like this: <p ng-bind-html="comment.text | unsafe"></p>

    return function (val) {
        return $sce.trustAsHtml(val);
    };
});

myServices.directive("candidateview", function ($rootScope, $location) { // the code to find location should be moved to a service.  
    if ($location.host() == "collaboration.armedia.com") { // set these paths if hosted in sharepoint
        $rootScope.sitePath = "/sites/ACTS";
        $rootScope.codePath = "/SiteAssets/Sample";
        console.log("SharePoint. Candidate View: " + $rootScope.sitePath + $rootScope.codePath + "/views/candidates.html");
    } else { // set these paths if hosted locally, like brackets
        $rootScope.sitePath = "";
        $rootScope.codePath = "";
        console.log("SharePoint. Candidate View: " + $rootScope.sitePath + $rootScope.codePath + "/views/candidates.html");
    }
    return {
        restrict: 'E',
        templateUrl: $rootScope.sitePath + $rootScope.codePath + "/views/candidates.html"
    };
});

myServices.directive("positionview", function ($rootScope, $location) { // the code to find location should be moved to a service.
    if ($location.host() == "collaboration.armedia.com") {
        $rootScope.sitePath = "/sites/ACTS";
        $rootScope.codePath = "/SiteAssets/Sample";
        console.log("SharePoint. Postion View: " + $rootScope.sitePath + $rootScope.codePath + "/views/positions.html");
    } else {
        $rootScope.sitePath = "";
        $rootScope.codePath = "";
        console.log("SharePoint. Postion View: " + $rootScope.sitePath + $rootScope.codePath + "/views/positions.html");
    }
    return {
        restrict: 'E',
        templateUrl: $rootScope.sitePath + $rootScope.codePath + "/views/positions.html"
    };
});

myServices.directive("applicationview", function ($rootScope, $location) { // the code to find location should be moved to a service.
    if ($location.host() == "collaboration.armedia.com") {
        $rootScope.sitePath = "/sites/ACTS";
        $rootScope.codePath = "/SiteAssets/Sample";
        console.log("SharePoint. Application View: " + $rootScope.sitePath + $rootScope.codePath + "/views/applications.html");
    } else {
        $rootScope.sitePath = "";
        $rootScope.codePath = "";
        console.log("SharePoint. Application View: " + $rootScope.sitePath + $rootScope.codePath + "/views/applications.html");
    }
    return {
        restrict: 'E',
        templateUrl: $rootScope.sitePath + $rootScope.codePath + "/views/applications.html"
    };
});

myServices.factory('dataFactory', function ($http) {

    console.log('The dataFactory ran.');

    var factory = {};
    
    /**
     * [[GET some data and return it immediately. This will only work if $http is included.]]
     * @param   {[[Type]]} httpPath [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    
    factory.getListData = function (httpPath) { // This is a generic version where httpPath is passed in when the function is called. The other versions are no longer needed.
        return $http.get('' + httpPath).then(
            function (result) {
                return result.data.d.results
            }, // return the Array of results (for SP2010)
            function () {
                console.log('Error loading candidate JSON-SP')
            }
        )
    };

    /********** 
    The object returned is named 'data'.

    This example uses a JSON file formatted like the return of a 2010 REST list call (if a single item was called the format would be different)
    Since its 2010, the GET returns an object with one item "d". "d" is an object with one item, "results". "results" is an array of list items. 
    To set our $scope.newObjectName to the array or list items, we have to use data.d.resuls

    - In 2013 we GET an object with two items "odata.metadata" and "value". "value" is an array of list items. 
    ***********/

    
    

    return factory;
});




/*****************************
If we don't use a factory with a return, we could set a $scope object directly like this ...

   $http.get('json/candidates.json').then(
        function(result){$scope.candidateJSON = result.data.d.results;console.log("Success loading candidate JSON");console.log(result.data.d.results);},     // return the Array of results (for SP2010)
        function(){console.log('Error loading candidate JSON');}
        );
    
   $http.get('json/applications.json').then(
        function(result){$scope.applicationsJSON = result.data.d.results;console.log("Success loading application JSON");console.log(result.data.d.results);},     // return the Array of results (for SP2010)
        function(){console.log('Error loading application JSON');}
        );
    
   $http.get('json/positions.json').then(
        function(result){$scope.positionsJSON = result.data.d.results;console.log("Success loading positions JSON");console.log(result.data.d.results);},     // return the Array of results (for SP2010)
        function(){console.log('Error loading positions JSON');}
        );
*************************/



/*
    
    $scope.testList = 
       [{"data": 
         [{"value": 
            [{"id": 1, 
                "firstname": "John Smith", 
                "lastname": "Menzel",
                "email": "testing.email@gmail.com", 
                "telephone": "782-941-8456"
               }]
            }]
        }];
    
    $scope.testList2 = [{id: 1, name: 'John', employment: 'W-2', sport: 'Basketball', city: 'DC', featured: true}];  
    
    $scope.testList3 = [{data: 
         [{id: 1, firstname: "John Smith", lastname: "Menzel", email: "test@email.com"}]
        }];  
    
    ****************
    
   <ul ng-repeat="person in testList.data.value">
        <li>{{person.firstname}}</li>
        <li>{{person.data.value.lastname}}</li>
        <li>{{person.data.value.email}}</li>
    </ul>
    ---- TEST LIST 2
  <ul ng-repeat="test2 in testList2">
        <li>{{test2.id}}</li>
        <li>{{test2.name}}</li>
  </ul>
            
    ---- TEST LIST 3
*/