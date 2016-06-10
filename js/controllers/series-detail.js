myApp.controller('SeriesDetailController', ['$scope', '$sce', '$filter', 'Settings', 'FirebaseUtils', 'PullListUtils', '$modalInstance', 'series', 'pullList',
    function($scope, $sce, $filter, Settings, FirebaseUtils, PullListUtils, $modalInstance, series, pullList) {
        $scope.series = series;
        $scope.pullList = pullList;
        var selectedService = Settings.getSelectedServicePrefix();
        $scope.sourceIsMarvel = false;

        var replaceAll = function(string, search, replacement) {
            return string.split(search).join(replacement);
        };

        var replaceFirstTag = function(input) {
            if (input.indexOf(">") !== -1) {
                return (input !== undefined) ? input.slice(input.indexOf(">") + 1, input.length) : '';
            } else {
                return input;
            }
        };

        if (selectedService == 'marvel') {
            $scope.sourceIsMarvel = true;
            var pencillers = [];
            var writers = [];
            for (var i = 0; i < series.creators.items.length; i++) {
                var creator = series.creators.items[i];
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
            $scope.description = "<p></p>";
            $scope.marvelDescription = series.description;
        } else {
            var filteredDescription = series.description;
            filteredDescription = $filter('limitFromToChar')(filteredDescription, 0, "<h4>Collected");
            filteredDescription = $filter('limitFromToChar')(filteredDescription, 0, "<h4>Trade Paperback");
            filteredDescription = $filter('limitFromToChar')(filteredDescription, 0, "<h2>Publication History");
            filteredDescription = $filter('limitFromToChar')(filteredDescription, 0, "<h2>Plot Summary");
            filteredDescription = $filter('limitFromToChar')(filteredDescription, 0, "<h4>Publishers");
            filteredDescription = $filter('limitFromToChar')(filteredDescription, 0, "Main Feature:");

            filteredDescription = replaceFirstTag(filteredDescription);
            filteredDescription = replaceAll(filteredDescription, "href=\"/", "href=\"http://comicvine.gamespot.com/");
            filteredDescription = replaceAll(filteredDescription, "<a ", "<a target=\"_blank\" ");
            filteredDescription = replaceAll(filteredDescription, "</p>", "");
            filteredDescription = replaceAll(filteredDescription, "<p>", " ");
            filteredDescription = replaceAll(filteredDescription, "<em>", "");
            filteredDescription = replaceAll(filteredDescription, "</em>", "");
            filteredDescription = replaceAll(filteredDescription, "<b>", "");
            filteredDescription = replaceAll(filteredDescription, "</b>", "");
            filteredDescription = replaceAll(filteredDescription, "<strong>", "");
            filteredDescription = replaceAll(filteredDescription, "</strong>", "");
            $scope.description = $sce.trustAsHtml(filteredDescription);
        }

        $scope.addComic = function() {
            FirebaseUtils.addToPullList($scope.series.title, $scope.series.resourceURI);
        };

        $scope.removeFromPullList = function() {
            if ($scope.pullList) {
                for (var i = 0; i < $scope.pullList.length; i++) {
                    var sub = $scope.pullList[i];
                    if (sub.name === $scope.series.title) {
                        FirebaseUtils.removeFromPullList(sub);
                        break;
                    }
                }
            }
        };

        $scope.isInPullList = function() {
            return PullListUtils.isInPullList($scope.series.resourceURI, $scope.pullList);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    }
]);
