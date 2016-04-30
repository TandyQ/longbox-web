myApp.controller('ThisWeekController', ['$scope', '$modal', 'Marvel', 'DateUtils', "PullList", "PullListUtils", "FirebaseUtils",
    function($scope, $modal, Marvel, DateUtils, PullList, PullListUtils, FirebaseUtils) {
        var wedDate = DateUtils.getWednesdayDate(new Date());
        $scope.isLoading = false;

        PullList.getPullList();

        $scope.$watch('weekToShow', function(newValue, oldValue) {
            $scope.isLoading = true;
            var dateRange = DateUtils.getDateRange(new Date(newValue)); // Get first and last day of week
            Marvel.getComicDataForWeek(dateRange).then(function(data) {
                $scope.comicData = data;
                $scope.isLoading = false;
            });
        });

        $scope.openModalForComic = function(selectedComic) {
            var modalInstance = $modal.open({
                templateUrl: 'views/comic-detail-view.html',
                controller: 'ComicDetailController',
                resolve: {
                    comic: function() {
                        return selectedComic;
                    },
                    pullList: function() {
                        return $scope.pullList;
                    }
                }
            });
        };

        $scope.isInPullList = function(comic) {
            return PullListUtils.isInPullList(comic.series.resourceURI, $scope.pullList);
        };

        $scope.removeFromPullList = function(comic) {
            if ($scope.pullList) {
                for (var i = 0; i < $scope.pullList.length; i++) {
                    var sub = $scope.pullList[i];
                    if (sub.name === comic.series.name) {
                        FirebaseUtils.removeFromPullList(sub);
                        break;
                    }
                }
            }
        };
    }
]);
