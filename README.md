# Longbox

![Longbox Title Image](http://tandyq.me/do-not-move/title-image.png)

Longbox is a web application for tracking weekly comic book releases. It's not a tool for tracking what's in your collection, nor is it a comic book reader or a comic book marketplace. Using data from Marvel and Comic Vine, it shows which issues are hitting store shelves in a given week. By loading up Longbox and maintaining a list of the series you care about, you can easily filter this long list of weekly releases down to just the ones you want to read.

## Getting Started

![Longbox Title Image](http://tandyq.me/do-not-move/longbox-screenshot.jpg)
These instructions will help you get a copy of Longbox up and running on your web server.

### Prerequisities

What you'll need to get Longbox up and running:

```
A text editor
A web domain and hosting package
A Firebase account (free)
Accounts with Marvel and Comic Vine with API keys (free)
```

### Installing

1. Start from this page by downloading the project or cloning it to your desktop through the GitHub application.
2. Once downloaded, open the project and navigate to the js folder. Open app.js in your text editor of choice.
3. On the first line of the file you should see the following code. This is where you'll insert your Firebase URL.
```
var myApp = angular.module('myApp', ['ngRoute', 'ngCookies', 'LocalStorageModule', 'firebase', 'mm.foundation', 'hmTouchEvents', 'angular.datepicker'])
    .constant('FIREBASE_URL', '<YOUR FIREBASE URL HERE>');
```
4. To get this URL, open a web browser and go to [Firebase](https://firebase.google.com/), logging in using your Google Account.
5. Once logged in, click "Create New Project" and give it a name.
6. Next, a dashboard interface for your Firebase project will load. Navigate to the Auth section and go to the Sign In Method tab.
7. Enable email/password login and click save.
8. We'll deal more with this dashboard later in the security section. For now, go back to [https://console.firebase.google.com/](https://console.firebase.google.com/).
9. You should see the project you created listed here, along with a URL. Something along the lines of [YOUR PROJECT NAME].firebaseio.com.
10. Copy this URL and use it to replace <YOUR FIREBASE URL HERE> in the line of code from step three. Be sure to keep the single quotes around the URL.
11. Next, you'll need to add your  API keys for Marvel and Comic Vine.
12. Open the project folder again and navigate to the config folder.
13. Rename config_template.json to config.json. Then open the file in a text editor.
14. Your config file should look like this:
```
{
  "MARVEL_API_KEY": "YOUR MARVEL API KEY HERE",
  "COMIC_VINE_API_KEY": "YOUR COMIC VINE API KEY HERE"
}
```
15. Open accounts with [Marvel](http://developer.marvel.com/) and [Comic Vine](http://comicvine.gamespot.com/api/). Go through this process until you have API keys for both services.
16. Replace YOUR MARVEL API KEY HERE and YOUR COMIC VINE API KEY HERE with the API keys you retrieved from each service. Be sure to keep the double quotes around the keys.
17. At this point, your Longbox should be set up and ready to go! The application won't run locally on your computer, so upload it to whatever web host you keep your domain with and navigate to that URL. Create an account for yourself and enjoy. See the next section if you're worried about making sure your Longbox is secure from outside tampering.

## Making Longbox Secure

Due to the nature of Firebase, anyone who has your Firebase URL can make edits to your database, so it's a good idea to set up some security around it. Make sure you're doing this after you've already finished setting up Longbox and made yourself an account, otherwise you won't be able to create a log in for your own application. To get started:
1. Open your Firebase dashboard at [https://console.firebase.google.com/](https://console.firebase.google.com/).
2. Open the Firebase project you're using for Longbox.
3. Navigate to the Database section and go to the rules tab. You should see a few lines of code that look like this:
```
{
    "rules": {
        ".read": true,
        ".write": true
    }
}
```
4. These lines mean that anyone can access your Firebase at any time. So we're going to replace them with some lines that are a little more restrictive. Replace all of the lines on this page with the following:
```
{
   "rules": {
       // only authenticated users can read or write to my Firebase
        ".read": "auth !== null",
        ".write": "auth !== null"
   }
}
```
5. Your Longbox is secure! Go forth and track comic releases with your mind at ease.

## Built With

* Model: [Firebase](https://firebase.google.com/)
* Controller: [AngularJS](https://angularjs.org/)
* View: [Angular Foundation](https://pineconellc.github.io/angular-foundation/)
* IDE: [Sublime Text](https://www.sublimetext.com/)
* Interface Icons: [Font Awesome](http://fontawesome.io/)

## Authors

* **Tyler Anderson** - *Developer and Designer* - [TandyQ.me](https://tandyq.me)

## License

Longbox is distributed under the [MIT License](http://opensource.org/licenses/MIT).

## Acknowledgments

* In addition to the tools listed above, additional thanks to these open source projects: [Pikaday](https://github.com/dbushell/Pikaday), [Moment.js](http://momentjs.com/), [Angular Local Storage](https://github.com/grevory/angular-local-storage), and [Angular Hammer](https://github.com/RyanMullins/angular-hammer).
* Registration photo is a royalty-free image from [StockSnap](https://stocksnap.io/photo/FFNGYLQM7X).