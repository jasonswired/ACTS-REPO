(function(){

	var candidatesModule = angular.module('personnel', []); // 'skills', 'crud', 'ui.bootstrap'
	    
	candidatesModule.controller('PersonnelController', ['$scope', '$q', 'personnelFactory', 
                                function($scope, $q, personnelFactory){
   /*  '$modal', 
   $modal,
   
   took out */    
                                    
        $scope.contextInfo = {"Site": "/sites/Development/", "List": "Personnel", "AddForm": "views/personnel/AddItem.html","EditForm": "views/personnel/EditItem.html"};
		
        //window.alert('TESTING');
    
		$q.all([personnelFactory.getPersonnel()]).then(function(dataReturned){
			console.log(dataReturned[0]);
            $scope.personnel = dataReturned[0]; 
                // Fixed ... I would rather not need to get down to the .value array here. the factory should return correct array
			
			$scope.$watch('personnel', function(){
				personnelFactory.updatePersonnel($scope.personnel);
			}, true);
			
		});
		
    /****************************************************************
    
		$scope.edit = function (item) {
			$scope.form = {};
			$scope.form.Name = 'modalForm';
			$scope.ePerson = {};
			$scope.ePersonSkills = [];
			angular.copy(item, $scope.ePerson);
			//angular.copy($scope.personSkills, $scope.ePersonSkills); //copy the contents of personSkills to ePersonSkills ??
			var modalInstance = $modal.open({
				templateUrl: $scope.contextInfo.EditForm,
				controller: 'ModalCtrl',
				scope: $scope
			});
			
			modalInstance.result.then(function(commit){
				if (commit){
					angular.copy($scope.ePerson, item);
					var skillsContext = {"Site": $scope.contextInfo.Site, "List": "Personnel Skills"};
					angular.forEach($scope.ePersonSkills, function(skill, i){
						if(skill.PersonId === item.Id){
							if (skill.remove == true){
								if(skill.Id != undefined){
									$scope.personSkills.splice(i,1);
									crudFactory.submitDeleteData(skillsContext,skill).then(function(){
									});
								}
							}
							else if(skill.Id == undefined){
								crudFactory.submitNewData(skillsContext,skill).then(function(uSkill){
									$scope.personSkills.push(uSkill);
								});
							}
							else{
								angular.copy(skill, $scope.personSkills[i]);
								crudFactory.submitUpdateData(skillsContext,skill).then(function(){
								});
							}
						}
					});
					crudFactory.submitUpdateData($scope.contextInfo,item).then(function(){
					});
				}
			});
		
		};
		
		$scope.add = function () {
			$scope.form = {};
			$scope.form.Name = 'modalForm';
			$scope.ePerson = {};
			$scope.ePersonSkills = [];
			var modalInstance = $modal.open({
				templateUrl: $scope.contextInfo.AddForm,
				controller: 'ModalCtrl',
				scope: $scope
			});
			
			modalInstance.result.then(function(commit){
				if (commit){
					crudFactory.submitNewData($scope.contextInfo,$scope.ePerson).then(function(uPerson){
						$scope.personnel.push(uPerson);
						var skillsContext = {"Site": $scope.contextInfo.Site, "List": "Personnel Skills"};
						angular.forEach($scope.ePersonSkills, function(skill, i){
							if(skill.Id == undefined){
								if(skill.remove == undefined){
									skill.PersonId = uPerson.Id;
									crudFactory.submitNewData(skillsContext,skill).then(function(uSkill){
										$scope.personSkills.push(uSkill);
									});
								}
							}
						});
					});
				}
			});
		};
		
		$scope.addSkill = function (personId) {
			var newSkill = {"PersonId": personId};
			$scope.ePersonSkills.push(newSkill);
		};
		
		$scope.removeSkill = function (eSkill) {
			eSkill.remove = true;
			eSkill.SkillId = null;
			if(eSkill.Id != undefined){
				$scope.form.Name.$dirty = true;
			}
		};
        
        **************************************/
        
	}]);
	
	candidatesModule.factory('personnelFactory', ['$http', '$q', '$rootScope', function($http, $q, $rootScope) {
		
            var urlBase = "https://consultus.sharepoint.com/sites/Development";
            var web = location.protocol + "//" + location.host;
        
            if(web!=urlBase) // check if we're on the jTHREE site. If not, use local JSON files.
            {
              console.log('Using local JSON files');
            
              var getPersonnel = function(){
                  return $http.get('json/candidates.json')
                  .then(
                    function(result){return result.data.d.results; },     // return the Array of results (for SP2010)
                    function(result){console.log(result.d.results);} // output  the Array of results (for SP2010) to the console so we can take a look
                       );
              }
                
               /**** I'm not sure why this doesnt work with a 'return'. The .success doesnt work, so I had to use .then
                $http.get('json/personnelItems.json')
                    .success(function(data){console.log(data);})
                    .error(function(data, status){window.alert('Error: ' + status +' ... Probably cant find the personnelItems file.');})
                  ;
                */
                
               var getPersonFromId = function(personId){
                   return $http.get('json/personnelItem_ID_1.json')
                    .then(
                    function(result){return result.d.results; },     // return the object
                    function(result){console.log(result.d.results);} // output the object to the console so we can take a look
                       );
                   }
            }
            else
            {
                console.log('Calling APIS');
                var getPersonnel = function(){
				    return $http.get(urlBase + "/_api/web/lists/getbytitle('Personnel')/items");               
			     };
                 
                /*
                 $http.get(urlBase + "/_api/web/lists/getbytitle('Personnel')/items")
                    .success(function(data){window.alert('Success!'); $scope.getPersonnel = data.value;})
                    .error(function(data, status){window.alert('Error: ' + status + ' - ' + urlBase);}) 
                */
              			
                var getPersonFromId = function(personId){
                    return $http.get(urlBase + "/_api/web/lists/getbytitle('Personnel')/items?$filter=Id eq '"+personId+"'");
                };
			 } // end of IF/ELSE        
                
			var updatePersonnel = function(personnel){
				$rootScope.$broadcast('updatePersonnel', personnel);
			};
			
			return {getPersonnel: getPersonnel,
					getPersonFromId: getPersonFromId,
					updatePersonnel: updatePersonnel}
	}]);
    
})
();