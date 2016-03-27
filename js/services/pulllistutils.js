myApp.factory('PullListUtils', ['$rootScope', function($rootScope) {

    var myObject = {
        isInPullList: function(seriesTitle, subscriptions) {
            isInList = false;
            for (var i = 0; i < subscriptions.length; i++) {
                var sub = subscriptions[i];
                if (sub.name === seriesTitle) {
                    isInList = true;
                    break;
                }
            }
            return isInList;
        }
    };

    return myObject;
}]);
