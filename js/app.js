/* global $,console,document,Handlebars */

//default not avail image
var IMAGE_NOT_AVAIL = "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available";

//my key
var comicSubs = new Firebase('https://longbox.firebaseio.com/marvel');

// Marvel Data
var marvelComics = [];

// Raw Subscription Data
var comicList = [];

// Init

$(document).ready(function () {
    
    var $results = $("#results");
    var $status = $("#status");

    var templateSource = $("#reportTemplate").html();
    var template = Handlebars.compile(templateSource);

    var promises = [];

    $status.html("<i>Getting comic book data - this will be slow - stand by...</i>");
    
    // Change your config_template.json to config.json and add your Marvel API key
    // You can procure your Marvel API key at http://developer.marvel.com
    $.getJSON('config/config.json')
    .done( function(data){  
        promises.push(getComicData(data));

    $.when.apply($, promises).done(function () {

        var args = Array.prototype.slice.call(arguments, 0);
        console.log(args);

        $status.html("");

        var weekDate = getWednesdayDate();
        
        var marvelData = {};
        marvelData.year = "All New Comics - Week of " + (weekDate.getMonthName()) + " " + weekDate.getUTCDate() + ", " + weekDate.getFullYear();
        marvelData.priceTotal = 0;
        marvelData.priceCount = 0;
        marvelData.minPrice = 999999999;
        marvelData.maxPrice = -999999999;
        marvelData.pageTotal = 0;
        marvelData.pageCount = 0;
        marvelData.pics = [];
        marvelData.addLinks = [];
        var res = args[0];
        console.log(res);

        if (res.code === 200) {
            for (var i = 0; i < res.data.results.length; i++) {
                var comic = res.data.results[i];
                //just get the first item
                if (comic.prices.length && comic.prices[0].price !== 0) {
                    marvelData.priceTotal += comic.prices[0].price;
                    if (comic.prices[0].price > marvelData.maxPrice) marvelData.maxPrice = comic.prices[0].price;
                    if (comic.prices[0].price < marvelData.minPrice) marvelData.minPrice = comic.prices[0].price;
                    marvelData.priceCount++;
                }
                if (comic.pageCount > 0) {
                    marvelData.pageTotal += comic.pageCount;
                    marvelData.pageCount++;
                }
                
                if (comic.variantDescription == "") {
                    marvelComics.push(comic);
                }
            }
            
            marvelComics.sort(compareSeries);
            
            for (var i = 0; i < marvelComics.length; i++) {
                var comic = marvelComics[i];
                
                if (comic.thumbnail && comic.thumbnail.path != IMAGE_NOT_AVAIL) {
                    marvelData.pics.push(comic.thumbnail.path + "." + comic.thumbnail.extension);
                } 
                
                if (comic.series && comic.series.name != '') {
                    marvelData.addLinks.push('javascript:saveToFB(\'' + comic.series.name + '\')');
                }
            }
            
            marvelData.avgPrice = (marvelData.priceTotal / marvelData.priceCount).toFixed(2);
            marvelData.avgPageCount = (marvelData.pageTotal / marvelData.pageCount).toFixed(2);

            //grab comic thumbnails
            marvelData.thumbs = [];
            for (var i = 0; i < marvelData.pics.length; i++) {
                marvelData.thumbs.push(marvelData.pics[i]);
            }
            
            marvelData.marvelComics = [];
            for(var i = 0; i < marvelData.thumbs.length; ++i) {
                marvelData.marvelComics.push({thumb: marvelData.thumbs[i],
                                            addLink: marvelData.addLinks[i]});
            }
            
            //create first issue display objects
            marvelData.firstIssues = [];
                
            for(var i = 0; i < marvelData.marvelComics.length; i++) {
                var comic = marvelComics[i];
                if (comic.issueNumber <= 1) {
                    marvelData.firstIssues.push({thumb: marvelData.thumbs[i],
                                               addLink: marvelData.addLinks[i]});
                }
            }

            console.dir(marvelData);
            var html = template(marvelData);
            $results.append(html);
        }
    });
        
    });
});

// Firebase API

function saveToFB(comicName) {
    var contains = false;
    for(var i = 0; i < comicList.length; i++) {
        if (comicList[i].name == comicName) {
            contains = true;
            break;
        }
    }
    if (!contains) {
        comicSubs.push({name: comicName});
    }
}

function del(key, comicName) {
    var response = confirm("Are you certain about removing \"" + comicName + "\" from the list?");
    if (response == true) {
        // build the Firebase endpoint to the item in the movies collection
        var deleteMovieRef = buildEndPoint(key);
        deleteMovieRef.remove();
    }
}

