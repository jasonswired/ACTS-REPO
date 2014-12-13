(function(){

	var crudModule = angular.module('crud', ['ui.bootstrap']);
	
	crudModule.factory('crudFactory', ['$http', '$q', '$log', function($http, $q, $log) {
			
			var submitNewData = function(context,metadata){
                var deferred = $q.defer();
                        UpdateFormDigest(_spPageContextInfo.webServerRelativeUrl, _spFormDigestRefreshInterval); //refresh form digest to prevent security validation failure. Uses built in INIT.js 
                        // Prepping our update
                        var item = $.extend({
                            "__metadata": { "type": getListItemType(context)}
                        }, metadata);

                        // Executing our add
                        $.ajax({
                            url: context.Site + "/_api/web/lists/getbytitle('" + context.List + "')/items",
                            type: "POST",
                            contentType: "application/json;odata=verbose",
                            data: angular.toJson(item),
                            headers: {
                                "Accept": "application/json;odata=verbose",
                                "X-RequestDigest": $("#__REQUESTDIGEST").val()
                            },
                            success: function (data) {
                                deferred.resolve( data.d);
                            },
                            error: function (data) {
                                $log.error('fail: '+JSON.stringify(data));
                            }
                        });
                    return deferred.promise;
                };

			// UPDATE LIST ITEM - RETURNS UPDATED LIST ITEM
			var submitUpdateData = function(context,metadata){
				var deferred = $q.defer();
					UpdateFormDigest(_spPageContextInfo.webServerRelativeUrl, _spFormDigestRefreshInterval); //refresh form digest to prevent security validation failure. Uses built in INIT.js 
					// Prepping our update
					var item = $.extend({
						"__metadata": { "type": getListItemType(context)}
					}, metadata);
					
					// Executing our add
					getListItem(context.Site, context.List, metadata.Id, function (data) {
						$.ajax({
							url: data.d.__metadata.uri,
							type: "POST",
							contentType: "application/json;odata=verbose",
							data: angular.toJson(item),
							headers: {
								"Accept": "application/json;odata=verbose",
								"X-RequestDigest": $("#__REQUESTDIGEST").val(),
								"X-HTTP-Method": "MERGE",
								"If-Match": data.d.__metadata.etag
							},
							success: function (data) {
								getListItem(context.Site, context.List, metadata.Id,
									function (newData) {
										deferred.resolve( newData.d);
									}, function (newData) {
									failure(data);
									}
								);
							},
							error: function (data) {
								$log.error('fail: '+JSON.stringify(data));
							}
						});
					}, function (data) {
						failure(data);
					});
				return deferred.promise;
			};
			
			// Deleting a List Item based on the ID
			var submitDeleteData = function(context,metadata) {

				var deferred = $q.defer();
				
				UpdateFormDigest(_spPageContextInfo.webServerRelativeUrl, _spFormDigestRefreshInterval); //refresh form digest to prevent security validation failure. Uses built in INIT.js 
				getListItem(context.Site, context.List, metadata.Id, function (data) {
					$.ajax({
						url: data.d.__metadata.uri,
						type: "POST",
						headers: {
							"Accept": "application/json;odata=verbose",
							"X-Http-Method": "DELETE",
							"X-RequestDigest": $("#__REQUESTDIGEST").val(),
							"If-Match": data.d.__metadata.etag
						},
						success: function (data) {
							deferred.resolve();
						},
						error: function (data) {
							failure(data);
						}
					});
				});
				return deferred.promise;
			};
			
			var getListItem = function(url, listname, id, complete, failure) {
				$.ajax({
					url: url + "/_api/web/lists/getbytitle('" + listname + "')/items(" + id + ")",
					method: "GET",
					headers: { "Accept": "application/json; odata=verbose" },
					success: function (data) {
						// Returning the results
						complete(data);
					},
					error: function (data) {
						failure(data);
					}
				});
			}

			// Used by CRUD functions to get the item type for the list
			function getListItemType(context) {
				var itemType = "ListItem";
				return "SP.Data." + context.List.replace(/ /g,'_x0020_') + itemType;
			}
			
			return {submitNewData: submitNewData,
					submitUpdateData: submitUpdateData,
					submitDeleteData: submitDeleteData,
					getListItem: getListItem,
					getListItemType: getListItemType}
	}]);
	
})();