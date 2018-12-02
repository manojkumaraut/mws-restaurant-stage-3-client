
# Restaurant Reviews App - Stage 1 - Modified version

- Download the repository
- Use npm install command
- run the command - "http-server"


**Screenshot 1**
![alt text](https://github.com/manojkumaraut/mws-restaurant-stage-1/blob/master/screenshots/screenshot_2.jpg)

**Screenshot 2**
![alt text](https://github.com/manojkumaraut/mws-restaurant-stage-1/blob/master/screenshots/screenshot_16.PNG)

**Screenshot 3**
![alt text](https://github.com/manojkumaraut/mws-restaurant-stage-1/blob/master/screenshots/screenshot_11.jpg)

**Screenshot 4**
![alt text](https://github.com/manojkumaraut/mws-restaurant-stage-1/blob/master/screenshots/screenshot_14.jpg)


1.**Setting up of Local Server:**
- Fork and clone the starter repository.
- Use npm install to add http-server 

2.**Implementation of meta tags and viewport:**
 - Modification of CSS Styles according to the standards :
  - Added display: grid and display: flexbox for content centering Header nav and Restaurant list

3.**Implementation of Responsive Design**
 - Using of Media Queries
 - rendering of Images based on device displays

4.**Implementation of  Responsive  Images**

- Generaterated multi-resolution images for srcset with Grunt by creating gruntfile.js.
- Install the Following Package
    "grunt": "^1.0.2",
    "grunt-contrib-clean": "^1.1.0",
    "grunt-responsive-images": "^1.10.1"
 -  Created Gruntfile.js and specify the sizes with width and quality
 - Run npm install.
- Run grunt.
 - Eg: 
  "srcset_index": "img/1-300.jpg 1x, img/1-600_2x.jpg 2x",
  "srcset_restaurant": "img/1-300.jpg 300w, img/1-400.jpg 400w,

5.**Dev Tools Audit - Accessibility testing and implementation (a11y):**
   
   - Contrast between colors
   - use of alt and title tags for images
   - Better usability
     Updated the  cursor to a pointer when it hovered over a button and also  a hover color.
   - Addition of accessablity labels

6.**Implementation of service worker and Cache assets**
  - cache assets on install
  - serve cached assets
  - offline image
  
7.**Other Changes:**
- Changing of Theme color with background image
- Added font awesome icons 
- Increase touch targets 
- Used ARIA roles, Landmarks, region, aria labels
 
# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### Specification

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality. 

### What do I do from here?

1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer. 

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

2. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.
3. Explore the provided code, and start making a plan to implement the required features in three areas: responsive design, accessibility and offline use.
4. Write code to implement the updates to get this site on its way to being a mobile-ready website.

## Leaflet.js and Mapbox:

This repository uses [leafletjs](https://leafletjs.com/) with [Mapbox](https://www.mapbox.com/). You need to replace `<your MAPBOX API KEY HERE>` with a token from [Mapbox](https://www.mapbox.com/). Mapbox is free to use, and does not require any payment information. 

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write. 



