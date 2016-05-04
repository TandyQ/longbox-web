myApp.factory('ComicVine', ['$rootScope', '$http', '$q', 'DateUtils', '$filter',
    function($rootScope, $http, $q, DateUtils, $filter) {

        var baseComicVineUrl = "http://www.comicvine.com/api/";
        var comicDateQuery = "&filter=store_date:";

        var constructURL = function(queryType, options) {
            var queryUrl = baseComicVineUrl;

            if (queryType === "comic") {
                queryUrl += "issues/?format=jsonp&json_callback=JSON_CALLBACK";
            } else if (queryType === "series") {
                queryUrl += "series/?format=jsonp&json_callback=JSON_CALLBACK";
            }

            if (options.date) {
                var date = options.date;
                queryUrl += comicDateQuery + date.getFullYear() + "-" + (date.getUTCMonth() + 1) + "-" +
                    date.getUTCDate();
            } else if (options.query) {
                queryUrl += options.query + "&";
            } else if (options.resourceURI) {
                queryUrl = options.resourceURI + "?";
            } else {
                // shouldn't ever get here
            }

            var deferred = $q.defer();
            $http.get("config/config.json").then(function successCallback(response) {
                queryUrl += "&api_key=" + response.data.COMIC_VINE_API_KEY;
                deferred.resolve(queryUrl);
            }, function errorCallback(response) {
                $rootScope.errorMessage = response.statusText;
            });
            return deferred.promise;
        };

        var queryComics = function(queryUrl) {
            // console.log(queryUrl); //logging query URL
            var deferred = $q.defer();
            $http.jsonp(queryUrl).then(function successCallback(response) {
                deferred.resolve(response.data);
            }, function errorCallback(response) {
                deferred.resolve(response.statusText);
            });
            return deferred.promise;
        };

        var myObject = {
            getComicDataForWeek: function(date) {
                var promise = constructURL("comic", { "date": date }).then(queryComics).then(function(response) {
                    relevantComics = [];
                    for (var i = 0; i < response.results.length; i++) {
                        var comic = response.results[i];
                        relevantComics.push(comic);
                    }
                    console.log(relevantComics);
                    return relevantComics;
                });
                return promise;
            }
        };

        return myObject;
    }
]);