// this will get fired on inital load as well as when ever there is a change in the data
comicSubs.on("value", function(snapshot) {
    var data = snapshot.val();
    comicList = [];
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            name = data[key].name ? data[key].name : '';
            if (name.trim().length > 0) {
                comicList.push({
                    name: name,
                    key: key
                })
            }
        }
    }

    refreshUI();
});

function refreshUI() {
    var lis = '';
    for (var i = 0; i < comicList.length; i++) {
        lis += '<li data-key="' + comicList[i].key + '">' + comicList[i].name + ' [' + genSubManagementLink(comicList[i].key, comicList[i].name) + ']</li>';
    };
    document.getElementById('allSubscriptions').innerHTML = lis;
    
    var $subscriptions = $("#subscriptions");
    var templateSource = $("#subscriptionTemplate").html();
    var template = Handlebars.compile(templateSource);
    
    var subscriptionData = {};
    var comicSubscriptions = [];
    
    var weekDate = getWednesdayDate();
    subscriptionData.year = "Pull List - Week of " + (weekDate.getMonthName()) + " " + weekDate.getUTCDate() + ", " + weekDate.getFullYear();
    
    subscriptionData.removeLinks = [];
    subscriptionData.thumbs = [];
    
    comicList.sort(compareSubscriptions);
    marvelComics.sort(compareSeries);
    
    for (var i = 0; i < marvelComics.length; i++) {
        var comic = marvelComics[i];
        
        for(var j = 0; j < comicList.length; j++) {
                
            if (comicList[j].name == comic.series.name) {
                comicSubscriptions.push(comic);
                
                if (comic.thumbnail && comic.thumbnail.path != IMAGE_NOT_AVAIL) {
                    subscriptionData.thumbs.push(comic.thumbnail.path + "." + comic.thumbnail.extension);
                }
                
                break;
            }
        }
    }
    
    subscriptionData.subscriptions = [];
    for(var i = 0; i < subscriptionData.thumbs.length; ++i) {
        subscriptionData.subscriptions.push({thumb: subscriptionData.thumbs[i],
                                           removeLink: subscriptionData.removeLinks[i]});
    }
    
    console.dir(subscriptionData);
    var html = template(subscriptionData);
    $subscriptions.replaceWith(html);
}

// Firebase Utility

function buildEndPoint (key) {
    return new Firebase('https://longbox.firebaseio.com/marvel/' + key);
}

function genSubManagementLink(key, mvName) {
    var link = '';
    link += '<a href="javascript:del(\'' + key + '\',\'' + mvName + '\')">Delete</a>';
    return link;
};

// Marvel API

function getComicData(data) {
    var curr = new Date; // get current date
    var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6
    var firstDate = new Date(curr.setDate(first));
    var lastDate = new Date(curr.setDate(last));
    console.log("First: " + firstDate + "  " + "Last: " + lastDate);

    // var testURL = "http://gateway.marvel.com/v1/public/comics?limit=100&format=comic&formatType=comic&dateRange=2016-03-03%2C2016-03-09&apikey=" + KEY;
    var url = "http://gateway.marvel.com/v1/public/comics?limit=100&format=comic&formatType=comic&dateRange=" + firstDate.getFullYear() + "-" + (firstDate.getUTCMonth() + 1) + "-" + firstDate.getUTCDate() + "%2C" + lastDate.getFullYear() + "-" + (lastDate.getUTCMonth() + 1) + "-" + lastDate.getUTCDate() + "&apikey=" + data.API_KEY;
        
    console.log(url);
    return $.get(url); 
}

function getWednesdayDate() {
    var curr = new Date; // get current date
    var sunday = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    var wednesday = sunday + 3; // last day is the first day + 6
    var weekDate = new Date(curr.setDate(wednesday));
    return weekDate;
}

// General Utility

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

Date.prototype.monthNames = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
    ];

Date.prototype.getMonthName = function() {
    return this.monthNames[this.getMonth()];
};

Date.prototype.getShortMonthName = function () {
    return this.getMonthName().substr(0, 3);
};

function compareSeries(a,b) {
  if (a.series.name < b.series.name) {
      return -1;
  }
    
  else if (a.series.name > b.series.name) {
      return 1;
  }
    
  else {
      return 0;
  }
}

function compareSubscriptions(a,b) {
    if (a.name < b.name) {
      return -1;
  }
    
  else if (a.name > b.name) {
      return 1;
  }
    
  else {
      return 0;
  }
}