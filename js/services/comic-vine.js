myApp.factory('ComicVine', ['$rootScope', '$http', '$q', 'DateUtils', 'Settings', '$filter',
    function($rootScope, $http, $q, DateUtils, Settings, $filter) {
        var resultsPerPage = 100;
        var parsedResults = [];

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
            if (options.limit) {
                queryUrl += "&limit=" + options.limit;
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
                // console.log(queryUrl); //logging query URL
                deferred.resolve(queryUrl);
            }, function errorCallback(response) {
                $rootScope.errorMessage = response.statusText;
            });
            return deferred.promise;
        };

        var queryComics = function(queryUrl) {
            var deferred = $q.defer();
            $http.jsonp(queryUrl).then(function successCallback(response) {
                deferred.resolve(response);
            }, function errorCallback(response) {
                deferred.resolve(response.statusText);
            });
            return deferred.promise;
        };

        var createSortName = function(name) {
            name = name.toLowerCase();
            cutIndex = name.indexOf("the ");
            if (cutIndex === 0) {
                name = name.replace("the ", "");
            }
            return name;
        };

        var parseComics = function(comics) {
            for (var i = 0; i < comics.results.length; i++) {
                var comic = comics.results[i];
                if (!comic.name) {
                    comic.name = '';
                }
                if (comic.name.toLowerCase().indexOf("tpb") < 0 &&
                    comic.name.toLowerCase().indexOf("vol") < 0) {
                    comic.series = comic.volume;
                    comic.sortName = createSortName(comic.series.name);
                    if (!comic.description) {
                        comic.description = "No description available.";
                    }
                    comic.series.resourceURI = comic.volume.api_detail_url;
                    comic.issueNumber = comic.issue_number;

                    var imageUrl = "";
                    var coverQuality = Settings.getCoverQuality();
                    if (coverQuality === "medium") {
                        imageUrl = comic.image.medium_url;
                    } else if (coverQuality === "small") {
                        imageUrl = comic.image.small_url;
                    } else if (coverQuality === "large") {
                        imageUrl = comic.image.super_url;
                    }
                    comic.thumbnail = {
                        extension: imageUrl.substr(imageUrl.lastIndexOf('.') + 1),
                        path: imageUrl.substr(0, imageUrl.lastIndexOf('.'))
                    };
                    parsedResults.push(comic);
                }
            }
        };

        var parseVolumes = function(volumes) {
            for (var i = 0; i < volumes.results.length; i++) {
                var volume = volumes.results[i];
                volume.title = volume.name;
                volume.sortName = createSortName(volume.name);
                volume.resourceURI = volume.api_detail_url;
                volume.endYear = 2099;
                if (!volume.description) {
                    volume.description = "No description available.";
                }
                parsedResults.push(volume);
            }
        };

        var loadComicDataForWeek = function(dateRange, offset) {
            var promise = constructURL("comic", { "dateRange": dateRange, "offset": offset }).then(queryComics).then(function(response) {
                offset += 100;

                var numTotalResults = response.data.number_of_total_results;
                parseComics(response.data);
                if ((offset) > numTotalResults) {
                    var returnedComics = parsedResults;
                    parsedResults = [];
                    return returnedComics;
                } else {
                    return loadComicDataForWeek(dateRange, offset);
                }
            });
            return promise;
        };

        var loadVolumeDataForId = function(volumeId) {
            var promise = constructURL("volume", { "id": volumeId }).then(queryComics).then(function(response) {
                parseVolumes(response.data);
                // hack for end date
                var volume = parsedResults[0];
                parsedResults = [];
                return volume;
            });
            return promise;
        };

        var loadLatestCoverForIssueId = function(issueId) {
            var promise = constructURL("comic", { "id": issueId }).then(queryComics).then(function(response) {
                var imageUrl = "";
                var coverQuality = Settings.getCoverQuality();
                if (coverQuality === "medium") {
                    imageUrl = response.data.results[0].image.medium_url;
                } else if (coverQuality === "small") {
                    imageUrl = response.data.results[0].image.small_url;
                } else if (coverQuality === "large") {
                    imageUrl = response.data.results[0].image.super_url;
                }
                var thumbnail = {
                    extension: imageUrl.substr(imageUrl.lastIndexOf('.') + 1),
                    path: imageUrl.substr(0, imageUrl.lastIndexOf('.'))
                };
                return thumbnail;
            });
            return promise;
        };

        var loadVolumeDataForQuery = function(queryString, offset) {
            var promise = constructURL("volume", { "query": queryString, "offset": offset }).then(queryComics).then(function(response) {
                offset += 100;
                var numTotalResults = response.data.number_of_total_results;
                parseVolumes(response.data);
                if ((offset) > numTotalResults) {
                    var returnedVolumes = parsedResults;
                    parsedResults = [];
                    return returnedVolumes;
                } else {
                    return loadVolumeDataForQuery(queryString, offset);
                }
            });
            return promise;
        };

        var loadVolumeDataForQueryWithLimit = function(queryString, limit) {
            var promise = constructURL("volume", { "query": queryString, "limit": limit }).then(queryComics).then(function(response) {
                parseVolumes(response.data);
                var returnedVolumes = parsedResults;
                parsedResults = [];
                return returnedVolumes;
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
            clearLoadedResults: function() {
                parsedResults = [];
            },
            getVolumeDataForQuery: function(queryString) {
                return loadVolumeDataForQuery(queryString, 0);
            },
            getVolumeDataForQueryWithLimit: function(queryString, limit) {
                return loadVolumeDataForQueryWithLimit(queryString, limit);
            }
        };

        return myObject;
    }
]);
