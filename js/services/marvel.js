myApp.factory('Marvel', ['$rootScope', '$http', '$q',
    function($rootScope, $http, $q) {

        var baseMarvelUrl = "http://gateway.marvel.com/v1/public/";
        var comicDateQuery = "limit=100&format=comic&formatType=comic&orderBy=title&dateRange=";

        var constructURL = function(queryType, options) {
            var queryUrl = baseMarvelUrl;

            if (queryType === "comic") {
                queryUrl += "comics?";
            } else if (queryType === "series") {
                queryUrl += "series?";
            }

            if (options.dateRange) {
                var dateRange = options.dateRange;
                queryUrl += comicDateQuery + dateRange.firstDate.getFullYear() + "-" + (dateRange.firstDate.getUTCMonth() + 1) + "-" +
                    dateRange.firstDate.getUTCDate() + "%2C" + dateRange.lastDate.getFullYear() + "-" + (dateRange.lastDate.getUTCMonth() + 1) +
                    "-" + dateRange.lastDate.getUTCDate();
            } else if (options.query) {
                queryUrl += query;
            } else {
                // shouldn't ever get here
            }

            var deferred = $q.defer();
            $http.get("config/config.json").then(function successCallback(response) {
                queryUrl += "&apikey=" + response.data.API_KEY;
                deferred.resolve(queryUrl);
            }, function errorCallback(response) {
                // $rootScope.errorMessage = response.statusText;
            });
            return deferred.promise;
        };

        var queryComics = function(marvelQueryUrl) {
            console.log(marvelQueryUrl);
            var deferred = $q.defer();
            $http.get(marvelQueryUrl).then(function successCallback(response) {
                deferred.resolve(response.data);
            }, function errorCallback(response) {
                deferred.resolve(response.statusText);
            });
            return deferred.promise;
        };

        var myObject = {
            getComicDataForQuery: function(queryUrl) {
                var promise = constructURL("comic", { "query": queryUrl }).then(queryComics).then(function(response) {
                    console.log(response.data);
                    relevantComics = [];
                    for (var i = 0; i < response.data.results.length; i++) {
                        var comic = response.data.results[i];

                        if (comic.variantDescription === "") {
                            relevantComics.push(comic);
                        }
                    }
                    return relevantComics;
                });
                return promise;
            },
            getComicDataForWeek: function(dateRange) {

                var promise = constructURL("comic", { "dateRange": dateRange }).then(queryComics).then(function(response) {
                    console.log(response.data);
                    relevantComics = [];
                    for (var i = 0; i < response.data.results.length; i++) {
                        var comic = response.data.results[i];

                        if (comic.variantDescription === "") {
                            relevantComics.push(comic);
                        }
                    }
                    return relevantComics;
                });
                return promise;
            }
        };

        return myObject;
    }
]);
