myApp.controller('AllNewIssuesController', ['$scope', 'Marvel', 'DateUtils', 'FirebaseUtils',
    function($scope, Marvel, DateUtils, FirebaseUtils) {
        var wedDate = DateUtils.getWednesdayDate(new Date());
        $scope.message = "Week of " +
            (DateUtils.getMonthName(wedDate)) + " " + wedDate.getUTCDate() + ", " + wedDate.getFullYear();

        var dateRange = DateUtils.getDateRange(new Date()); // Get first and last day of week
        Marvel.getComicDataForWeek(dateRange).then(function(data) {
            $scope.comicData = data;
            console.log(data);
        });

        $scope.addComic = function(series) {
            FirebaseUtils.addToPullList(series);
        };
    }
]);
