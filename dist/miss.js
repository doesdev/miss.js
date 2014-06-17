(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function(document) {
    var Miss, actOnCheck, backdrop, backdropCanvas, bindHover, bindTriggers, checkUrl, colorConvert, coords, extend, gravity, lonelyMissieBind, message, miss, missShouldShow, navWithKeys, normalizeJSON, pageNumbers, prepHex, resize, setTriggers, showHideEl, sortMissies, testEl,
      _this = this;
    miss = function(misset) {
      var defaults, el, i, k, msg, opts, setDefaults, title, type, v, _i, _len, _ref, _ref1;
      if (misset.settings.app_location) {
        miss.reset(misset);
      } else {
        if (!miss.global) {
          miss.settings(misset.settings || null);
        }
      }
      miss.missies = [];
      miss.site = miss.global.app_location || window.location.host || window.location.hostname;
      setDefaults = function() {
        return {
          order: 'series',
          background_color: '#f5f5f5',
          titlebar_color: '#939393',
          show_on_hover: true,
          font_color: '#000'
        };
      };
      backdrop(false);
      if (misset.elements) {
        miss.off();
        i = 0;
        _ref = misset.elements;
        for (k in _ref) {
          v = _ref[k];
          defaults = setDefaults();
          opts = extend(extend(defaults, v), miss.global);
          if ((type = k.toLowerCase()) === 'welcome' || type === 'exit') {
            msg = message(opts.msg);
            if (!!(opts.title && msg)) {
              miss.missies.push(new Miss(type, i = i + 1, opts, opts.title, msg));
            }
          } else {
            _ref1 = document.querySelectorAll.call(document, k);
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              el = _ref1[_i];
              title = opts.title || el.dataset.missTitle || null;
              msg = message(el.dataset.missMsg) || message(opts.msg) || null;
              if (!!(title && msg)) {
                miss.missies.push(new Miss(el, i = i + 1, opts, title, msg));
              }
            }
          }
        }
        sortMissies();
        bindHover();
        return missShouldShow();
      }
    };
    Miss = (function() {
      function Miss(el, i, opts, title, msg) {
        this.off = __bind(this.off, this);
        this.on = __bind(this.on, this);
        this.bindOff = __bind(this.bindOff, this);
        this.bindOn = __bind(this.bindOn, this);
        this.resize = __bind(this.resize, this);
        this.canvasExtract = __bind(this.canvasExtract, this);
        this.highlight = __bind(this.highlight, this);
        this.buildBorder = __bind(this.buildBorder, this);
        this.boxSizing = __bind(this.boxSizing, this);
        this.buildBox = __bind(this.buildBox, this);
        switch (el) {
          case 'welcome':
            this.order = 0;
            this.el = null;
            break;
          case 'exit':
            this.order = 1000;
            this.el = null;
            break;
          default:
            this.order = parseInt(el.dataset.missOrder, 10) || parseInt(opts.order, 10) || 100 + i;
            this.el = el;
        }
        this.opts = opts;
        this.title = title;
        this.msg = msg;
        this.index = i;
        this.buildBox();
        this.buildBorder();
      }

      Miss.prototype.buildBox = function() {
        var box, close, msg_box, nav_box, nav_btns, page_num, rgba, title_box;
        box = document.createElement('div');
        box.id = "miss_" + this.order;
        box.className = 'miss-box popover';
        box.style.position = 'fixed';
        box.style.overflow = 'hidden';
        box.style.zIndex = this.opts.z_index + 1;
        title_box = document.createElement('div');
        title_box.className = 'miss-titlebar popover-title';
        close = '<span style="float:right;cursor:pointer;" onclick="miss.off()"\
               class="miss-close close" aria-hidden="true">&times;</span>';
        title_box.innerHTML = this.title + close;
        msg_box = document.createElement('div');
        msg_box.className = 'miss-msg popover-content';
        msg_box.style.overflow = 'auto';
        msg_box.style.height = '100%';
        msg_box.innerHTML = this.msg;
        nav_box = document.createElement('div');
        nav_box.id = "miss_nav_" + this.index;
        nav_box.className = 'miss-nav';
        nav_btns = '<div class="miss-btn-group btn-group">\
              <button class="miss-prev btn btn-default" onclick="miss.previous();">&#8592 prev</button>\
              <button class="miss-next btn btn-default" onclick="miss.next();">next &#8594</button>\
              <button class="miss-done btn btn-primary pull-right" onclick="miss.done();">done</button></div>';
        page_num = '<p class="miss-step-num text-center"></p>';
        if (!miss.global.theme) {
          rgba = colorConvert(this.opts.titlebar_color);
          box.style.backgroundColor = this.opts.background_color;
          box.style.borderRadius = "3px";
          box.style.border = "1px solid rgba(" + rgba.red + ", " + rgba.green + ", " + rgba.blue + ", 0.6)";
          title_box.style.backgroundColor = this.opts.titlebar_color;
          title_box.style.borderTopLeftRadius = "3px";
          title_box.style.borderTopRightRadius = "3px";
          title_box.style.padding = '8px';
          nav_box.style.textAlign = 'center';
          msg_box.style.padding = '8px';
          page_num = page_num.replace('>', ' style="text-align:center;">');
        }
        nav_box.innerHTML = nav_btns + page_num;
        box.appendChild(title_box);
        msg_box.appendChild(nav_box);
        box.appendChild(msg_box);
        showHideEl(box, false);
        document.body.appendChild(box);
        this.box = box;
        this.nav = nav_box;
        return this.boxSizing();
      };

      Miss.prototype.boxSizing = function() {
        var bd_miss_visible, box_miss_visible, coord, gravitate, screen;
        if (this.el) {
          coord = coords(this.el);
        }
        screen = testEl();
        bd_miss_visible = miss.bd.miss_visible || null;
        box_miss_visible = this.box.miss_visible || null;
        if (!bd_miss_visible) {
          miss.bd.style.visibility = 'hidden';
          miss.on();
        }
        if (!box_miss_visible) {
          this.box.style.visibility = 'hidden';
          showHideEl(this.box, true);
        }
        this.box.style.width = '';
        this.box.style.height = '';
        this.box.style.maxWidth = this.opts.box_width || (screen.width < 600 ? "85%" : "40%");
        this.box.style.maxHeight = this.opts.box_height || (screen.height < 400 ? "80%" : "60%");
        this.box.style.width = this.opts.box_width || ("" + this.box.offsetWidth + "px") || this.box.style.maxWidth;
        this.box.style.height = this.opts.box_height || ("" + this.box.offsetHeight + "px") || this.box.style.maxHeight;
        gravitate = this.el ? gravity(coord, this.box.offsetHeight, this.box.offsetWidth) : {};
        this.box.style.top = "" + (gravitate.x || (testEl().height / 2) - (this.box.offsetHeight / 2)) + "px";
        this.box.style.left = "" + (gravitate.y || (testEl().width / 2) - (this.box.offsetWidth / 2)) + "px";
        if (!bd_miss_visible) {
          miss.bd.style.visibility = '';
          miss.off();
        }
        if (!box_miss_visible) {
          this.box.style.visibility = '';
          return showHideEl(this.box, false);
        }
      };

      Miss.prototype.buildBorder = function() {
        if (!(this.opts.highlight && this.el)) {
          return;
        }
        if (this.border == null) {
          this.border = document.getElementById("miss_hl_" + this.index) || document.createElement('div');
        }
        this.border.id = "miss_hl_" + this.index;
        this.border.style.position = "fixed";
        if (this.opts.highlight) {
          this.border.style.border = "" + (this.opts.highlight_width || 0) + "px solid " + this.opts.highlight_color;
        }
        showHideEl(this.border, this.box.miss_visible || false);
        return miss.bd.appendChild(this.border);
      };

      Miss.prototype.highlight = function() {
        var coord, hl_border;
        if (!(this.opts.highlight && this.el)) {
          return;
        }
        coord = coords(this.el);
        hl_border = this.opts.highlight ? this.opts.highlight_width : 0;
        this.border.style.top = "" + (coord.top - hl_border) + "px";
        this.border.style.left = "" + (coord.left - hl_border) + "px";
        this.border.style.width = "" + (coord.width + hl_border) + "px";
        this.border.style.height = "" + (coord.height + hl_border) + "px";
        return showHideEl(this.border, this.box.miss_visible || false);
      };

      Miss.prototype.canvasExtract = function() {
        var coord, ctx, hl_border;
        if (!(this.opts.highlight && this.el)) {
          return;
        }
        coord = coords(this.el);
        hl_border = this.opts.highlight ? this.opts.highlight_width : 0;
        ctx = document.getElementById('miss_bd_canvas').getContext('2d');
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.fillRect(coord.left, coord.top, coord.width + hl_border, coord.height + hl_border);
        return ctx.restore();
      };

      Miss.prototype.resize = function() {
        this.boxSizing();
        this.highlight();
        if (this.box.miss_visible) {
          return this.canvasExtract();
        }
      };

      Miss.prototype.bindOn = function(event) {
        var key;
        switch (this.opts.key_modifier.toLowerCase()) {
          case 'alt':
            key = 'altKey';
            break;
          case 'ctrl':
          case 'control':
            key = 'ctrlKey';
            break;
          case 'shift':
            key = 'shiftKey';
            break;
          case 'cmd':
          case 'command':
          case 'meta':
            key = 'metaKey';
            break;
          default:
            return;
        }
        if (event[key]) {
          return this.on(true);
        }
      };

      Miss.prototype.bindOff = function() {
        return this.off(true);
      };

      Miss.prototype.on = function(alone) {
        if (alone == null) {
          alone = null;
        }
        if (miss.bd.v && !alone) {
          miss.on();
        }
        if (alone) {
          miss.off();
        }
        this.highlight();
        this.canvasExtract();
        if (alone) {
          showHideEl(this.nav, false);
        }
        if (this.border) {
          showHideEl(this.border, true);
        }
        showHideEl(this.box, true, alone);
        pageNumbers(this.box);
        return this.alone = alone;
      };

      Miss.prototype.off = function(alone) {
        if (alone == null) {
          alone = null;
        }
        backdropCanvas(alone);
        if (this.border) {
          showHideEl(this.border, false);
        }
        showHideEl(this.box, false);
        if (alone) {
          showHideEl(this.nav, true);
        }
        if (alone) {
          miss.off();
        }
        return this.alone = null;
      };

      return Miss;

    })();
    showHideEl = function(el, toggle) {
      if (toggle) {
        el.style.cssText = el.style.cssText += 'display:block !important;';
      } else {
        el.style.cssText = el.style.cssText += 'display:none !important;';
      }
      return el.miss_visible = toggle;
    };
    extend = function(objA, objB) {
      var attr;
      for (attr in objB) {
        objA[attr] = objB[attr];
      }
      return objA;
    };
    normalizeJSON = function(data, keyname) {
      var obj;
      for (obj in data) {
        if (!data.hasOwnProperty(obj)) {
          continue;
        }
        if (typeof data[obj] === "object") {
          return normalizeJSON(data[obj], keyname);
        } else {
          if (obj === keyname) {
            return data[obj];
          }
        }
      }
    };
    colorConvert = function(hex) {
      return {
        red: parseInt((prepHex(hex)).substring(0, 2), 16),
        green: parseInt((prepHex(hex)).substring(2, 4), 16),
        blue: parseInt((prepHex(hex)).substring(4, 6), 16)
      };
    };
    prepHex = function(hex) {
      hex = (hex.charAt(0) === "#" ? hex.split("#")[1] : hex);
      if (hex.length === 3) {
        return hex + hex;
      } else {
        return hex;
      }
    };
    sortMissies = function() {
      return miss.missies.sort(function(a, b) {
        return a.order - b.order;
      });
    };
    backdrop = function(toggle) {
      var bd, opts;
      if (!(bd = document.getElementById('miss_bd'))) {
        opts = miss.global;
        bd = document.createElement('div');
        bd.id = 'miss_bd';
        bd.style.cssText = "position:fixed;z-index:" + opts.z_index + ";top:0;right:0;bottom:0;left:0;";
        showHideEl(bd, false);
        document.body.appendChild(bd);
      }
      miss.bd = bd;
      backdropCanvas();
      return showHideEl(bd, toggle);
    };
    backdropCanvas = function() {
      var bd, canvas, ctx, opts, screen;
      screen = testEl();
      opts = miss.global;
      if (!(canvas = document.getElementById('miss_bd_canvas'))) {
        bd = miss.bd;
        canvas = document.createElement('canvas');
        canvas.id = 'miss_bd_canvas';
        bd.appendChild(canvas);
      }
      canvas.width = screen.width;
      canvas.height = screen.height;
      ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = opts.backdrop_opacity;
      ctx.fillStyle = "#" + (prepHex(opts.backdrop_color));
      return ctx.fillRect(0, 0, screen.width, screen.height);
    };
    message = function(msg) {
      var msg_el;
      if (/#{(.*?)}/.test(msg)) {
        msg_el = document.querySelector(msg.match(/#{(.*?)}/)[1]);
        showHideEl(msg_el, false);
        return msg_el.innerHTML;
      } else {
        return msg;
      }
    };
    coords = function(el) {
      var hl_border, rect;
      rect = el.getBoundingClientRect();
      hl_border = miss.global.highlight ? miss.global.highlight_width : 0;
      return {
        top: rect.top - hl_border,
        right: rect.right + hl_border,
        bottom: rect.bottom + hl_border,
        left: rect.left - hl_border,
        width: rect.width || rect.right - rect.left,
        height: rect.height || rect.bottom - rect.top
      };
    };
    testEl = function() {
      var test;
      if (!(test = document.getElementById('miss-size-test'))) {
        test = document.createElement("div");
        test.id = 'miss-size-test';
        test.style.cssText = "position: fixed;top: 0;left: 0;bottom: 0;right: 0; visibility: hidden;";
        document.body.appendChild(test);
      }
      return {
        height: test.offsetHeight,
        width: test.offsetWidth
      };
    };
    gravity = function(coords, height, width) {
      var add, arg, args, ary_x, ary_y, box_center, break_loop, center, diff, dk, dv, el_center, i, k, key, loc, map_x, map_y, mapping_x, mapping_y, optimal_x, optimal_y, overlap, pos, pos_ref, position, sort, v, val, value, x, y, _i, _j, _k, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      center = {
        x: testEl().height / 2,
        y: testEl().width / 2
      };
      el_center = {
        x: coords.height / 2,
        y: coords.width / 2
      };
      box_center = {
        x: height / 2,
        y: width / 2
      };
      mapping_x = {
        plane: 'x',
        metric: height,
        mstr: 'height',
        array: map_x = [],
        optimal: optimal_x = [],
        diffs: ary_x = [],
        setup: {
          top: null,
          middle: [el_center.x, 'top'],
          bottom: null
        }
      };
      mapping_y = {
        plane: 'y',
        metric: width,
        mstr: 'width',
        array: map_y = [],
        optimal: optimal_y = [],
        diffs: ary_y = [],
        setup: {
          left: null,
          middle: [el_center.y, 'left'],
          right: null
        }
      };
      sort = function(a, b) {
        return a - b;
      };
      _ref = [mapping_x, mapping_y];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        args = _ref[_i];
        _ref1 = args.setup;
        for (pos in _ref1) {
          arg = _ref1[pos];
          if (arg) {
            add = arg[0];
            loc = arg[1];
          } else {
            add = 0;
            loc = pos;
          }
          diff = {};
          val = {};
          diff[Object.keys(args.setup)[0]] = Math.abs(coords[loc] - box_center[args.plane] - center[args.plane] + add);
          diff[Object.keys(args.setup)[1]] = Math.abs(coords[loc] - center[args.plane] + add);
          diff[Object.keys(args.setup)[2]] = Math.abs(coords[loc] + box_center[args.plane] - center[args.plane] + add);
          val[Object.keys(args.setup)[0]] = coords[loc] - args.metric + add;
          val[Object.keys(args.setup)[1]] = coords[loc] - box_center[args.plane] + add;
          val[Object.keys(args.setup)[2]] = coords[loc] + add;
          position = pos;
          args.array.push({
            diff: diff,
            val: val,
            position: position
          });
        }
        _ref2 = args.array;
        for (k in _ref2) {
          v = _ref2[k];
          _ref3 = v.diff;
          for (key in _ref3) {
            value = _ref3[key];
            args.diffs.push(value);
          }
        }
        args.diffs.sort(sort);
        pos_ref = args.setup.middle[1];
        for (i = _j = 0; _j <= 8; i = ++_j) {
          break_loop = false;
          _ref4 = args.array;
          for (k in _ref4) {
            v = _ref4[k];
            _ref5 = v.diff;
            for (dk in _ref5) {
              dv = _ref5[dk];
              if (dv === args.diffs[i] && v.val[dk] >= 0 && (v.val[dk] + args.metric) < testEl().width) {
                overlap = (val = v.val[dk]) < coords[pos_ref] + coords[args.mstr] && val + args.metric > coords[pos_ref];
                args.optimal.push({
                  val: val,
                  diff: dv,
                  position: "" + v.position + "_" + dk,
                  overlap: overlap
                });
                break_loop = true;
                break;
              }
            }
            if (break_loop) {
              break;
            }
          }
        }
      }
      for (i = _k = 0; _k <= 8; i = ++_k) {
        if ((x = optimal_x[i]) && (y = optimal_y[i]) && !(x.overlap && y.overlap)) {
          break;
        }
      }
      return {
        x: x ? x.val : center.x - box_center.x,
        y: y ? y.val : center.y - box_center.y
      };
    };
    miss.current = function() {
      var i, m, _i, _len, _ref;
      if (!miss.missies) {
        return;
      }
      _ref = miss.missies;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        m = _ref[i];
        if (m.box.miss_visible) {
          return {
            index: i,
            missie: m
          };
        }
      }
    };
    pageNumbers = function(box) {
      var current, numbers;
      if (current = miss.current()) {
        numbers = box.getElementsByClassName('miss-step-num')[0];
        return numbers.innerHTML = "<p>" + (current.index + 1 || 1) + "/" + miss.missies.length + "</p>";
      }
    };
    miss.next = function() {
      var current;
      if (current = miss.current()) {
        current.missie.off();
        if (miss.missies[current.index + 1]) {
          return miss.missies[current.index + 1].on();
        } else {
          return miss.done();
        }
      }
    };
    miss.previous = function() {
      var current;
      if (current = miss.current()) {
        current.missie.off();
        if (miss.missies[current.index - 1]) {
          return miss.missies[current.index - 1].on();
        } else {
          return miss.off();
        }
      }
    };
    miss.first = function() {
      var current;
      if (current = miss.current()) {
        current.missie.off();
        return miss.missies[0].on();
      }
    };
    miss.last = function() {
      var current;
      if (current = miss.current()) {
        current.missie.off();
        return miss.missies[miss.missies.length - 1].on();
      }
    };
    missShouldShow = function() {
      if (!window.localStorage["" + miss.site + ":missDisable"] || miss.global.always_show) {
        if (miss.global.check_url) {
          checkUrl();
        } else {
          if (miss.global.show_on_load) {
            miss.on(null, true);
          }
        }
      }
      return setTriggers();
    };
    checkUrl = function() {
      var opts, processCheck, xhr;
      opts = miss.global;
      processCheck = function() {
        var status;
        if (xhr.readyState === 4) {
          if ((status = xhr.status) === 200 || status === 0) {
            return actOnCheck(JSON.parse(xhr.responseText));
          } else {
            return console.error('miss: check_url not returning expected results');
          }
        }
      };
      xhr = new XMLHttpRequest();
      xhr.onreadystatechange = processCheck;
      xhr.open(opts.check_method, miss.global.check_url, true);
      return xhr.send();
    };
    actOnCheck = function(data) {
      var key, show;
      key = miss.global.check_keyname;
      show = normalizeJSON(data, key);
      if (show) {
        return miss.on(null, true);
      }
    };
    resize = function() {
      var missie, _i, _len, _ref, _results;
      backdropCanvas();
      _ref = miss.missies;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        missie = _ref[_i];
        _results.push(missie.resize());
      }
      return _results;
    };
    window.onresize = function() {
      return resize();
    };
    window.onscroll = function() {
      return resize();
    };
    window.onorientationchange = function() {
      return resize();
    };
    navWithKeys = function(event) {
      var key;
      if (miss.current()) {
        key = event.which || event.char || event.charCode || event.key || event.keyCode;
        if (key === 37) {
          miss.previous();
        }
        if (key === 39) {
          miss.next();
        }
        if (key === parseInt(miss.global.key_on, 10)) {
          miss.on();
        }
        if (key === 27 || key === parseInt(miss.global.key_off, 10)) {
          miss.off();
        }
        if (key === 46) {
          return miss.destroy();
        }
      }
    };
    document.addEventListener('keydown', navWithKeys, false);
    bindHover = function() {
      var missie, _i, _len, _ref, _results;
      if (!miss.global.key_modifier) {
        return;
      }
      _ref = miss.missies;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        missie = _ref[_i];
        if (missie.el && missie.opts.show_on_hover) {
          _results.push(lonelyMissieBind(missie));
        }
      }
      return _results;
    };
    lonelyMissieBind = function(missie) {
      missie.el.addEventListener('mouseenter', missie.bindOn, false);
      return missie.el.addEventListener('mouseleave', missie.bindOff, false);
    };
    bindTriggers = function() {
      return miss.on(null, true);
    };
    setTriggers = function() {
      var el, els, _i, _len, _ref, _results;
      els = miss.global.trigger_el;
      _ref = document.querySelectorAll.call(document, els);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        _results.push(el.addEventListener('click', bindTriggers, false));
      }
      return _results;
    };
    miss.on = function(alone, start) {
      if (alone == null) {
        alone = null;
      }
      if (start == null) {
        start = null;
      }
      backdrop(true, alone);
      if (start) {
        return miss.missies[0].on();
      }
    };
    miss.off = function() {
      var missie, _i, _len, _ref;
      _ref = miss.missies;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        missie = _ref[_i];
        missie.off();
      }
      return backdrop(false);
    };
    miss.done = function() {
      window.localStorage.setItem("" + miss.site + ":missDisable", true);
      return miss.off();
    };
    miss.reset = function(misset) {
      miss.destroy(true);
      return miss.settings(misset.settings || null);
    };
    miss.destroy = function(soft) {
      var bd, el, els, missie, test, _i, _j, _len, _len1, _ref, _ref1;
      if (soft == null) {
        soft = null;
      }
      if (miss.missies) {
        _ref = miss.missies;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          missie = _ref[_i];
          if (missie.el) {
            missie.el.removeEventListener('mouseenter', missie.bindOn, false);
            missie.el.removeEventListener('mouseleave', missie.bindOff, false);
          }
          if (missie.box) {
            missie.box.parentNode.removeChild(missie.box);
          }
        }
      }
      els = miss.global.trigger_el;
      _ref1 = document.querySelectorAll.call(document, els);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        el = _ref1[_j];
        el.removeEventListener('click', bindTriggers, false);
      }
      test = document.getElementById('miss-size-test');
      if (test) {
        test.parentNode.removeChild(test);
      }
      bd = document.getElementById('miss_bd');
      if (bd) {
        bd.parentNode.removeChild(bd);
      }
      if (!soft) {
        document.removeEventListener('keydown', navWithKeys, false);
      }
      if (!soft) {
        return delete _this.miss;
      }
    };
    miss.settings = function(set) {
      return miss.global = extend({
        check_method: 'GET',
        show_on_load: true,
        backdrop: true,
        backdrop_color: '#000',
        backdrop_opacity: 0.5,
        z_index: 2100,
        highlight: true,
        highlight_width: 3,
        highlight_color: '#fff',
        btn_prev_text: '&#8592 prev',
        btn_next_text: 'next &#8594',
        btn_done_text: 'done'
      }, set);
    };
    return this.miss = miss;
  })(document);

}).call(this);
