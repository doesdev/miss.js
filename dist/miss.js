(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function(document) {
    var Miss, backdrop, backdropCanvas, colorConvert, coords, extend, gravity, message, miss, pageNumbers, prepHex, resize, showHideEl, sortMissies, testEl,
      _this = this;
    miss = function(misset) {
      var defaults, el, i, k, msg, opts, setDefaults, title, v, _i, _len, _ref, _ref1;
      miss.missies = miss.missies || [];
      if (!miss.global) {
        miss.settings(misset.settings || null);
      }
      setDefaults = function() {
        return {
          order: 'series',
          background_color: '#f5f5f5',
          titlebar_color: '#939393',
          font_color: '#000'
        };
      };
      if (misset.elements) {
        miss.off();
        i = 0;
        _ref = misset.elements;
        for (k in _ref) {
          v = _ref[k];
          defaults = setDefaults();
          opts = extend(extend(defaults, v), miss.global);
          _ref1 = document.querySelectorAll.call(document, k);
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            el = _ref1[_i];
            title = opts.title || el.dataset.missTitle || null;
            msg = message(opts.msg) || message(el.dataset.missMsg) || null;
            if (!!(title || msg)) {
              miss.missies.push(new Miss(el, i = i + 1, opts, title, msg));
            }
          }
        }
        sortMissies();
        miss.on();
        return miss.missies[0].on();
      }
    };
    Miss = (function() {
      function Miss(el, i, opts, title, msg) {
        this.off = __bind(this.off, this);
        this.on = __bind(this.on, this);
        this.resize = __bind(this.resize, this);
        this.highlight = __bind(this.highlight, this);
        this.boxSizing = __bind(this.boxSizing, this);
        this.buildBox = __bind(this.buildBox, this);
        this.el = el;
        this.order = parseInt(this.el.dataset.missOrder, 10) || parseInt(opts.order, 10) || 100 + i;
        this.opts = opts;
        this.title = title;
        this.msg = msg;
        this.index = i;
        this.buildBox();
      }

      Miss.prototype.buildBox = function() {
        var box, close, msg_box, nav_box, nav_buttons, nav_numbers, rgba, title_box;
        box = document.createElement('div');
        box.id = "miss_" + this.order;
        box.className = 'miss-box popover';
        box.style.position = 'fixed';
        title_box = document.createElement('div');
        title_box.className = 'miss-titlebar popover-title';
        close = '<span style="float:right;cursor:pointer;" onclick="miss.off()"\
               class="close" aria-hidden="true">&times;</span>';
        title_box.innerHTML = this.title + close;
        msg_box = document.createElement('div');
        msg_box.className = 'miss-msg popover-content';
        msg_box.innerHTML = this.msg;
        nav_box = document.createElement('div');
        nav_box.className = 'miss-nav';
        nav_buttons = '<div class="btn-group">\
                      <button class="btn btn-default" onclick="miss.previous();">prev</button>\
                      <button class="btn btn-default" onclick="miss.next();">next</button></div>';
        nav_numbers = '<p class="miss-step-num pull-right"></p>';
        nav_box.innerHTML = nav_buttons + nav_numbers;
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
        }
        box.appendChild(title_box);
        msg_box.appendChild(nav_box);
        box.appendChild(msg_box);
        showHideEl(box, false);
        miss.bd.appendChild(box);
        this.box = box;
        return this.boxSizing();
      };

      Miss.prototype.boxSizing = function() {
        var bd_miss_visible, box_miss_visible, coord, gravitate;
        coord = coords(this.el);
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
        this.box.style.maxWidth = "30%";
        this.box.style.maxHeight = "60%";
        gravitate = gravity(coord, this.box.offsetHeight, this.box.offsetWidth);
        this.box.style.top = "" + gravitate.x + "px";
        this.box.style.left = "" + gravitate.y + "px";
        if (!bd_miss_visible) {
          miss.bd.style.visibility = '';
          miss.off();
        }
        if (!box_miss_visible) {
          this.box.style.visibility = '';
          return showHideEl(this.box, false);
        }
      };

      Miss.prototype.highlight = function() {
        var coord, ctx, hl, hl_border;
        coord = coords(this.el);
        hl_border = this.opts.highlight ? this.opts.highlight_width : 0;
        hl = document.getElementById("miss_hl_" + this.index) || document.createElement('div');
        hl.id = "miss_hl_" + this.index;
        hl.style.position = "fixed";
        hl.style.top = "" + (coord.top - hl_border) + "px";
        hl.style.left = "" + (coord.left - hl_border) + "px";
        hl.style.width = "" + (coord.width + hl_border) + "px";
        hl.style.height = "" + (coord.height + hl_border) + "px";
        if (this.opts.highlight) {
          hl.style.border = "" + hl_border + "px solid " + this.opts.highlight_color;
        }
        miss.bd.appendChild(hl);
        ctx = document.getElementById('miss_bd_canvas').getContext('2d');
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.fillRect(coord.left, coord.top, coord.width + hl_border, coord.height + hl_border);
        ctx.fill();
        return ctx.restore();
      };

      Miss.prototype.resize = function() {
        this.boxSizing();
        backdropCanvas();
        return this.highlight();
      };

      Miss.prototype.on = function() {
        this.highlight();
        showHideEl(this.box, true);
        return pageNumbers(this.box);
      };

      Miss.prototype.off = function() {
        var hl;
        hl = document.getElementById("miss_hl_" + this.index);
        if (hl) {
          hl.parentNode.removeChild(hl);
        }
        backdropCanvas();
        return showHideEl(this.box, false);
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
      var add, arg, args, ary_x, ary_y, box_center, break_loop, center, diff, el_center, i, k, loc, map_x, map_y, mapping_x, mapping_y, optimal_x, optimal_y, overlap, pos, position, v, val, x, xk, xv, y, yk, yv, _i, _j, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      ary_x = [];
      ary_y = [];
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
        array: map_x = [],
        setup: {
          top: null,
          middle: [el_center.x, 'top'],
          bottom: null
        }
      };
      mapping_y = {
        plane: 'y',
        metric: width,
        array: map_y = [],
        setup: {
          left: null,
          middle: [el_center.y, 'left'],
          right: null
        }
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
          diff[Object.keys(args.setup)[0]] = Math.abs(coords[loc] - box_center[args.plane] - center[args.plane] + add);
          diff[Object.keys(args.setup)[1]] = Math.abs(coords[loc] - center[args.plane] + add);
          diff[Object.keys(args.setup)[2]] = Math.abs(coords[loc] + box_center[args.plane] - center[args.plane] + add);
          val = {};
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
      }
      for (k in map_x) {
        v = map_x[k];
        _ref2 = v.diff;
        for (xk in _ref2) {
          xv = _ref2[xk];
          ary_x.push(xv);
        }
      }
      for (k in map_y) {
        v = map_y[k];
        _ref3 = v.diff;
        for (yk in _ref3) {
          yv = _ref3[yk];
          ary_y.push(yv);
        }
      }
      optimal_x = ary_x.sort(function(a, b) {
        return a - b;
      })[0];
      optimal_y = ary_y.sort(function(a, b) {
        return a - b;
      })[0];
      for (k in map_x) {
        v = map_x[k];
        _ref4 = v.diff;
        for (xk in _ref4) {
          xv = _ref4[xk];
          if (xv === optimal_x) {
            val = v.val[xk];
            overlap = val < coords.top + coords.height && val + height > coords.top;
            x = {
              val: val,
              position: "" + v.position + "_" + xk,
              overlap: overlap
            };
            break_loop = true;
            break;
          }
        }
        if (break_loop) {
          break;
        }
      }
      for (i = _j = 0; _j <= 8; i = ++_j) {
        break_loop = false;
        for (k in map_y) {
          v = map_y[k];
          _ref5 = v.diff;
          for (yk in _ref5) {
            yv = _ref5[yk];
            val = v.val[yk];
            if (yv === ary_y[i] && !(x.overlap && val < coords.left + coords.width && val + width > coords.left)) {
              y = {
                val: v.val[yk],
                position: "" + v.position + "_" + yk
              };
              break_loop = true;
              break;
            }
          }
          if (break_loop) {
            break;
          }
        }
        if (break_loop) {
          break;
        }
      }
      return {
        x: x.val,
        y: y.val
      };
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
    miss.settings = function(set) {
      return miss.global = extend({
        theme: null,
        trigger: null,
        key_on: null,
        key_off: null,
        key_hover: null,
        backdrop_color: '#000',
        backdrop_opacity: 0.5,
        z_index: 2100,
        welcome_title: null,
        welcome_msg: null,
        highlight: true,
        highlight_width: 3,
        highlight_color: '#fff'
      }, set);
    };
    resize = function() {
      var m;
      if (m = miss.current()) {
        return m.missie.resize();
      }
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
    miss.current = function() {
      var i, m, _i, _len, _ref;
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
          return miss.off();
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
      return function() {
        var current;
        if (current = miss.current()) {
          current.missie.off();
          return miss.missies[0].on();
        }
      };
    };
    miss.last = function() {
      return function() {
        var current;
        if (current = miss.current()) {
          current.missie.off();
          return miss.missies[miss.missies.length - 1].on();
        }
      };
    };
    miss.on = function() {
      return backdrop(true);
    };
    miss.off = function() {
      return backdrop(false);
    };
    miss.destroy = function() {
      var bd, test;
      test = document.getElementById('miss-size-test');
      test.parentNode.removeChild(test);
      bd = document.getElementById('miss_bd');
      bd.parentNode.removeChild(bd);
      return delete _this.miss;
    };
    return this.miss = miss;
  })(document);

}).call(this);
