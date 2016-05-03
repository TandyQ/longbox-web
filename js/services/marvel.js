myApp.factory('Marvel', ['$rootScope', '$http', '$q', 'DateUtils', '$filter',
    function($rootScope, $http, $q, DateUtils, $filter) {

        var IMAGE_NOT_AVAILABLE = "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available";
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
                queryUrl += "apikey=" + response.data.API_KEY;
                deferred.resolve(queryUrl);
            }, function errorCallback(response) {
                // $rootScope.errorMessage = response.statusText;
            });
            return deferred.promise;
        };

        var queryComics = function(marvelQueryUrl) {
            // console.log(marvelQueryUrl); //logging query URL
            var deferred = $q.defer();
            $http.get(marvelQueryUrl).then(function successCallback(response) {
                deferred.resolve(response.data);
            }, function errorCallback(response) {
                deferred.resolve(response.statusText);
            });
            return deferred.promise;
        };

        var myObject = {
            getComicDataForQuery: function(queryString) {
                var promise = constructURL("comic", { "query": queryString }).then(queryComics).then(function(response) {
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
                    relevantComics = [];
                    for (var i = 0; i < response.data.results.length; i++) {
                        var comic = response.data.results[i];

                        if (comic.variantDescription === "") {
                            relevantComics.push(comic);
                        }
                    }
                    console.log(relevantComics);
                    return relevantComics;
                });
                return promise;
            },
            getSeriesDataForResourceURI: function(resourceURI) {
                var promise = constructURL("series", { "resourceURI": resourceURI }).then(queryComics).then(function(response) {
                    return response.data.results[0];
                });
                return promise;
            },
            getLatestComicCoverForSeriesId: function(seriesId) {
                var promise = constructURL("", { "query": "series/" + seriesId + "/comics?format=comic&formatType=comic&noVariants=true&orderBy=-onsaleDate" }).
                then(queryComics).then(function(response) {
                    var thumbnail;
                    if (response.data.results.length > 0) {
                        if (response.data.results[response.data.results.length - 1].thumbnail.extension &&
                            response.data.results[response.data.results.length - 1].thumbnail.path) {
                            thumbnail = {
                                extension: response.data.results[response.data.results.length - 1].thumbnail.extension,
                                path: response.data.results[response.data.results.length - 1].thumbnail.path,
                            };
                        }
                    }

                    var haveThumbnail = false;
                    for (var i = 0; i < response.data.results.length; i++) {
                        var comic = response.data.results[i];
                        var releaseDate = $filter('filter')(comic.dates, { type: "onsaleDate" }, true);
                        if (releaseDate.length !== 0) {
                            formattedReleaseDateString = releaseDate[0].date.slice(0, 19);
                            formattedReleaseDate = Date.parse(formattedReleaseDateString);

                            var wedDate = DateUtils.getWednesdayDate(new Date());
                            if ((formattedReleaseDate <= wedDate) && (comic.thumbnail.path !== IMAGE_NOT_AVAILABLE)) {
                                if (comic.thumbnail.extension && comic.thumbnail.path) {}
                                thumbnail = {
                                    extension: comic.thumbnail.extension,
                                    path: comic.thumbnail.path
                                };
                                break;
                            }
                        }
                    }
                    if (!thumbnail) {
                        thumbnail = {
                            extension: "jpg",
                            path: IMAGE_NOT_AVAILABLE
                        };
                    }
                    return thumbnail;
                });
                return promise;
            },
            getComicDataForResourceURI: function(resourceURI) {
                var promise = constructURL("comic", { "resourceURI": resourceURI }).then(queryComics).then(function(response) {
                    return response.data.results[0];
                });
                return promise;
            },
            getSeriesDataForQuery: function(queryString) {
                var promise = constructURL("series", { "query": queryString }).then(queryComics).then(function(response) {
                    relevantSeries = [];
                    for (var i = 0; i < response.data.results.length; i++) {
                        var series = response.data.results[i];
                        if (series.comics.items.length > 0) {
                            relevantSeries.push(series);
                        }

                    }
                    console.log(relevantSeries);
                    return relevantSeries;
                });
                return promise;
            }
        };

        return myObject;
    }
]);
