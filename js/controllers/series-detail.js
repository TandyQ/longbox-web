myApp.controller('SeriesDetailController', ['$scope', 'FirebaseUtils', 'PullListUtils',  '$modalInstance', 'series', 'pullList',
    function($scope, FirebaseUtils, PullListUtils, $modalInstance, series, pullList) {
        $scope.series = series;
        $scope.pullList = pullList;

        var pencillers = [];
        var writers = [];
        for (var i = 0; i < series.creators.items.length; i++) {
            var creator = series.creators.items[i];
            if (creator.role.toLowerCase().indexOf("penciller (cover)") !== -1) {
                pencillers.push(creator.name);
            } else if (creator.role.toLowerCase().indexOf("writer") !== -1) {
                writers.push(creator.name);
            }
        }
        $scope.creators = {
            pencillers:pencillers,
            writers:writers
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

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    }
]);
