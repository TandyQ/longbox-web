myApp.factory('ComicVine', ['$rootScope', '$http', '$q', 'DateUtils', '$filter',
    function($rootScope, $http, $q, DateUtils, $filter) {

        var resultsPerPage = 100;
        var comicResults = [];

        var baseComicVineUrl = "http://www.comicvine.com/api/";
        var comicDateQuery = "&filter=store_date:";
        var comicIdQuery = "&filter=id:";

        var constructURL = function(queryType, options) {
            var queryUrl = baseComicVineUrl;

            if (queryType === "comic") {
                queryUrl += "issues/?format=jsonp&json_callback=JSON_CALLBACK";
            } else if (queryType === "series") {
                queryUrl += "series/?format=jsonp&json_callback=JSON_CALLBACK";
            } else if (queryType === "volume") {
                queryUrl += "volumes/?format=jsonp&json_callback=JSON_CALLBACK";
            }
            if (options.offset) {
                queryUrl += "&offset=" + options.offset;
            }

            if (options.dateRange) {
                var dateRange = options.dateRange;
                queryUrl += comicDateQuery + dateRange.firstDate.getFullYear() + "-" + (dateRange.firstDate.getUTCMonth() + 1) + "-" +
                    dateRange.firstDate.getUTCDate() + "|" + dateRange.lastDate.getFullYear() + "-" + (dateRange.lastDate.getUTCMonth() + 1) +
                    "-" + dateRange.lastDate.getUTCDate();
            } else if (options.query) {
                queryUrl += options.query;
            } else if (options.id) {
                queryUrl += comicIdQuery + options.id;
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
                deferred.resolve(response);
            }, function errorCallback(response) {
                deferred.resolve(response.statusText);
            });
            return deferred.promise;
        };

        var parseComics = function(comics) {
            for (var i = 0; i < comics.results.length; i++) {
                var comic = comics.results[i];
                comic.series = comic.volume;
                comic.series.name = comic.series.name;
                comic.series.resourceURI = comic.volume.api_detail_url;
                comic.issueNumber = comic.issue_number;
                var imageUrl = comic.image.super_url;
                comic.thumbnail = {
                    extension: imageUrl.substr(imageUrl.lastIndexOf('.') + 1),
                    path: imageUrl.substr(0, imageUrl.lastIndexOf('.'))
                };
                comicResults.push(comic);
            }
            console.log(comicResults);
        };

        var loadComicDataForWeek = function(dateRange, offset) {
            var promise = constructURL("comic", { "dateRange": dateRange, "offset": offset }).then(queryComics).then(function(response) {
                if (offset === 0) {
                    offset += 99;
                } else {
                    offset += 100;
                }

                var numTotalResults = response.data.number_of_total_results;
                parseComics(response.data);
                if ((offset) > numTotalResults) {
                    var returnedComics = comicResults;
                    comicResults = [];
                    return returnedComics;
                } else {
                    return loadComicDataForWeek(dateRange, offset);
                }
            });
            return promise;
        };

        var loadVolumeDataForId = function(volumeId) {
            var promise = constructURL("volume", { "id": volumeId }).then(queryComics).then(function(response) {
                console.log(response.data);
                // temporary hack for end date
                var volume = response.data.results[0];
                volume.title = volume.name;
                volume.endYear = 2099;
                return volume;
            });
            return promise;
        };

        var loadLatestCoverForIssueId = function(issueId) {
            var promise = constructURL("comic", { "id": issueId }).then(queryComics).then(function(response) {
                var imageUrl = response.data.results[0].image.super_url;
                var thumbnail = {
                    extension: imageUrl.substr(imageUrl.lastIndexOf('.') + 1),
                    path: imageUrl.substr(0, imageUrl.lastIndexOf('.'))
                };
                return thumbnail;
            });
            return promise;
        };

        var myObject = {
            getComicDataForWeek: function(dateRange) {
                return loadComicDataForWeek(dateRange, 0);
            },
            getVolumeDataForId: function(volumeId) {
                return loadVolumeDataForId(volumeId);
            },
            getLatestCoverForIssueId: function(issueId) {
                return loadLatestCoverForIssueId(issueId);
            },
            clearLoadedComics: function() {
                console.log("load cleared");
                comicResults = [];
            }
        };

        return myObject;
    }
]);
