var app = angular.module('myApp', ['myApp.services', 'ngGrid', 'ui.bootstrap', 'crud', 'xeditable']);

//may need to add or remove dependency like 'personnel'

// Jthree Modal
app.controller('ModalCtrl', ['$scope', '$modalInstance',
    function ($scope, $modalInstance) {
        $scope.save = function () {
            if ($scope.form.Name.$valid) {
                var saveData = false;
                if ($scope.form.Name.$dirty) {
                    saveData = true;
                }
                $modalInstance.close(saveData);
            }
        };
        $scope.cancel = function () {
            $modalInstance.close(false);
        };
 }]);

app.controller('CandidatesCtrl', function ($scope, filterService, $http, dataFactory, $location, $rootElement, $rootScope, $modal, crudFactory, $filter) {
    $scope.filterService = filterService;
    $scope.location = $location;

    // Figure out where you are and set some variables. This helps run locally and run on a server.

    if ($location.host() == "collaboration.armedia.com") {
        $rootScope.sitePath = $location.host() + "/sites/ACTS";
        $rootScope.codePath = "/SiteAssets/Sample";
        $rootScope.candidatePath = "https://" + $rootScope.sitePath + "/_vti_bin/listdata.svc/Candidates?$expand=Attachments"; // Use variables to build a Path to the SP2010 API for Candidates. https://collaboration.armedia.com/sites/ACTS/_vti_bin/listdata.svc/Candidates
        $rootScope.positionPath = "https://" + $rootScope.sitePath + "/_vti_bin/listdata.svc/Positions";
        $rootScope.applicationPath = "https://" + $rootScope.sitePath + "/_vti_bin/listdata.svc/Applications?$expand=Attachments";

        console.log("SharePoint. Site Path: " + $rootScope.sitePath);
        console.log("SharePoint. Code Path: " + $rootScope.codePath);
        console.log("SharePoint. Candidate Path: " + $rootScope.candidatePath);
        console.log("SharePoint. Position Path: " + $rootScope.positionPath);
        console.log("SharePoint. Application Path: " + $rootScope.applicationPath);


        // Call the dataFactory function to get data from a file or from an API
        // In this case we're getting candidatePath

        dataFactory.getListData($rootScope.candidatePath)
            .then(function (result) {
                $scope.candidateJSON = result;
                angular.forEach($scope.candidateJSON, function (row) {  // SkillsValue contains skills in messy SharePoint format. This will strip the bad characters and give us a semi-colon seperated string
                    var result = String(row.SkillsValue).replace(/\|[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+/g, ""); // finds guid after "|" and replaces with "" (blank)
                    result = String(result).replace(/\;+/g, "; "); // find ";" and replace with "; ". At some point this needs to be smarter.
                    row.SkillsValue = result;
                });
            });

        dataFactory.getListData($rootScope.positionPath) // uses .then to let the dataFactory work before setting the data result
        .then(function (result) {
            $scope.positionsJSON = result;
            $scope.openPositions = $filter('filter')(result, {
                PositionClosed: null
            });
            $scope.openPositions = $filter('filter')($scope.openPositions, {
                PositionOpened: '!!'
            }); // get only open positions; !! means not null
        });

        dataFactory.getListData($rootScope.applicationPath)
            .then(function (result) {
                $scope.applicationsJSON = result;
                console.log($scope.positionJSON);
                angular.forEach($scope.applicationsJSON, function (obj) { // for each Application, go find the Candidate and Position data
                    $scope.currentCandidate = $filter('filter')($scope.candidateJSON, {
                        Id: obj.CandidateId
                    });
                    $scope.currentPosition = $filter('filter')($scope.positionsJSON, {
                        Id: obj.ApplicationPositionId
                    });
                    obj.CandidateArray = $scope.currentCandidate[0]; // we are using [0] because we expect an array with only one object, so we grab the first (only) one                
                    obj.PositionArray = $scope.currentPosition[0];
                });
                $scope.openApplications = $filter('filter')($scope.applicationsJSON, { // get open applications, add candidate info
                    ApplicationClosed: false
                }); // get only open applications
            });



        // User 'filter' filter to find applications that are not closed. We pass the getListData result to filter and use it to set openApplications.
        // Filter example ... $scope.gradeA = $filter('filter')($scope.myResults.subjects, {grade: 'A'});

    } // end IF
    else {
        $rootScope.sitePath = $location.host();
        $rootScope.codePath = "";
        $rootScope.candidatePath = "/json/candidates.json";
        $rootScope.positionPath = "/json/positions.json";
        $rootScope.applicationPath = "/json/applications.json";

        console.log("Localhost. Site Path: " + $rootScope.sitePath);
        console.log("Localhost. Code Path: " + $rootScope.codePath);
        console.log("Localhost. Candidate Path: " + $rootScope.candidatePath); // Use variables to build a Path to the JSON data file.
        console.log("Localhost. Position Path: " + $rootScope.positionPath);
        console.log("Localhost. Application Path: " + $rootScope.applicationPath);

        // Call the dataFactory function to get data from a file or from an API.
        // GET some data and store it in a object on $scope. This will only work locally if $http is included in the controller. In this case $http is used in the Factory, so we don't need it here.
        // dataFactory needs to be included in the Controller
        // there needs to the promises resolved in the factory and controller (here). If you dont have two .then calls, the factory will just return the unresolved $http.get   

        dataFactory.getListData($rootScope.candidatePath)
            .then(function (result) {
                $scope.candidateJSON = result;
                angular.forEach($scope.candidateJSON, function (row) {
                    var result = String(row.SkillsValue).replace(/\|[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+/g, ""); // finds guid after "|" and replaces with "" (blank)
                    result = String(result).replace(/\;+/g, "; "); // find ";" and replace with "; ". At some point this needs to be smarter.
                    row.SkillsValue = result;
                });
                console.log($scope.candidateJSON);

            });

        dataFactory.getListData($rootScope.positionPath) // uses .then to let the dataFactory work before setting the data result
        .then(function (result) {
            $scope.positionsJSON = result;
            $scope.openPositions = $filter('filter')(result, {
                PositionClosed: null
            });
            $scope.openPositions = $filter('filter')($scope.openPositions, {
                PositionOpened: '!!'
            }); // get only open positions; !! means not null
            console.log($scope.positionsJSON);
        });

        dataFactory.getListData($rootScope.applicationPath)
            .then(function (result) {
                $scope.applicationsJSON = result;
                
                dataFactory.getListData($rootScope.positionPath) // uses .then to let the dataFactory work before setting the data result
                    .then(function (result2){
                    $scope.positionsJSON = result2;
                    }); // This nested dataFactory really shouldn't be here. Its here because the execution of calls was causing a problem. Position or Candidate would be blank if the scope wasnt set yet.
                          
                 dataFactory.getListData($rootScope.candidatePath)
                    .then(function (result3) {
                    $scope.candidateJSON = result3;
                    });

                //$scope.candidateJSON = result;
                angular.forEach($scope.applicationsJSON, function (obj) { // for each Application, go find the Candidate and Position data
                    $scope.currentCandidate = $filter('filter')($scope.candidateJSON, {
                        Id: obj.CandidateId
                    });
                    console.log("Current Candidate: " + $scope.currentCandidate);
                    
                    $scope.currentPosition = $filter('filter')($scope.positionsJSON, {
                        Id: obj.ApplicationPositionId
                    });
                    console.log("Current Postion: " + $scope.currentPosition);
                    
                    if($scope.currentCandidate) {obj.CandidateArray = $scope.currentCandidate[0];} // we are using [0] because we expect an array with only one object, so we grab the first (only) one                
                    if($scope.PositionArray) {obj.PositionArray = $scope.currentPosition[0]};  // this 0 is failing for applications without candidates
                });
                $scope.openApplications = $filter('filter')($scope.applicationsJSON, { ApplicationClosed: false }); // get only open applications
            //console.log($scope.applicationsJSON);
            //console.log($scope.openApplications);
            });


        // User 'filter' filter to find applications that are not closed. We pass the getListData result to filter and use it to set openApplications.
        // Filter example ... $scope.gradeA = $filter('filter')($scope.myResults.subjects, {grade: 'A'});

    } // end ELSE

    /************ MODAL FORM
    For modal forms we rely on 
        - contextInfo, an object contains the Site, List, and template URLs
        - crudFactory, a set of functions for create, read, update, delete ability
    In the controller we must include $modal and crudFactory
    *************/

    $scope.contextInfo = {
        "Site": "/sites/ACTS/",
        "List": "Personnel",
        "AddForm": "views/personnel/AddItem.html",
        "EditForm": "views/personnel/EditItem.html"
    };
    $scope.addCandidate = function () {
        console.log("Button Press --- Add Candidate");
        console.log("Add Form Context: " + $scope.contextInfo.AddForm);
        $scope.form = {};
        $scope.form.Name = 'modalForm';
        $scope.ePerson = {}; // create a blank object that is referenced in the AddItem modal form
        $scope.ePersonSkills = [];
        var modalInstance = $modal.open({ //create the modal instance specific to the context, in this case Personnel Add Form
            templateUrl: $scope.contextInfo.AddForm,
            controller: 'ModalCtrl',
            scope: $scope
        });

        modalInstance.result.then(function (commit) {
            if (commit) {
                crudFactory.submitNewData($scope.contextInfo, $scope.ePerson)
                    .then(function (uPerson) {
                        $scope.personnel.push(uPerson);
                        var skillsContext = {
                            "Site": $scope.contextInfo.Site,
                            "List": "Personnel Skills"
                        };
                        angular.jforEach($scope.ePersonSkills, function (skill, i) {
                            if (skill.Id == undefined) {
                                if (skill.remove == undefined) {
                                    skill.PersonId = uPerson.Id;
                                    crudFactory.submitNewData(skillsContext, skill).then(function (uSkill) {
                                        $scope.personSkills.push(uSkill);
                                    });
                                }
                            }
                        });
                    });
            }
        });
    };    
    
    /** START
    **/
    
    nameArray = new Array("Word", "Excel", "Documentum", "Alfresco");
    var myString = 'Software:	MS SharePoint 2010, Excel, Word, Project, Visio, PowerPoint, Outlook, Open Text RedDot 7.0 CMS, Wordpress CMS, Adobe CS5 Dreamweaver, HP PPM Demand Management7.1 Languages:	HTML, CSS, JavaScript, PHP Methodologies:	Agile Scrum, SDLC, Waterfall, Project Management Body of Knowledge (PMBOK) Training:	SharePoint, Project Management, ITSM, ITIL, Borland CaliberRM ';
    var matches = [];
    for (i = 0; i < nameArray.length; i++) {
        var nameRegEx =  new RegExp("\\b" + nameArray[i] + "\\b", "g");

        if(nameRegEx.test(myString)) {
          matches.push(nameArray[i]);
        }
    }
    console.log(nameArray);
    console.log(matches);
    
    
    /** END
    **/

    $scope.candidateFilter = {
        filterText: ''
    }; // create empty filter. The view sets up an ng-model (candidateFilter.filterText) to bind the control
    $scope.myCandidateSelections = []; //set up the array that will hold the selected items
    $scope.candidateGrid = {
        data: 'candidateJSON',
        selectedItems: $scope.myCandidateSelections,
        multiSelect: false,
        enableColumnResize: true,
        filterOptions: $scope.candidateFilter,
        columnDefs: [{
                field: 'Fullname',
                displayName: 'Name',
                width: 110
            },
            {
                field: 'SkillsValue',
                displayName: 'Skills'
            } // there is a bug in NG-Grid
                                      ]
    }
    // Options: https://github.com/angular-ui/ng-grid/wiki/Defining-columns
    // Remove columnDefs to display all fields

    $scope.myApplicantSelections = []; //set up the array that will hold the selected items
    $scope.applicationsGrid = {
        data: 'applicationsJSON',
        selectedItems: $scope.myApplicantSelections,
        multiSelect: false,
        enableColumnResize: true,
        columnDefs: [{
                field: 'CandidateArray.Fullname',
                displayName: 'Name'
            },
            {
                field: 'PositionArray.Position',
                displayName: 'Position'
            },
            {
                field: 'ApplicationStatusValue',
                displayName: 'Status'
            }]
    }

    $scope.positionFilter = {
        filterText: ''
    }; // create empty filter.
    $scope.myPositionSelections = []; //set up the array that will hold the selected items
    $scope.positionsGrid = {
        data: 'positionsJSON',
        selectedItems: $scope.myPositionSelections,
        multiSelect: false,
        enableColumnResize: true,
        showFilter: true,
        filterOptions: $scope.positionFilter,
        columnDefs: [{
                field: 'Position',
                displayName: 'Position',
                width: 190
            },
                                       // { field: 'ProjectsValue | cleanMetadata', displayName: 'Project'},
            {
                field: 'PositionOpened | cleanDate',
                displayName: 'Opened',
                cellFilter: 'date:\'yyyy-MM-dd\''
            },
            {
                field: 'PositionClosed | cleanDate',
                displayName: 'Closed',
                cellFilter: 'date:\'yyyy-MM-dd\''
            }
                                ]
    }

    $scope.applicationFilter2 = {
        filterText: ''
    }; // create empty filter.
    $scope.myApplicantSelections2 = []; //set up the array that will hold the selected items
    $scope.applicationsGrid2 = {
        data: 'openApplications',
        selectedItems: $scope.myApplicantSelections,
        multiSelect: false,
        enableColumnResize: true,
        showGroupPanel: true,
        columnDefs: [{
                field: 'CandidateArray.Fullname',
                displayName: 'Candidate'
            },
            {
                field: 'PositionArray.ProjectsValue | cleanMetadata',
                displayName: 'Project'
            },
            {
                field: 'PositionArray.Position',
                displayName: 'Position'
            },
            {
                field: 'ApplicationStatusValue',
                displayName: 'Status'
            },
            {
                field: 'StatusDate | cleanDate',
                displayName: 'Status Date',
                cellFilter: 'date:\'yyyy-MM-dd\''
            },
            {
                field: 'CandidateArray.EMailPersonal',
                displayName: 'Email'
            },
            {
                field: 'CandidateArray.PhoneMobile',
                displayName: 'Mobile'
            }
                                          ]
    }


    $scope.positionFilter2 = {
        filterText: ''
    }; // create empty filter.
    $scope.myPositionSelections2 = []; //set up the array that will hold the selected items
    $scope.positionsGrid2 = {
        data: 'openPositions',
        selectedItems: $scope.myPositionSelections2,
        multiSelect: false,
        enableColumnResize: true,
        enableColumnReordering: true,
        enableRowReordering: true,
        showColumnMenu: true,
        showGroupPanel: true,
        filterOptions: $scope.positionFilter,
        columnDefs: [{
                field: 'Position',
                displayName: 'Position',
                width: 190
            },
            {
                field: 'ProjectsValue | cleanMetadata',
                displayName: 'Project',
                width: 190
            },
            {
                field: 'PositionOpened | cleanDate',
                displayName: 'Opened',
                cellFilter: 'date:\'yyyy-MM-dd\'',
                width: 190
            },
            {
                field: 'LocationValue | cleanMetadata',
                displayName: 'Location'
            }
              ]
    }

});



// Modal example from Angular site
app.controller('ModalDemoCtrl', function ($scope, $modal, $log) {

    $scope.items = ['item1', 'item2', 'item3'];

    $scope.open = function (size) {

        var modalInstance = $modal.open({
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });

        modalInstance.result.then(
            function (selectedItem) {
                $scope.selected = selectedItem;
            },
            function () {
                console.log('Modal dismissed at: ' + new Date());
            }
        );
    };
});

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


app.controller('FilterCtrl', function ($scope, filterService) {
    $scope.filterService = filterService;
});