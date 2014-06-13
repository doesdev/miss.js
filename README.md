![alt text](http://musocrat.github.io/miss/img/miss.js-logo-100.png "Miss.js Logo") Miss.js [![Build Status](https://travis-ci.org/musocrat/miss.png)](https://travis-ci.org/musocrat/miss)
======================

###Make it simple stupid.

Miss.js is a javascript plugin that empowers you to make complex apps simple for users to grasp. 
This tool helps you guide users through your app with a simple walkthrough and provide ongoing 
assistance through per element popovers. The ultimate goal is getting users engaged with your app 
and maximizing your conversion rate. 

Miss.js is dependency free and provides a simple API for easy implementation. 

### Table of Contents
- [Why](#why)    
- [How](#how)    
- [Features](#features)  
- [Demos](#demos)
- [Docs](#docs)
  - [Getting Started](#getting-started)    
  - [Configuration](#configuration)    
  - [API Options](#api-options)
- [Alternatives](#alternatives)  
- [Contributing](#contributing)        

Why?
----
Miss.js was born of necessity. It's been said that if you need to explain how to use your app then it needs
to be re-designed. As much as we appreciate the need for intuitive design, Musocrat needs explanation. 
We are fond of the experience our app delivers, but it just doesn't make immediate sense. 
After all we're doing something that's never been done. Thus, we went against this nugget of wisdom 
and decided to explain it, rather than change it.

We built Miss.js with the following requirements in mind.

- It should stand alone (no web apps, no generators, no frameworks, no libraries, no cost)
- It should provide industry standard features (steps, highlighting, navigation, etc...)
- It should provide an easy to use API that allows for per element options and theme
- It should provide intelligent positioning of popover (no more direction specification, YAY!!!)

How?
----
Miss.js is simple to use. 

1. Get the js file `dist/miss.min.js` 
2. Include at the bottom of the body `<script src="miss.min.js"></script>`. 
3. Initialize with options (intermediate initialization shown, see below for basic and advanced usage)

```html
<script>
    miss({
        settings: {
            key_modifier: 'alt',
            show_on_load: true
        },
        elements: {
            welcome: {
                title: "Welcome to Our Awesome App",
                msg: "We're gonna show you around. Stay for the full tour or exit and jump in at any time."
            },
            ".first-el": {
                order: 1,
                title: "First Stop",
                msg: "This is the first element we will explain during the tour."
            },
            ".second-el": {
                order: 2,
                title: "Second Stop",
                msg: "This is the second element we will explain during the tour."
            },
            "#third-el": {
                order: 3,
                title: "Third Stop",
                msg: "This is the third element we will explain during the tour."
            },
            exit: {
                title: "Enjoy Your Stay",
                msg: "Thanks for sticking around for the tour. We hope you enjoy doing cool things with our app."
            }
        }
    });
</script>
```

Features
----
- Step users through your app with ease
- Provide ongoing usage help with popovers shown on hover (with `key_modifier` set)
- No dependencies
- Intelligent popover auto positioning gravitates to page center
- Ability to check whether walkthrough should display for a user (with `check_url` and `check_keyname` set)

Demos
----
We have a super simple demo on our [github page](http://musocrat.github.io/miss.js/). 
Expect a more through demo in the near future.

Docs
----

### Getting Started
WIP: will be here soon
<!--
**i.**  Add script where you desire *(bottom of body is recommended)*
```html
<script src="javascripts/jquery-video-lightning.js"></script>
```
**ii.** Add vendor prefixed video id to target element *(i.e. Youtube:* `data-video-id="y-PKffm2uI4dk"`, 
*Vimeo:* `data-video-id="v-29749357"`)
```html
<span class="video-link" data-video-id="y-PKffm2uI4dk">Youtube</span>
```
**iii.**  Initialize it on the desired elements with any options you please 
*(options can also be passed as data attributes)*
```html
<script>
    $(function() {
        $(".video-link").jqueryVideoLightning({
            autoplay: 1,
            color: "white"
        });
    });
</script>
```
-->

### Configuration
WIP: will be here soon
<!--
Options can be passed in either of two ways. They can be passed in the initialization like so:
```javascript
$(function() {
    $(".video-link").jqueryVideoLightning({
        width: "1280px",
        height: "720px",
        autoplay: 1
    });
});
```
Or they can be passed as data attributes: *(Note that data attributes are all prefixed with 
`data-video` and underscored options should be dashed instead in data attributes. 
So `start_time` becomes `data-video-start-time`)*
```html
<div class="video-link" data-video-id="y-PKffm2uI4dk" data-video-width="1280px" 
data-video-height="720px" data-video-autoplay="1" ></div>
```
-->

### API Options
WIP: will be here soon
<!--
jQuery Video Lightning exposes all available basic API options for both Youtube and Vimeo. 
There are also a number of effect and behavior options that are available. The following 
is the current list of available options.

- **width** *(default="640px")*
	Y&V: video width in px
- **height** *(default="390px")*
	Y&V: video height in px
- **autoplay** *(default=0)*
	Y&V: start playback immediately (0,1)
-->

Alternatives
----
There are quite a few commercial projects out there which provide top notch app walkthrough services. 
That being said, we love open source and could not recommend a commercial product over some 
of the great projects out there.
 
There are several open source projects providing this functionality, but if we were to use anything other than Miss.js
it would be [Bootstrap Tour](http://bootstraptour.com). This project provides far more options than we ever will, 
as well as a very nice API. We highly recommend this project for anyone needing more options than what we offer 
(though we're open to suggestions) or anyone making heavy use of Bootstrap.

Contributing
----
1. Fork it
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Added some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create new Pull Request


----
author: Andrew Carpenter, on behalf of the [musocrat](http://www.musocrat.com) team
