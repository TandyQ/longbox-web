myApp.controller('PullListController', ['$scope', '$modal', '$sce', '$filter', 'Settings', 'Marvel', 'ComicVine', 'DateUtils', "PullListUtils",
    "FirebaseUtils", '$firebaseAuth', '$firebaseArray', 'FIREBASE_URL',
    function($scope, $modal, $sce, $filter, Settings, Marvel, ComicVine, DateUtils, PullListUtils,
        FirebaseUtils, $firebaseAuth, $firebaseArray, FIREBASE_URL) {
        var ref = new Firebase(FIREBASE_URL);
        var auth = $firebaseAuth(ref);
        $scope.currentYear = new Date().getFullYear();
        $scope.viewMode = Settings.getViewMode();
        $scope.isLoading = false;
        $scope.hasComics = true;
        $scope.resultsMessage = '';

        auth.$onAuth(function(authUser) {
            if (authUser) {
                var pullRef = new Firebase(FIREBASE_URL + 'users/' + authUser.uid + '/' + Settings.getSelectedServicePrefix() + '-pulllist/');
                var pullListInfo = $firebaseArray(pullRef);

                $scope.seriesData = [];
                $scope.pullList = {};

                pullListInfo.$loaded().then(function(data) {
                    $scope.pullList = data;
                    if ($scope.pullList.length > 0) {
                        for (var i = 0; i < data.length; i++) {
                            var series = data[i];
                            $scope.hasComics = true;
                            $scope.isLoading = true;
                            $scope.getSeries(series);
                        }
                    } else {
                        $scope.hasComics = false;
                        $scope.resultsMessage = "No Subscriptions";
                    }
                    $scope.isLoading = false;
                }).catch(function(error) {
                    console.log(error);
                });

                pullListInfo.$watch(function(data) {
                    for (var i = 0; i < $scope.pullList.length; i++) {
                        var seriesResults = $filter('filter')($scope.seriesData, { title: $scope.pullList[i].name }, true);
                        if (seriesResults.length === 0) {
                            var series = $scope.pullList[i];
                            $scope.getSeries(series);
                        }
                    }
                    for (var j = 0; j < $scope.seriesData.length; j++) {
                        var dataResults = $filter('filter')($scope.pullList, { name: $scope.seriesData[j].title }, true);
                        if (dataResults.length === 0) {
                            $scope.seriesData.splice(j, 1);
                        }
                    }
                });
            } else {
                $scope.pullList = {};
            }
        });

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

        $scope.getSeries = function(series) {
            if (series.resourceURI) {
                var selectedService = Settings.getSelectedServicePrefix();
                if (selectedService == 'marvel') {
                    Marvel.getSeriesDataForResourceURI(series.resourceURI).then(function(comicData) {
                        if (comicData !== "Too Many Requests") {
                            if ($scope.seriesData.indexOf(comicData) == -1) {
                                if (!comicData.description) {
                                    comicData.description = "No description available.";
                                }
                                $scope.seriesData.push(comicData);
                                $scope.getLatestComicCoverForSeries(comicData, $scope.seriesData.indexOf(comicData));
                            }
                        } else {
                            $scope.isLoading = false;
                            $scope.hasComics = false;
                            $scope.resultsMessage = "Reached API Limit";
                        }
                    });
                } else if (selectedService == 'comic-vine') {
                    ComicVine.getVolumeDataForId(series.id).then(function(data) {
                        if ($scope.seriesData.indexOf(data) == -1) {
                            $scope.seriesData.push(data);
                            var index = $scope.seriesData.indexOf(data);
                            if ($scope.seriesData[index]) {
                                var imageUrl = "";
                                var coverQuality = Settings.getCoverQuality();
                                if (coverQuality === "medium") {
                                    imageUrl = data.image.medium_url;
                                } else if (coverQuality === "small") {
                                    imageUrl = data.image.small_url;
                                } else if (coverQuality === "large") {
                                    imageUrl = data.image.super_url;
                                }
                                $scope.seriesData[index].latestComicCoverPath = imageUrl.substr(0, imageUrl.lastIndexOf('.'));
                                $scope.seriesData[index].latestComicCoverExtension = imageUrl.substr(imageUrl.lastIndexOf('.') + 1);
                            }
                        }
                    });
                }
            }
        };

        $scope.getComicForSeries = function(comic, index) {
            if (comic.resourceURI) {
                Marvel.getComicDataForResourceURI(comic.resourceURI).then(function(comicData) {
                    if ($scope.seriesData[index]) {
                        $scope.seriesData[index].latestComicCoverPath = comicData.thumbnail.path;
                        $scope.seriesData[index].latestComicCoverExtension = comicData.thumbnail.extension;
                    }
                });
            }
        };

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

        $scope.isInPullList = function(series) {
            return PullListUtils.isInPullList(series.resourceURI, $scope.pullList);
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

        $scope.isEnded = function(series) {
            if (series.endYear == 2099) {
                return false;
            }
            return true;
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
