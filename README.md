# KiteBrowser

## TL:DR

KiteBrowser is a browser built using ```electronjs``` as a compiler. The app works by being run on HTML, CSS and JS compiled into a macOS app (for now) using ```electronjs```. Using the webviewer and Chromium content that electronjs uses you can create more webviews, creating the ability to request HTML content from webpages and put it inside a webview.

## Installation

When you install the ```.zip``` from the Github release you have to unzip the folder, then open a Terminal at the location of the folder and run this command: ```open "kitebrowser.app"```.

## Tech-Stack

KiteBrowser was coded using HTML, CSS and JS and compiled using ```electronjs``` into a macOS app (available in the Github Release). The main js file (aptly named ```main.js```) communicates with ```script.js``` which is the file connected to the main ```index.html``` through a middle-man js file called ```preload.js``` which uses ```ipc``` to communicate between them. This processs is used to enable features like backwards and forwards. JSON is also used to store history and bookmarks. (a current work in progress). 

The app icon was made using the XCode icon composer tool to turn the .png into a .icns file. A more refined liquid glass version will be published soon.

## Future Plans

KiteBrowser is aimed at being a kids browser, with a dedicated ad blocker to prevent malicious scammers and shady websites asking you for data in place of rewards (most commonly Robux or in-game currency for kids). I also plan to integrate weekly parent reports and time-limits for sites like TikTok and ChatGPT. 

## Things to Work On

For tab functionality, I have to make tabs update so that when I open a link in the browser it saves that new webpage to that tab. I also want to add history, bookmarks and tab shortcuts.
