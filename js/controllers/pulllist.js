myApp.controller('PullListController', ['$scope', 'Marvel', 'DateUtils', "PullList", "PullListUtils",
    function($scope, Marvel, DateUtils, PullList, PullListUtils) {
        var wedDate = DateUtils.getWednesdayDate(new Date());
        $scope.message = "Week of " +
            (DateUtils.getMonthName(wedDate)) + " " + wedDate.getUTCDate() + ", " + wedDate.getFullYear();

        $scope.subscriptions = PullList;
        console.log(PullList);

        var dateRange = DateUtils.getDateRange(new Date()); // Get first and last day of week
        Marvel.getComicDataForWeek(dateRange).then(function(data) {
            $scope.comicData = data;
            console.log(data);
        });

        $scope.isInPullList = function(seriesTitle) {
            return PullListUtils.isInPullList(seriesTitle, $scope.subscriptions);
        };
    }
]);
