myApp.controller('ThisWeekController', ['$scope', 'Marvel', 'DateUtils', "PullList", "PullListUtils", "FirebaseUtils",
    function($scope, Marvel, DateUtils, PullList, PullListUtils, FirebaseUtils) {
        var wedDate = DateUtils.getWednesdayDate(new Date());
        $scope.message = "Week of " +
            (DateUtils.getMonthName(wedDate)) + " " + wedDate.getUTCDate() + ", " + wedDate.getFullYear();

        PullList.getPullList();

        var dateRange = DateUtils.getDateRange(new Date()); // Get first and last day of week
        Marvel.getComicDataForWeek(dateRange).then(function(data) {
            $scope.comicData = data;
        });

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
