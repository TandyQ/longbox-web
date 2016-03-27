myApp.factory('PullListUtils', ['$rootScope', function($rootScope) {

    var myObject = {
        isInPullList: function(seriesTitle, pullList) {
            if (pullList) {
                isInList = false;
                for (var i = 0; i < pullList.length; i++) {
                    var sub = pullList[i];
                    if (sub.name === seriesTitle) {
                        isInList = true;
                        break;
                    }
                }
                return isInList;
            }
        }
    };

    return myObject;
}]);
