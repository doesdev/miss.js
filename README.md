![alt text](http://musocrat.github.io/miss.js/img/miss.js-logo-100.png "Miss.js Logo") Miss.js [![Build Status](https://travis-ci.org/musocrat/miss.js.png)](https://travis-ci.org/musocrat/miss.js)
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
  - [Styling](#styling)
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

1. Get the js file [`dist/miss.min.js`](https://raw.githubusercontent.com/musocrat/miss.js/master/dist/miss.min.js) 
2. Include at the bottom of the body `<script src="miss.min.js"></script>`. 
3. Initialize with options (basic initialization shown, see below for advanced usage)

```html
<script>
    miss({elements: {welcome: {title: 'Welcome', msg: 'Some welcome message'}, ".miss": null}});
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
1. Make design decisions   
    - do you want to configure each element individually or initialize on a class and setup options in data-attributes? 
    - do you want to set title and message content in initialization object or in data-attributes?   
    - do you want users to have the option to show popover when they hover over element? `key_modifier`   
    - do you want the walkthrough to start on load or only when they click a link? `show_on_load`, `trigger_el`   
    - do you want to style popovers yourself (highly recommended) or use the default theme (meh)? `theme`
2. Include miss.js at the bottom of the body `<script src="miss.min.js"></script>`.   
3. Initialize it on the desired elements with options   
```html
<script>
    miss({
        settings: {
            key_modifier: 'alt',
            show_on_load: true,
            theme: 'custom'
        },
        elements: {
            welcome: {
                title: "Welcome to Our Awesome App",
                msg: "We're gonna show you around."
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
                msg: "Thanks for sticking around for the tour."
            }
        }
    });
</script>
```

### Configuration
One of the most important configuration decisions you will make is how you want to initialize elements. 
You have two basic options.   

1. Setup each element individually in the initialization object, like so:   
```javascript
miss({
    elements: {
        "#elA": {
            order: 1,
            title: "Title A",
            msg: "Message content for A."
        }, 
        "#elB": {
            order: 2,
            title: "Title B",
            msg: "Message content for B."
        }
    }
});
```
2. Initialize on a class and set title, message, and order in data attributes:

```html
<div class="tour" data-miss-order="1" data-miss-title="Title A" data-miss-msg="Message content for A."></div>
<div class="tour" data-miss-order="2" data-miss-title="Title B" data-miss-msg="Message content for B."></div>
```
```javascript
miss({elements: {".tour": null});
```

Because large content, nested elements, and formatting are not recommended within initialization or data-attributes 
we provide the option to reference another *(hidden)* element within the msg value. To do so you need to wrap the 
element with Ruby-esque string interpolation `"#{'#hidden-element'}"`

```html
<div class="tour" data-miss-order="1" data-miss-title="Title A" data-miss-msg="#{'#tour_msg_a'}"></div>
<div id="tour_msg_a" style="display:none;">
    <p>This is a div containing some text as well as a list. You can stick just about anything in here.
    <ul>
        <li>Point 1</li>
        <li>Point 2</li>
        <li>Point 3</li>
    </ul>
<div>
```

Most options can be set on a global or per element basis, the only exception being those marked global-only. 
In the below examples both are doing the same thing, just a different way.

```javascript
miss({
    settings: {
        backdrop_color: '#fff',
        backdrop_opacity: 0.3
    },
    elements: {
        ".tour": null
    }
});
```

```javascript
miss({
    elements: {
        ".tour": {
             backdrop_color: '#fff',
             backdrop_opacity: 0.3
         }
    }
});
```

### API Options
Below is a list of all available options. All can be set either withing the settings object or in the element object 
except for those listed as `global-only` which can only be set within settings.

- **theme** `(default=null, accepts=[null, 'custom'])`   
    Theme for walkthrough popovers. Set to `'custom'` to use your own styling.
- **app_location** `(default=null, accepts=[null, string])`   
    This option allows you to initialize on different sections / pages of your app independently. Without this set 
    when one section is completed the tour will not show again on any other pages.
- **check_url** `(default=null, accepts=[valid url])` `global-only`   
    URL for miss to check whether walkthrough should automatically show for user. 
    Should return true/false value for `check_keyname` key and must be in json format.
    Typically this will be a user preferences endpoint on your app.
- **check_method** `(default='GET', accepts=['GET','POST'])` `global-only`   
    HTTP method to be used in `check_url`.
- **check_keyname** `(default=null, accepts=[any valid keyname you choose])` `global-only`   
    Key name to be checked in `check_url`. This key/value pair can be deeply nested.
- **show_on_load** `(default=true, accepts=[true, false])` `global-only`   
    Should walkthrough show on page load. *Note: it won't again locally show after a user has completed it*
- **always_show** `(default=null, accepts=[true, false])` `global-only`   
    If set true walkthrough will always show on load regardless of a user having been through it.
- **trigger_el** `(default=null, accepts=[any valid element selector in string format])` `global-only`   
    Selector of element that will show the tour when clicked, such as a help link.
- **key_modifier** `(default=null, accepts=['alt', 'ctrl', 'shift', 'cmd'])` `global-only`   
    Key to be used as modifier when walkthrough is not visible. When depressed by user 
    the popoover will show when the target element is hovered over.
- **key_on** `(default=null, accepts=[numeric key code])` `global-only`   
    Key used to turn walkthrough on. Must be the numeric key code found in parenthesis within the value column 
    [here](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode#Constants_for_keyCode_value). 
- **key_off** `(default=null, accepts=[numeric key code])` `global-only`   
    Key used to turn walkthrough off. Must be the numeric key code found in parenthesis within the value column 
    [here](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode#Constants_for_keyCode_value). 
- **backdrop** `(default=true, accepts=[true, false])` `global-only`   
    Should backdrop show.
- **backdrop_color** `(default='#000', accepts=[hex color code])` `global-only`   
    Backdrop color.
- **backdrop_opacity** `(default=0.5, accepts=[integer less than or equal to 1])` `global-only`   
    Backdrop opacity.
- **box_width** `(default=null, accepts=[CSS compliant value (i.e. '40%', '200px')])`   
    Width of popover box. 
- **box_height** `(default=null, accepts=[CSS compliant value (i.e. '40%', '200px')])`   
    Height of popover box.
- **z_index** `(default=2100, accepts=[integer])` `global-only`   
    z-index of tour elements (starting with backdrop)
- **highlight** `(default=true, accepts=[true, false])`   
    Highlight the target element with border and exclusion from backdrop.
- **highlight_width** `(default=3, accepts=[integer])`   
    Pixel width of highlight border.
- **highlight_color** `(default='#fff', accepts=[hex color code])`   
    Color of highlight border.
- **btn_prev_text** `(default='&#8592 prev', accepts=[string])`   
    Text to display in 'previous' button.
- **btn_next_text** `(default='next &#8594', accepts=[string])`   
    Text to display in 'next' button.
- **btn_done_text** `(default='done', accepts=[string])`   
    Text to display in 'done' button.
- **order** `(default='series', accepts=['series', integer])`   
    Order that element should go in. Series orders them according to their initialization and dom appearance order.
- **background_color** `(default='#f5f5f5', accepts=[hex color code])`   
    Color of popover background.
- **titlebar_color** `(default='#939393', accepts=[hex color code])`   
    Color of title bar background.
- **font_color** `(default='#000', accepts=[hex color code])`   
    Color of popover text.
- **title** `(default=null, accepts=[string])`   
    Title to display in popover.
- **msg** `(default=null, accepts=[string, string interpolated element selector])`   
    Content to display in popover.
- **show_on_hover** `(default=true, accepts=[true, false])`   
    Sets whether element should show popover on hover with `key_modifier` set.
      
Styling
----
Miss.js does not make design decisions for you. We do provide a minimal baseline styling if you 
do not set the theme option, but we highly recommend that you style the walkthrough to match your app. 
 
We have taken a couple of steps to make that is easy as possible. First we gave everything class names 
which are listed below. Second we added the necessary classes to be compatible with bootstrap out of the box. 
So, if you're using bootstrap you don't have to do anything more than setting `theme: 'custom'`. 

**CSS Selectors**   
Popover Container:   
`.miss-box`   
`.popover`   

Title Bar:   
`.miss-titlebar`   
`.popover-title`   

Close Button:   
`.miss-close`   
`.close`   

Message Content Area:   
`.miss-msg`   
`.popover-content`   

Navigation Container:   
`.miss-nav`   

Navigation Button Group:   
`.miss-btn-group`   
`.btn-group`   

Navigation Button Previous:   
`.miss-prev`   
`.btn`   
`.btn-default`   

Navigation Button Next:   
`.miss-next`   
`.btn`   
`.btn-default`   

Navigation Button Done:   
`.miss-done`   
`.btn`   
`.btn-primary`   
`.pull-right`   

Page Numbers:   
`.miss-step-num`    
`.text-center`   
      
Alternatives
----
There are quite a few commercial projects out there which provide top notch app walkthrough services. 
That being said, we love open source and could not recommend a commercial product over some 
of the great projects out there.
 
There are several open source projects providing this functionality, but if we were to use anything other than Miss.js
it would be [Bootstrap Tour](http://bootstraptour.com). This project provides far more options than we ever will, 
as well as a very nice API. We highly recommend this project for anyone needing more options than what we offer 
(though we're open to suggestions).

Contributing
----
1. Fork it
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Added some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create new Pull Request


----
author: Andrew Carpenter, on behalf of the [musocrat](http://www.musocrat.com) team
