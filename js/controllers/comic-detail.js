myApp.controller('ComicDetailController', ['$scope', 'FirebaseUtils', 'PullListUtils',  '$modalInstance', 'comic', 'pullList',
    function($scope, FirebaseUtils, PullListUtils, $modalInstance, comic, pullList) {
        $scope.comic = comic;
        $scope.pullList = pullList;

        var pencillers = [];
        var writers = [];
        for (var i = 0; i < comic.creators.items.length; i++) {
            var creator = comic.creators.items[i];
            if (creator.role.toLowerCase().indexOf("penciller") !== -1) {
                pencillers.push(creator.name);
            } else if (creator.role.toLowerCase().indexOf("writer") !== -1) {
                writers.push(creator.name);
            }
        }
        $scope.creators = {
            pencillers:pencillers,
            writers:writers
        };

        $scope.addComic = function(series) {
            FirebaseUtils.addToPullList(series);
        };

        $scope.removeFromPullList = function(series) {
            if ($scope.pullList) {
                for (var i = 0; i < $scope.pullList.length; i++) {
                    var sub = $scope.pullList[i];
                    if (sub.name === series.name) {
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


// angular.module('foundationDemoApp').controller('ModalInstanceCtrl', function($scope, $modalInstance, items) {

//     $scope.items = items;
//     $scope.selected = {
//         item: $scope.items[0]
//     };

//     $scope.reposition = function() {
//         $modalInstance.reposition();
//     };

//     $scope.ok = function() {
//         $modalInstance.close($scope.selected.item);
//     };


// });
