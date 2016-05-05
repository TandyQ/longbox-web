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

            if (options.dateRange) {
                var dateRange = options.dateRange;
                queryUrl += comicDateQuery + dateRange.firstDate.getFullYear() + "-" + (dateRange.firstDate.getUTCMonth() + 1) + "-" +
                    dateRange.firstDate.getUTCDate() + "|" + dateRange.lastDate.getFullYear() + "-" + (dateRange.lastDate.getUTCMonth() + 1) +
                    "-" + dateRange.lastDate.getUTCDate() + "&";
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
            console.log(queryUrl); //logging query URL
            var deferred = $q.defer();
            $http.jsonp(queryUrl).then(function successCallback(response) {
                deferred.resolve(response.data);
            }, function errorCallback(response) {
                deferred.resolve(response.statusText);
            });
            return deferred.promise;
        };

        var myObject = {
            getComicDataForWeek: function(dateRange) {
                console.log(dateRange);
                var promise = constructURL("comic", { "dateRange": dateRange }).then(queryComics).then(function(response) {
                    relevantComics = [];
                    for (var i = 0; i < response.results.length; i++) {
                        var comic = response.results[i];
                        comic.series = comic.volume;
                        comic.series.name = comic.series.name + " ";
                        comic.series.resourceURI = comic.api_detail_url;
                        comic.issueNumber = comic.issue_number;
                        var imageUrl = comic.image.super_url;
                        comic.thumbnail = {
                            extension: imageUrl.substr(imageUrl.lastIndexOf('.')+1),
                            path: imageUrl.substr(0, imageUrl.lastIndexOf('.'))
                        };
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
