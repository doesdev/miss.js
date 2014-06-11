((document) ->

  # Initializer
  miss = (misset) ->
    miss.site = window.location.host || window.location.hostname
    miss.missies = miss.missies || []
    miss.settings(misset.settings || null) unless miss.global
    setDefaults = -> return {
      order: 'series'
      background_color: '#f5f5f5'
      titlebar_color: '#939393'
      font_color: '#000'}

    if misset.elements
      miss.off()
      i = 0
      for k, v of misset.elements
        defaults = setDefaults()
        opts = extend( extend(defaults, v), miss.global)
        if (type = k.toLowerCase()) == 'welcome' || type == 'exit'
          msg = message(opts.msg)
          miss.missies.push(new Miss(type, i = i + 1, opts, opts.title, msg)) unless !(opts.title && msg)
        else
          for el in document.querySelectorAll.call(document, k)
            title = opts.title || el.dataset.missTitle || null
            msg = message(opts.msg) || message(el.dataset.missMsg) || null
            miss.missies.push(new Miss(el, i = i + 1, opts, title, msg)) unless !(title && msg)
      sortMissies()
      bindHover()
      missShouldShow()

  # Constructor
  class Miss
    constructor: (el, i, opts, title, msg) ->
      switch el
        when 'welcome' then @order = 0; @el = null
        when 'exit' then @order = 1000; @el = null
        else @order = parseInt(el.dataset.missOrder, 10) || parseInt(opts.order, 10) || 100 + i; @el = el
      @opts = opts
      @title = title
      @msg = msg
      @index = i

      # Functions called on initialize
      @buildBox()

    # Create elements with data
    buildBox: () =>
      # popover wrapper
      box = document.createElement('div')
      box.id = "miss_#{@order}"
      box.className = 'miss-box popover'
      box.style.position = 'fixed'
      box.style.zIndex = @opts.z_index + 1
      # title bar
      title_box = document.createElement('div')
      title_box.className = 'miss-titlebar popover-title'
      close = '<span style="float:right;cursor:pointer;" onclick="miss.off()"
               class="close" aria-hidden="true">&times;</span>'
      title_box.innerHTML = @title + close
      # content area
      msg_box = document.createElement('div')
      msg_box.className = 'miss-msg popover-content'
      msg_box.innerHTML = @msg
      nav_box = document.createElement('div')
      nav_box.className = 'miss-nav'
      # navigation
      nav = '<div class="btn-group">
              <button class="miss-prev btn btn-default" onclick="miss.previous();">&#8592 prev</button>
              <button class="miss-next btn btn-default" onclick="miss.next();">next &#8594</button></div>
              <button class="miss-done btn btn-primary pull-right" onclick="miss.done();">done</button></div>'
      page_num = '<p class="miss-step-num text-center"></p>'
      # apply (minimal) styling
      unless miss.global.theme
        rgba = colorConvert(@opts.titlebar_color)
        box.style.backgroundColor = @opts.background_color
        box.style.borderRadius = "3px"
        box.style.border = "1px solid rgba(#{rgba.red}, #{rgba.green}, #{rgba.blue}, 0.6)"
        title_box.style.backgroundColor = @opts.titlebar_color
        title_box.style.borderTopLeftRadius = "3px"
        title_box.style.borderTopRightRadius = "3px"
        title_box.style.padding = '8px'
        nav_box.style.textAlign = 'center'
        msg_box.style.padding = '8px'
        page_num = page_num.replace('>', ' style="text-align:center;">')
      # add them to DOM
      nav_box.innerHTML = nav + page_num
      box.appendChild(title_box)
      msg_box.appendChild(nav_box)
      box.appendChild(msg_box)
      showHideEl(box, false)
      document.body.appendChild(box)
      @box = box
      @boxSizing()

    boxSizing: () =>
      coord = coords(@el) if @el
      # ensure box is on dom for obtaining dimensions
      bd_miss_visible = miss.bd.miss_visible || null
      box_miss_visible = @box.miss_visible || null
      unless bd_miss_visible
        miss.bd.style.visibility = 'hidden'
        miss.on()
      unless box_miss_visible
        @box.style.visibility = 'hidden'
        showHideEl(@box, true)
      # set box dimensions
      @box.style.maxWidth = "30%"
      @box.style.maxHeight = "60%"
      # set box gravity
      gravitate = if @el then gravity(coord, @box.offsetHeight, @box.offsetWidth) else {}
      @box.style.top = "#{gravitate.x || (testEl().height / 2) - (@box.offsetHeight / 2)}px"
      @box.style.left = "#{gravitate.y || (testEl().width / 2) - (@box.offsetWidth / 2)}px"
      # hide again
      unless bd_miss_visible
        miss.bd.style.visibility = ''
        miss.off()
      unless box_miss_visible
        @box.style.visibility = ''
        showHideEl(@box, false)

    highlight: () =>
      coord = coords(@el)
      hl_border = if @opts.highlight then @opts.highlight_width else 0
      hl = document.getElementById("miss_hl_#{@index}") || document.createElement('div')
      hl.id = "miss_hl_#{@index}"
      hl.style.position = "fixed"
      hl.style.top = "#{coord.top - hl_border}px"
      hl.style.left = "#{coord.left - hl_border}px"
      hl.style.width = "#{coord.width + hl_border}px"
      hl.style.height = "#{coord.height + hl_border}px"
      hl.style.border = "#{hl_border}px solid #{@opts.highlight_color}" if @opts.highlight
      miss.bd.appendChild(hl)
      ctx = document.getElementById('miss_bd_canvas').getContext('2d')
      ctx.save()
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.fillRect(coord.left, coord.top, coord.width + hl_border, coord.height + hl_border)
      ctx.fill()
      ctx.restore()

    resize: () =>
      this.boxSizing()
      backdropCanvas() unless @alone
      @highlight() if @el

    bindOn: (event) =>
      switch @opts.key_modifier.toLowerCase()
        when 'alt' then key = 'altKey'
        when 'ctrl', 'control' then key = 'ctrlKey'
        when 'shift' then key = 'shiftKey'
        when 'cmd', 'command', 'meta' then key = 'metaKey'
        else return
      @on(true) if event[key]

    bindOff: () =>
      @off(true)

    on: (alone = null) =>
      miss.on() if miss.bd.visible && !alone
      miss.off() if alone
      @highlight() if @el
      showHideEl(@box, true, alone)
      pageNumbers(@box)
      @alone = alone

    off: (alone = null) =>
      hl = document.getElementById("miss_hl_#{@index}")
      hl.parentNode.removeChild(hl) if hl
      backdropCanvas(alone)
      showHideEl(@box, false)
      miss.off() if alone
      @alone = null

  # Helpers
  showHideEl = (el, toggle) ->
    if toggle then el.style.cssText = el.style.cssText += 'display:block !important;'
    else el.style.cssText = el.style.cssText += 'display:none !important;'
    el.miss_visible = toggle

  extend = (objA, objB) ->
    for attr of objB
      objA[attr] = objB[attr]
    return objA

  normalizeJSON = (data, keyname) ->
    for obj of data
      continue unless data.hasOwnProperty(obj)
      if typeof data[obj] == "object" then return normalizeJSON(data[obj], keyname)
      else return data[obj] if obj == keyname

  colorConvert = (hex) ->
    red: parseInt((prepHex(hex)).substring(0, 2), 16)
    green: parseInt((prepHex(hex)).substring(2, 4), 16)
    blue: parseInt((prepHex(hex)).substring(4, 6), 16)

  prepHex = (hex) ->
    hex = (if (hex.charAt(0) is "#") then hex.split("#")[1] else hex)
    return if hex.length is 3 then hex + hex else hex

  # Sort missies by order
  sortMissies = () ->
    miss.missies.sort((a, b) -> a.order - b.order)

  # Backdrop
  backdrop = (toggle) ->
    unless bd = document.getElementById('miss_bd')
      opts =  miss.global
      bd = document.createElement('div')
      bd.id = 'miss_bd'
      bd.style.cssText = "position:fixed;z-index:#{opts.z_index};top:0;right:0;bottom:0;left:0;"
      showHideEl(bd, false)
      document.body.appendChild(bd)
    miss.bd = bd
    backdropCanvas()
    showHideEl(bd, toggle)

  # Canvas overlay for backdrop
  backdropCanvas = () ->
    screen = testEl()
    opts =  miss.global
    unless canvas = document.getElementById('miss_bd_canvas')
      bd = miss.bd
      canvas = document.createElement('canvas')
      canvas.id = 'miss_bd_canvas'
      bd.appendChild(canvas)
    canvas.width = screen.width
    canvas.height = screen.height
    ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = opts.backdrop_opacity
    ctx.fillStyle = "##{prepHex(opts.backdrop_color)}"
    ctx.fillRect(0,0,screen.width,screen.height)

  # Format message
  message = (msg) ->
    if (/#{(.*?)}/.test(msg))
      msg_el = document.querySelector(msg.match(/#{(.*?)}/)[1])
      showHideEl(msg_el, false)
      return msg_el.innerHTML
    else
      return msg

  # Get element coordinates
  coords = (el) ->
    rect = el.getBoundingClientRect()
    hl_border = if miss.global.highlight then miss.global.highlight_width else 0
    top: rect.top - hl_border
    right: rect.right + hl_border
    bottom: rect.bottom + hl_border
    left: rect.left - hl_border
    width: rect.width || rect.right - rect.left
    height: rect.height || rect.bottom - rect.top

  #Build test element for getting screen dimensions
  testEl = () ->
    unless test = document.getElementById('miss-size-test')
      test = document.createElement("div")
      test.id = 'miss-size-test'
      test.style.cssText = "position: fixed;top: 0;left: 0;bottom: 0;right: 0; visibility: hidden;"
      document.body.appendChild(test)
    height: test.offsetHeight
    width: test.offsetWidth

  # Gravitate to center
  gravity = (coords, height, width) ->
    ary_x = []
    ary_y = []
    center =
      x: testEl().height / 2
      y: testEl().width / 2
    el_center =
      x: coords.height / 2
      y: coords.width / 2
    box_center =
      x: height / 2
      y: width / 2
    mapping_x =
      plane: 'x',
      metric: height,
      array: map_x = [],
      setup: {top: null, middle: [el_center.x, 'top'], bottom: null}
    mapping_y =
      plane: 'y',
      metric: width,
      array: map_y = [],
      setup: {left: null, middle: [el_center.y, 'left'], right: null}
    for args in [mapping_x, mapping_y]
      for pos, arg of args.setup
        if arg then add = arg[0]; loc = arg[1] else add = 0; loc = pos
        diff = {}
        diff[Object.keys(args.setup)[0]] = Math.abs(coords[loc] - box_center[args.plane] - center[args.plane] + add)
        diff[Object.keys(args.setup)[1]] = Math.abs(coords[loc] - center[args.plane] + add)
        diff[Object.keys(args.setup)[2]] = Math.abs(coords[loc] + box_center[args.plane] - center[args.plane] + add)
        val = {}
        val[Object.keys(args.setup)[0]] = coords[loc] - args.metric + add
        val[Object.keys(args.setup)[1]] = coords[loc] - box_center[args.plane] + add
        val[Object.keys(args.setup)[2]] = coords[loc] + add
        position = pos
        args.array.push({diff, val, position})

    ary_x.push(xv) for xk, xv of v.diff for k, v of map_x
    ary_y.push(yv) for yk, yv of v.diff for k, v of map_y
    optimal_x = ary_x.sort((a,b) -> a - b)[0]
    optimal_y = ary_y.sort((a,b) -> a - b)[0]
    for k, v of map_x
      for xk, xv of v.diff
        if xv == optimal_x
          val = v.val[xk]
          overlap = (val < coords.top + coords.height && val + height > coords.top)
          x = val: val, position: "#{v.position}_#{xk}", overlap: overlap; break_loop = true; break
      break if break_loop

    for i in [0..8]
      break_loop = false
      for k, v of map_y
        for yk, yv of v.diff
          val = v.val[yk]
          if yv == ary_y[i] && !(x.overlap && val < coords.left + coords.width && val + width > coords.left)
            y = val: v.val[yk], position: "#{v.position}_#{yk}"; break_loop = true; break
        break if break_loop
      break if break_loop

    x: x.val
    y: y.val

  # Navigate missies
  miss.current = () ->
    return {index: i, missie: m} for m, i in miss.missies when m.box.miss_visible

  pageNumbers = (box) ->
    if current = miss.current()
      numbers = box.getElementsByClassName('miss-step-num')[0]
      numbers.innerHTML = "<p>#{current.index + 1 || 1}/#{miss.missies.length}</p>"

  miss.next = () ->
    if current = miss.current()
      current.missie.off()
      if miss.missies[current.index + 1] then return miss.missies[current.index + 1].on() else return miss.done()

  miss.previous = () ->
    if current = miss.current()
      current.missie.off()
      if miss.missies[current.index - 1] then return miss.missies[current.index - 1].on() else return miss.off()

  miss.first = () ->
    if current = miss.current()
      current.missie.off()
      miss.missies[0].on()

  miss.last = () ->
    if current = miss.current()
      current.missie.off()
      miss.missies[miss.missies.length - 1].on()

  # Validate that miss should show
  missShouldShow = () ->
    unless window.localStorage["#{miss.site}:missDisable"] && !miss.global.always_show
      if miss.global.check_url then checkUrl()
      else miss.on(null, true) if miss.global.show_on_load
    setTriggers()

  bindTriggers = () ->
    miss.on(null, true)

  setTriggers = () ->
    els = miss.global.trigger_el
    el.addEventListener('click', bindTriggers, false) for el in document.querySelectorAll.call(document, els)

  checkUrl = () ->
    opts = miss.global
    processCheck = () ->
      if xhr.readyState == 4
        if (status = xhr.status) == 200 || status == 0 then actOnCheck(JSON.parse(xhr.responseText))
        else console.error('miss: check_url not returning expected results')

    xhr = new XMLHttpRequest()
    xhr.onreadystatechange = processCheck
    xhr.open(opts.check_method, miss.global.check_url, true)
    xhr.send()

  actOnCheck = (data) ->
    key = miss.global.check_keyname
    show = normalizeJSON(data, key)
    miss.on(null, true) if show

  # Resize event handlers
  resize = () ->
    missie.resize() for missie in miss.missies

  window.onresize = -> resize()
  window.onscroll = -> resize()
  window.onorientationchange = -> resize()

  # Keyboard and mouse event handlers
  navWithKeys = (event) ->
    if miss.current()
      key = event.which || event.char || event.charCode || event.key || event.keyCode
      miss.previous() if key == 37
      miss.next() if key == 39
      miss.off() if key == 27
      miss.destroy() if key == 46

  document.addEventListener('keydown', navWithKeys, false)

  bindHover = () ->
    return unless miss.global.key_modifier
    lonelyMissieBind(missie) for missie in miss.missies when missie.el

  lonelyMissieBind = (missie) ->
    missie.el.addEventListener('mouseenter', missie.bindOn, false)
    missie.el.addEventListener('mouseleave', missie.bindOff, false)

  # Plugin states
  miss.on = (alone = null, start = null) ->
    backdrop(true, alone)
    miss.missies[0].on() if start

  miss.off = () ->
    missie.off() for missie in miss.missies
    backdrop(false)

  miss.done = () ->
    window.localStorage.setItem("#{miss.site}:missDisable", true)
    miss.off()

  miss.destroy = () =>
    for missie in miss.missies
      if missie.el
        missie.el.removeEventListener('mouseenter', missie.bindOn, false)
        missie.el.removeEventListener('mouseleave', missie.bindOff, false)
      missie.box.parentNode.removeChild(missie.box) if missie.box
    test = document.getElementById('miss-size-test')
    els = miss.global.trigger_el
    el.removeEventListener('click', bindTriggers, false) for el in document.querySelectorAll.call(document, els)
    test.parentNode.removeChild(test)
    bd = document.getElementById('miss_bd')
    bd.parentNode.removeChild(bd)
    document.removeEventListener('keydown', navWithKeys, false)
    delete this.miss

  # Global settings
  miss.settings = (set) ->
    miss.global = extend(
      theme: null
      check_url: null
      check_method: 'GET'
      check_keyname: null
      show_on_load: true
      always_show: null
      trigger_el: null
      key_modifier: null # 'alt', 'ctrl', 'shift', 'cmd'
      key_on: null
      key_off: null
      key_hover: null
      backdrop: true
      backdrop_color: '#000'
      backdrop_opacity: 0.5
      z_index: 2100
      welcome_title: null
      welcome_msg: null
      highlight: true
      highlight_width: 3
      highlight_color: '#fff'
      btn_prev_text: '&#8592 prev'
      btn_next_text: 'next &#8594'
      btn_done_text: 'done'
    , set)

  this.miss = miss

) document
