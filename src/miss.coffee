((document) ->

  # Initializer
  miss = (misset) ->
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
        for el in document.querySelectorAll.call(document, k)
          title = opts.title || el.dataset.missTitle || null
          msg = message(opts.msg) || message(el.dataset.missMsg) || null
          miss.missies.push(new Miss(el, i = i + 1, opts, title, msg)) unless !(title || msg)
      sortMissies()
      miss.on()
      miss.missies[0].on()

  # Constructor
  class Miss
    constructor: (el, i, opts, title, msg) ->
      @el = el
      @order = parseInt(@el.dataset.missOrder, 10) || parseInt(opts.order, 10) || 100 + i
      @opts = opts
      @title = title
      @msg = msg
      @index = i

      # Functions called on initialize
      this.buildBox()

    buildBox: () =>
      # create elements with data
      box = document.createElement('div')
      box.id = "miss_#{@order}"
      box.className = 'miss-box popover'
      box.style.position = 'fixed'
      title_box = document.createElement('div')
      title_box.className = 'miss-titlebar popover-title'
      close = '<span style="float:right;cursor:pointer;" onclick="miss.off()"
               class="close" aria-hidden="true">&times;</span>'
      title_box.innerHTML = @title + close
      msg_box = document.createElement('div')
      msg_box.className = 'miss-msg popover-content'
      msg_box.innerHTML = @msg
      nav_box = document.createElement('div')
      nav_box.className = 'miss-nav'
      nav_buttons = '<div class="btn-group">
                      <button class="btn btn-default" onclick="miss.previous();">prev</button>
                      <button class="btn btn-default" onclick="miss.next();">next</button></div>'
      nav_numbers = '<p class="miss-step-num pull-right"></p>'
      nav_box.innerHTML = nav_buttons + nav_numbers
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
      # add them to DOM
      box.appendChild(title_box)
      msg_box.appendChild(nav_box)
      box.appendChild(msg_box)
      showHideEl(box, false)
      miss.bd.appendChild(box)
      @box = box
      this.boxSizing()

    boxSizing: () =>
      coord = coords(@el)
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
      gravitate = gravity(coord, @box.offsetHeight, @box.offsetWidth)
      @box.style.top = "#{gravitate.x}px"
      @box.style.left = "#{gravitate.y}px"
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
      backdropCanvas()
      this.highlight()

    on: () =>
      this.highlight()
      showHideEl(@box, true)
      pageNumbers(@box)

    off: () =>
      hl = document.getElementById("miss_hl_#{@index}")
      hl.parentNode.removeChild(hl) if hl
      backdropCanvas()
      showHideEl(@box, false)

  # Helpers
  showHideEl = (el, toggle) ->
    if toggle then el.style.cssText = el.style.cssText += 'display:block !important;'
    else el.style.cssText = el.style.cssText += 'display:none !important;'
    el.miss_visible = toggle

  extend = (objA, objB) ->
    for attr of objB
      objA[attr] = objB[attr]
    return objA

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
    map_x = [
      diff:
        top: Math.abs(coords.top - box_center.x - center.x)
        middle: Math.abs(coords.top - center.x)
        bottom: Math.abs(coords.top + box_center.x - center.x)
      val:
        top: coords.top - height
        middle: coords.top - box_center.x
        bottom: coords.top
      position: 'top'
    ,
      diff:
        top: Math.abs(coords.top + el_center.x - box_center.x - center.x)
        middle: Math.abs(coords.top + el_center.x - center.x)
        bottom: Math.abs(coords.top + el_center.x + box_center.x - center.x)
      val:
        top: coords.top + el_center.x - height
        middle: coords.top + el_center.x - box_center.x
        bottom: coords.top + el_center.x
      position: 'middle'
    ,
      diff:
        top: Math.abs(coords.bottom - box_center.x - center.x)
        middle: Math.abs(coords.bottom - center.x)
        bottom: Math.abs(coords.bottom + box_center.x - center.x)
      val:
        top: coords.bottom - height
        middle: coords.bottom - box_center.x
        bottom: coords.bottom
      position: 'bottom']
    map_y = [
      diff:
        left: Math.abs(coords.left - box_center.y - center.y)
        middle: Math.abs(coords.left - center.y)
        right: Math.abs(coords.left + box_center.y - center.y)
      val: 
        left: coords.left - width
        middle: coords.left - box_center.y
        right: coords.left
      position: 'left'
    ,
      diff:
        left: Math.abs(coords.left + el_center.y - box_center.y - center.y)
        middle: Math.abs(coords.left + el_center.y - center.y)
        right: Math.abs(coords.left + el_center.y + box_center.y - center.y)
      val: 
        left: coords.left + el_center.y - width
        middle: coords.left + el_center.y - box_center.y
        right: coords.left + el_center.y
      position: 'middle'
    ,
      diff:
        left: Math.abs(coords.right - box_center.y - center.y)
        middle: Math.abs(coords.right - center.y)
        right: Math.abs(coords.right + box_center.y - center.y)
      val: 
        left: coords.right - width
        middle: coords.right - box_center.y
        right: coords.right
      position: 'right']

    ary_x.push(xv) for xk, xv of v.diff for k, v of map_x
    ary_y.push(yv) for yk, yv of v.diff for k, v of map_y
    optimal_x = ary_x.sort((a,b) -> a - b)[0]
    optimal_y = ary_y.sort((a,b) -> a - b)[0]
#    ary_x.sort((a,b) -> a - b)
#    ary_y.sort((a,b) -> a - b)
#    optimal_x = ''
#    optimal_y = ''
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

  # Global settings
  miss.settings = (set) ->
    miss.global = extend(
      theme: null
      trigger: null
      key_on: null
      key_off: null
      key_hover: null
      backdrop_color: '#000'
      backdrop_opacity: 0.5
      z_index: 2100
      welcome_title: null
      welcome_msg: null
      highlight: true
      highlight_width: 3
      highlight_color: '#fff'
    , set)

  # Resize events
  resize = () ->
    if m = miss.current()
      m.missie.resize()

  window.onresize = -> resize()
  window.onscroll = -> resize()
  window.onorientationchange = -> resize()

  # Navigate missies
  miss.current = () ->
    for m, i in miss.missies
      if m.box.miss_visible
        return {index: i, missie: m}

  pageNumbers = (box) ->
    if current = miss.current()
      numbers = box.getElementsByClassName('miss-step-num')[0]
      numbers.innerHTML = "<p>#{current.index + 1 || 1}/#{miss.missies.length}</p>"

  miss.next = () ->
    if current = miss.current()
      current.missie.off()
      if miss.missies[current.index + 1] then return miss.missies[current.index + 1].on() else return miss.off()

  miss.previous = () ->
    if current = miss.current()
      current.missie.off()
      if miss.missies[current.index - 1] then return miss.missies[current.index - 1].on() else return miss.off()

  miss.first = () ->->
    if current = miss.current()
      current.missie.off()
      miss.missies[0].on()

  miss.last = () ->->
    if current = miss.current()
      current.missie.off()
      miss.missies[miss.missies.length - 1].on()

  # Plugin states
  miss.on = () ->
    backdrop(true)

  miss.off = () ->
    backdrop(false)

  miss.destroy = () =>
    test = document.getElementById('miss-size-test')
    test.parentNode.removeChild(test)
    bd = document.getElementById('miss_bd')
    bd.parentNode.removeChild(bd)
    delete this.miss

  this.miss = miss

) document
