myApp.factory('DateUtils', ['$rootScope', function($rootScope) {

    var monthNames = [
        "January", "February", "March",
        "April", "May", "June",
        "July", "August", "September",
        "October", "November", "December"
    ];

    var myObject = {
        getWednesdayDate: function(inputDate) {
            var sunday = inputDate.getDate() - inputDate.getDay(); // First day is the day of the month - the day of the week
            var wednesday = sunday + 3; // last day is the first day + 6
            var weekDate = new Date(inputDate.setDate(wednesday));
            return weekDate;
        },
        getMonthName: function(inputDate) {
            return monthNames[inputDate.getMonth()];
        },
        getShortMonthName: function(inputDate) {
            return myObject.getMonthName(inputDate).subsrt(0, 3);
        },
        getDateRange: function(inputDate) {
            var first = inputDate.getDate() - inputDate.getDay(); // First day is the day of the month - the day of the week
            var firstDate = new Date(inputDate.setDate(first));
            var lastDate = new Date(inputDate.setDate(firstDate.getDate()+6));
            return {
                firstDate: firstDate,
                lastDate: lastDate
            };
        }
    };

    return myObject;
}]);
