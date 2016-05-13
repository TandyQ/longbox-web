myApp.controller('ComicDetailController', ['$scope', 'FirebaseUtils', 'PullListUtils', '$modalInstance', 'comic', 'pullList',
    function($scope, FirebaseUtils, PullListUtils, $modalInstance, comic, pullList) {
        $scope.comic = comic;
        $scope.pullList = pullList;

        var pencillers = [];
        var writers = [];
        for (var i = 0; i < comic.creators.items.length; i++) {
            var creator = comic.creators.items[i];
            if (((creator.role.toLowerCase().indexOf("penciller") > -1) ||
                    (creator.role.toLowerCase().indexOf("penciler") > -1) ||
                    (creator.role.toLowerCase().indexOf("artist") > -1)) &&
                $.inArray(creator.name, pencillers) < 0) {
                pencillers.push(creator.name);
            } else if ((creator.role.toLowerCase().indexOf("writer") > -1) &&
                ($.inArray(creator.name, pencillers) < 0)) {
                writers.push(creator.name);
            }
        }
        $scope.creators = {
            pencillers: pencillers,
            writers: writers
        };

        $scope.addComic = function() {
            FirebaseUtils.addToPullList($scope.comic.series.name, $scope.comic.series.resourceURI);
        };

        $scope.removeFromPullList = function() {
            if ($scope.pullList) {
                for (var i = 0; i < $scope.pullList.length; i++) {
                    var sub = $scope.pullList[i];
                    if (sub.name === $scope.comic.series.name) {
                        FirebaseUtils.removeFromPullList(sub);
                        break;
                    }
                }
            }
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.isInPullList = function() {
            return PullListUtils.isInPullList($scope.comic.series.resourceURI, $scope.pullList);
        };
    }
]);
