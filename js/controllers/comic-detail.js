myApp.controller('ComicDetailController', ['$scope', '$sce', '$filter', 'Settings', 'FirebaseUtils', 'PullListUtils', '$modalInstance', 'comic', 'pullList',
    function($scope, $sce, $filter, Settings, FirebaseUtils, PullListUtils, $modalInstance, comic, pullList) {
        $scope.comic = comic;
        $scope.pullList = pullList;
        var selectedService = Settings.getSelectedServicePrefix();
        $scope.sourceIsMarvel = false;

        var replaceAll = function(string, search, replacement) {
            return string.split(search).join(replacement);
        };

        if (selectedService == 'marvel') {
            sourceIsMarvel = true;
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
            $scope.description = comic.description;
        } else {
            var filteredDescription = $filter('limitFromToChar')(comic.description, 0, "<h4>List of covers");
            filteredDescription = filteredDescription.replace("<p>", "");
            filteredDescription = replaceAll(filteredDescription, "</p>", "");
            filteredDescription = replaceAll(filteredDescription, "<p>", " ");
            filteredDescription = replaceAll(filteredDescription, "<em>", "");
            filteredDescription = replaceAll(filteredDescription, "</em>", "");
            filteredDescription = replaceAll(filteredDescription, "<b>", "");
            filteredDescription = replaceAll(filteredDescription, "</b>", "");
            filteredDescription = replaceAll(filteredDescription, "<strong>", "");
            filteredDescription = replaceAll(filteredDescription, "</strong>", "");
            // $scope.description = filteredDescription;
            $scope.description = $sce.trustAsHtml(filteredDescription);
        }

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
