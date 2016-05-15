myApp.controller('SearchController', ['$scope', '$modal', '$sce', '$routeParams', '$location', 'Settings', 'Marvel', 'ComicVine', 'DateUtils', 'PullListUtils', 'FirebaseUtils', '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL',
    function($scope, $modal, $sce, $routeParams, $location, Settings, Marvel, ComicVine, DateUtils, PullListUtils, FirebaseUtils, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);
        $scope.currentYear = new Date().getFullYear();
        $scope.searchString = $routeParams.seriesSearch;
        $scope.isLoading = false;
        $scope.hasComics = true;
        $scope.resultsMessage = "";

        var loadSeriesMatchingString = function(string) {
            $scope.hasComics = true;
            $scope.isLoading = true;
            var selectedService = Settings.getSelectedServicePrefix();
            var queryString = '';
            if (selectedService == 'marvel') {
                queryString = "titleStartsWith=" + string + "&seriesType=ongoing";
                queryString = encodeURI(queryString);
                Marvel.getSeriesDataForQuery(queryString).then(function(data) {
                    $scope.seriesData = data;
                    if (data !== "Too Many Requests") {
                        for (var i = 0; i < data.length; i++) {
                            var series = data[i];
                            if (!series.description) {
                                series.description = "No description available.";
                            }
                            $scope.getLatestComicCoverForSeries(series, i);
                        }
                        if ($scope.seriesData.length < 1) {
                            $scope.hasComics = false;
                            $scope.resultsMessage = "The search '" + $scope.searchString + "' did not return any results.";
                        }
                        $scope.isLoading = false;
                    } else {
                        $scope.isLoading = false;
                        $scope.hasComics = false;
                        $scope.resultsMessage = "Reached API Limit";
                    }
                });
            } else if (selectedService == 'comic-vine') {
                // WARNING: Comic Vine is not set up to be used with the current Firebase data management
                // scheme. This is only part of an experimental, in-development support for a resource other
                // than Marvel's api. It currently only has the controller layer. No view or model layers
                // are present.

                ComicVine.clearLoadedResults();
                queryString = "&filter=name:" + string;
                queryString = encodeURI(queryString);
                ComicVine.getVolumeDataForQuery(queryString).then(function(data) {
                    $scope.seriesData = data;
                    for (var i = 0; i < data.length; i++) {
                        var series = data[i];
                        if (!series.description) {
                            series.description = "No description available.";
                        }
                        $scope.getLatestComicCoverForSeries(series, i);
                    }
                    if ($scope.seriesData.length < 1) {
                        $scope.hasComics = false;
                        $scope.resultsMessage = "The search '" + $scope.searchString + "' did not return any results.";
                    }
                    $scope.isLoading = false;
                });
            }
        };

        if ($scope.searchString && $scope.searchString !== "") {
            loadSeriesMatchingString($scope.searchString);
        }

        auth.$onAuth(function(authUser) {
            if (authUser) {
                var pullRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid + '/' + Settings.getSelectedServicePrefix() + '-pulllist/');
                var pullListInfo = $firebaseArray(pullRef);

                pullListInfo.$loaded().then(function(data) {
                    $scope.pullList = data;
                }).catch(function(error) {
                    console.log(error);
                });
            } else {
                $scope.pullList = {};
            }
        });

        $scope.getLatestComicCoverForSeries = function(series, index) {
            if (series.id) {
                var selectedService = Settings.getSelectedServicePrefix();
                if (selectedService == 'marvel') {
                    Marvel.getLatestComicCoverForSeriesId(series.id).then(function(thumbnail) {
                        if ($scope.seriesData[index]) {
                            $scope.seriesData[index].latestComicCoverPath = thumbnail.path;
                            $scope.seriesData[index].latestComicCoverExtension = thumbnail.extension;
                        }
                    });
                } else if (selectedService == 'comic-vine') {
                    // WARNING: Comic Vine is not set up to be used with the current Firebase data management
                    // scheme. This is only part of an experimental, in-development support for a resource other
                    // than Marvel's api. It currently only has the controller layer. No view or model layers
                    // are present.

                    ComicVine.getLatestCoverForIssueId(series.last_issue.id).then(function(thumbnail) {
                        if ($scope.seriesData[index]) {
                            $scope.seriesData[index].latestComicCoverPath = thumbnail.path;
                            $scope.seriesData[index].latestComicCoverExtension = thumbnail.extension;
                        }
                    });
                }
            }
        };

        $scope.openModalForSeries = function(selectedSeries) {
            var modalInstance = $modal.open({
                templateUrl: 'views/series-detail-view.html',
                controller: 'SeriesDetailController',
                resolve: {
                    series: function() {
                        return selectedSeries;
                    },
                    pullList: function() {
                        return $scope.pullList;
                    }
                }
            });
        };

        $scope.searchForSeries = function() {
            if ($scope.searchString !== "") {
                loadSeriesMatchingString($scope.searchString);
            }
        };

        $scope.onPullListChange = function(series) {
            if ($scope.isInPullList(series)) {
                $scope.removeFromPullList(series);
            } else {
                $scope.addComic(series);
            }
        };

        $scope.addSeries = function(series) {
            FirebaseUtils.addToPullList(series.title, series.resourceURI, series.id);
        };

        $scope.removeFromPullList = function(series) {
            if ($scope.pullList) {
                for (var i = 0; i < $scope.pullList.length; i++) {
                    var sub = $scope.pullList[i];
                    if (sub.name === series.title) {
                        FirebaseUtils.removeFromPullList(sub);
                        break;
                    }
                }
            }
        };

        $scope.isInPullList = function(series) {
            return PullListUtils.isInPullList(series.resourceURI, $scope.pullList);
        };

        $scope.isEnded = function(series) {
            if (series.endYear == 2099) {
                return false;
            }
            return true;
        };

        $scope.searchForSeries = function($event) {
            if ($scope.newSearch && $scope.newSearch !== "") {
                $location.path('/search/' + $scope.newSearch);
                $scope.newSearch = "";
            }

        };

        $scope.sourceText = function() {
            var sourceText = '';
            var selectedService = Settings.getSelectedServicePrefix();
            if (selectedService == 'marvel') {
                sourceText = 'Data provided by Marvel. &copy; ' + $scope.currentYear + ' Marvel';
            } else if (selectedService == 'comic-vine') {
                sourceText = 'Data provided by <a href="http://comicvine.gamespot.com/">ComicVine</a>';
            }
            return $sce.trustAsHtml(sourceText);
        };
    }
]);
