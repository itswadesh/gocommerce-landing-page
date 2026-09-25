/* Behaviour for kitcommerce.store.
 *
 * Everything here is progressive: the page is readable and complete with the
 * script blocked. The navigation drawer is a plain list, the two menus are
 * native <details>, the tabs fall back to the first screenshot, the copy
 * buttons simply do nothing, and the repository numbers stay at the values
 * measured when the page was built. Analytics load only after consent, and
 * only if an ID was configured at build time at all.
 */

(function () {
  'use strict'

  var $ = function (sel, root) { return (root || document).querySelector(sel) }
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)) }

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ───────────────────────────────────────────────── mobile drawer */

  // Below 860px the nav is a drawer that slides in from the right. The list
  // is the same element the desktop nav uses, so there is one set of links to
  // keep correct. While open, the page behind is scroll-locked and Tab stays
  // inside the drawer; closing returns focus to the button that opened it.
  var menu = $('.menu')
  var links = $('#navlinks')
  var closeBtn = $('.drawer-close')
  var scrim = $('.scrim')
  var lastFocus = null

  function navOpen () { return !!(links && links.classList.contains('open')) }

  function openNav () {
    links.classList.add('open')
    menu.setAttribute('aria-expanded', 'true')
    document.documentElement.classList.add('nav-open')
    lastFocus = document.activeElement
    var first = closeBtn || $('a', links)
    // The drawer is visibility:hidden until the class applies; reading a
    // layout property forces that before the focus call, which would
    // otherwise silently fail on a still-hidden element.
    void links.offsetWidth
    if (first) first.focus()
  }

  function closeNav (restoreFocus) {
    if (!navOpen()) return
    links.classList.remove('open')
    menu.setAttribute('aria-expanded', 'false')
    document.documentElement.classList.remove('nav-open')
    $$('details.navmenu', links).forEach(function (d) { d.open = false })
    if (restoreFocus && lastFocus && lastFocus.focus) lastFocus.focus()
  }

  if (menu && links) {
    menu.addEventListener('click', function () { navOpen() ? closeNav(true) : openNav() })
    if (closeBtn) closeBtn.addEventListener('click', function () { closeNav(true) })
    if (scrim) scrim.addEventListener('click', function () { closeNav(true) })
    $$('a', links).forEach(function (a) { a.addEventListener('click', function () { closeNav(false) }) })

    links.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !navOpen()) return
      var focusable = $$('a[href], button, summary', links).filter(function (el) { return el.offsetParent !== null })
      if (!focusable.length) return
      var first = focusable[0]
      var last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    })

    // Widening past the breakpoint drops the drawer state, so the desktop nav
    // is never left scroll-locked or half-open.
    var wide = window.matchMedia('(min-width: 861px)')
    var onWide = function (e) { if (e.matches) closeNav(false) }
    if (wide.addEventListener) wide.addEventListener('change', onWide)
    else if (wide.addListener) wide.addListener(onWide)
  }

  /* ────────────────────────────────────────────── disclosure menus */

  // Solutions and Develop are <details>. Native behaviour covers open, close,
  // keyboard and touch; this adds the two things it lacks: one open at a time,
  // and closing on Escape or a click elsewhere.
  var menus = $$('details.navmenu')

  function closeMenus (except) {
    menus.forEach(function (d) { if (d !== except) d.open = false })
  }

  menus.forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) closeMenus(d) })
    $$('a', d).forEach(function (a) { a.addEventListener('click', function () { d.open = false }) })
  })

  document.addEventListener('click', function (e) {
    if (!menus.length) return
    if (e.target && e.target.closest && e.target.closest('details.navmenu')) return
    closeMenus(null)
  })

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return
    var open = menus.filter(function (d) { return d.open })
    if (open.length) {
      open.forEach(function (d) {
        d.open = false
        var s = d.querySelector('summary')
        if (s) s.focus()
      })
      return
    }
    closeNav(true)
  })

  /* ──────────────────────────────────────────────── colour scheme */

  // The header's toggle overrides the system scheme; the choice is stored
  // under kc-theme and applied before first paint by an inline script in the
  // head. Screenshots pick their dark variant with a media query on <source>,
  // which cannot see data-theme, so a forced scheme rewrites those queries to
  // "all" or "not all" and back.
  var THEME_KEY = 'kc-theme'
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)')

  function isDark () {
    var t = document.documentElement.getAttribute('data-theme')
    return t ? t === 'dark' : systemDark.matches
  }

  function applyPictures () {
    var forced = document.documentElement.getAttribute('data-theme')
    $$('picture source').forEach(function (s) {
      var original = s.getAttribute('data-media') || s.getAttribute('media') || ''
      if (!/prefers-color-scheme/.test(original)) return
      if (!s.hasAttribute('data-media')) s.setAttribute('data-media', original)
      var wantsDark = /dark/.test(original)
      s.setAttribute('media', !forced ? original : (forced === 'dark') === wantsDark ? 'all' : 'not all')
    })
  }

  function setTheme (mode) {
    if (mode) document.documentElement.setAttribute('data-theme', mode)
    else document.documentElement.removeAttribute('data-theme')
    try { mode ? localStorage.setItem(THEME_KEY, mode) : localStorage.removeItem(THEME_KEY) } catch (e) { /* stays for this page */ }
    applyPictures()
  }

  $$('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () { setTheme(isDark() ? 'light' : 'dark') })
  })
  applyPictures()

  /* ──────────────────────────────────────────── admin screenshots */

  var tablist = $('.tabs')

  if (tablist) {
    var tabs = $$('[role="tab"]', tablist)

    // A lazy image inside a hidden panel has never been in the viewport, and
    // revealing its panel does not reliably start the load — the browser may
    // never register the intersection, and the reader gets a blank frame where
    // a screenshot should be. So reveal is the moment to ask for it directly.
    var promote = function (panel) {
      $$('img[loading="lazy"]', panel).forEach(function (img) { img.loading = 'eager' })
    }

    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab
        t.setAttribute('aria-selected', String(on))
        t.tabIndex = on ? 0 : -1
        var panel = document.getElementById(t.getAttribute('aria-controls'))
        if (!panel) return
        panel.hidden = !on
        if (on) promote(panel)
      })
      if (focus) tab.focus()
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { select(tab, false) })
    })

    // Arrow keys move between tabs, which is what a screen-reader user expects
    // of a tablist and what the roles we have already claimed promise.
    tablist.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement)
      if (i < 0) return
      var next =
        e.key === 'ArrowRight' ? (i + 1) % tabs.length :
        e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length :
        e.key === 'Home' ? 0 :
        e.key === 'End' ? tabs.length - 1 : -1
      if (next < 0) return
      e.preventDefault()
      select(tabs[next], true)
    })
  }

  /* ──────────────────────────────────────────────── copy buttons */

  var toast = $('#toast')
  var toastTimer

  function say (message) {
    if (!toast) return
    toast.textContent = message
    toast.classList.add('visible')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(function () { toast.classList.remove('visible') }, 2200)
  }

  $$('.copy').forEach(function (button) {
    button.addEventListener('click', function () {
      var target = document.getElementById(button.dataset.copy)
      if (!target) return
      var text = target.innerText.replace(/ /g, ' ')

      if (!navigator.clipboard) { say('Copying needs a secure connection'); return }
      navigator.clipboard.writeText(text).then(
        function () { say('Copied to your clipboard') },
        function () { say('Your browser blocked the copy') },
      )
    })
  })

  /* ─────────────────────────────────────── live repository numbers */

  // The numbers in the HTML are real, measured on the date printed beside them.
  // This refreshes them if GitHub answers, and leaves them alone if it does not
  // — an unauthenticated call is rate limited per address and will sometimes
  // fail, which must not turn an accurate page into a broken one.
  var REPOS = [
    { repo: 'itswadesh/gocommerce', fields: { 'go-stars': 'stargazers_count' } },
    { repo: 'itswadesh/svelte-commerce', fields: { 'sv-stars': 'stargazers_count', 'sv-forks': 'forks_count' } },
  ]

  var wanted = $$('[data-gh]')
  if (wanted.length && 'fetch' in window) {
    REPOS.forEach(function (entry) {
      fetch('https://api.github.com/repos/' + entry.repo, {
        headers: { Accept: 'application/vnd.github+json' },
      })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status) })
        .then(function (data) {
          Object.keys(entry.fields).forEach(function (key) {
            $$('[data-gh="' + key + '"]').forEach(function (el) {
              var value = data[entry.fields[key]]
              if (typeof value === 'number') el.textContent = value.toLocaleString('en')
            })
          })
        })
        .catch(function () { /* keep the measured values */ })
    })
  }

  /* ─────────────────────────────────────────── consent + analytics */

  // The IDs arrive from the build in window.KC_CONFIG. With none set this whole
  // block is inert: no banner, no request, no cookie. With any set, the banner
  // shows once and nothing is requested until "Accept analytics" is clicked.
  // The choice is the one thing stored, as {state, at}, under kc-consent.
  var cfg = window.KC_CONFIG || {}
  var configured = !!(cfg.ga4 || cfg.clarity || cfg.segment || cfg.reo)
  var CONSENT_KEY = 'kc-consent'

  function readConsent () {
    try {
      var v = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null')
      return v && (v.state === 'granted' || v.state === 'denied') ? v.state : null
    } catch (e) { return null }
  }

  function writeConsent (state) {
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ state: state, at: new Date().toISOString().slice(0, 10) })) } catch (e) { /* asked again next time; fine */ }
  }

  function loadScript (src, onload) {
    var s = document.createElement('script')
    s.async = true
    s.src = src
    if (onload) s.onload = onload
    document.head.appendChild(s)
  }

  // Each loaded tool registers a sink; track() fans out to whatever loaded.
  var sinks = []
  var loaded = false

  function loadAnalytics () {
    if (loaded || !configured) return
    loaded = true

    if (cfg.ga4) {
      window.dataLayer = window.dataLayer || []
      var gtag = function () { window.dataLayer.push(arguments) }
      window.gtag = gtag
      // Consent Mode v2: every storage type denied by default, and only
      // analytics_storage flips on the visitor's click. Ads never do.
      gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' })
      gtag('consent', 'update', { analytics_storage: 'granted' })
      gtag('js', new Date())
      gtag('config', cfg.ga4, { anonymize_ip: true })
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4))
      sinks.push(function (name, detail) { gtag('event', name, detail) })
    }

    if (cfg.clarity) {
      window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments) }
      loadScript('https://www.clarity.ms/tag/' + encodeURIComponent(cfg.clarity))
      window.clarity('consent')
      sinks.push(function (name) { window.clarity('event', name) })
    }

    if (cfg.segment) {
      // The official stub, reduced to what queues calls until the library lands.
      var a = window.analytics = window.analytics || []
      if (!a.initialize && !a.invoked) {
        a.invoked = true
        a.methods = ['track', 'page', 'identify', 'group', 'alias', 'ready', 'reset', 'on', 'once', 'off']
        a.factory = function (m) { return function () { var args = Array.prototype.slice.call(arguments); args.unshift(m); a.push(args); return a } }
        a.methods.forEach(function (m) { a[m] = a.factory(m) })
        a._writeKey = cfg.segment
        loadScript('https://cdn.segment.com/analytics.js/v1/' + encodeURIComponent(cfg.segment) + '/analytics.min.js')
        a.page()
      }
      sinks.push(function (name, detail) { window.analytics.track(name, detail) })
    }

    if (cfg.reo) {
      loadScript('https://static.reo.dev/' + encodeURIComponent(cfg.reo) + '/reo.js', function () {
        try { if (window.Reo) window.Reo.init({ clientID: cfg.reo }) } catch (e) { /* optional */ }
      })
    }
  }

  function track (name, detail) {
    if (!name || !sinks.length) return
    sinks.forEach(function (send) { try { send(name, detail || {}) } catch (e) { /* never break a click */ } })
  }

  var consent = $('#consent')
  var reopen = $('[data-consent="reopen"]')

  // The question waits until someone has been on the site for 20 seconds —
  // counted from the first page of the visit, so three pages of seven
  // seconds each count the same as one page of twenty-one. A visitor who
  // leaves sooner is never asked, and nothing loads for them either way.
  var ASK_AFTER = 20000
  var ARRIVED_KEY = 'kc-arrived'
  function askAfterDwell () {
    var now = Date.now()
    var arrived = now
    try {
      var s = parseInt(sessionStorage.getItem(ARRIVED_KEY), 10)
      if (s && s <= now) arrived = s
      else sessionStorage.setItem(ARRIVED_KEY, String(now))
    } catch (e) { /* storage blocked: count from this page */ }
    setTimeout(function () {
      if (!readConsent()) consent.hidden = false
    }, Math.max(0, ASK_AFTER - (now - arrived)))
  }

  if (consent) {
    var choice = readConsent()
    if (choice === 'granted') loadAnalytics()
    else if (!choice) askAfterDwell()
    if (reopen) reopen.hidden = false

    $$('button[data-consent]', consent).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var state = btn.dataset.consent
        writeConsent(state)
        consent.hidden = true
        if (state === 'granted') {
          loadAnalytics()
        } else if (loaded) {
          // Already running this page view; stop what can be stopped and say
          // plainly that the rest ends on the next page.
          if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' })
          say('Analytics off from your next page')
        }
      })
    })

    if (reopen) {
      reopen.addEventListener('click', function () {
        consent.hidden = false
        var b = consent.querySelector('button')
        if (b) b.focus()
      })
    }
  }

  /* ──────────────────────────────────────────── conversion events */

  // The events worth knowing: which project a visitor chose, whether they
  // copied the compose command, whether they went to GitHub, which question
  // they opened. Named once, in the markup, as data-ev.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-ev]') : null
    if (!el) return
    track(el.dataset.ev, { text: (el.textContent || '').trim().slice(0, 40) })
  })

  $$('.faq details').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) track('faq_expand', { q: (d.querySelector('summary') || {}).textContent }) })
  })

  /* ──────────────────────────────────────────────────────── motion */

  // Two moments, both carrying information, both once.
  //
  // The rule everything here follows: the finished state is what the HTML
  // already says. JS *arms* an element — hides what it is about to reveal —
  // and only then plays it. So with JS blocked, reduced motion on, or a
  // crawler reading, the page is complete and nothing is stuck at opacity 0.
  // Arming inside the observer also means an element scrolled past before the
  // script runs is simply never hidden.

  function playOnce (el, ms) {
    if (!el || reduced) return
    if (!('IntersectionObserver' in window)) return
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return
        io.disconnect()
        el.classList.add('is-armed')
        // One frame armed, so the browser has a start value to animate from.
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.classList.remove('is-armed')
            el.classList.add('is-running')
            setTimeout(function () { el.classList.remove('is-running') }, ms)
          })
        })
      })
    }, { threshold: 0.35 })
    io.observe(el)
  }

  // 1. The compose output arrives line by line — which is what the command
  //    does. Seven lines at 260ms, plus the caret.
  playOnce($('.term'), 7 * 260 + 6200)

  // 2. Coverage bars grow to their measured value. The motion is the
  //    measurement; it settles on the figure printed over it.
  playOnce($('.matrix'), 1200)

  /* ──────────────────────────────────────────────────── lightbox */

  // Screenshots open full size in a <dialog>, with previous and next. The
  // triggers are ordinary links to the image files, so with this script
  // blocked a click still shows the same picture. <dialog> supplies the
  // modal behaviour — focus containment, Escape, the backdrop — and this adds
  // only the arrows, the counter, and the choice of the dark capture when the
  // reader's scheme is dark.
  var shots = $$('a[data-gallery]')

  if (shots.length && 'HTMLDialogElement' in window) {
    var box = document.createElement('dialog')
    box.className = 'lightbox'
    box.setAttribute('aria-label', 'Screenshot, full size')
    box.innerHTML =
      '<figure class="lightbox-fig">' +
        '<img alt="" decoding="async">' +
        '<figcaption><b></b> <span></span></figcaption>' +
      '</figure>' +
      '<p class="lightbox-count"></p>' +
      '<button type="button" class="lightbox-btn lightbox-prev" aria-label="Previous screenshot">&#8249;</button>' +
      '<button type="button" class="lightbox-btn lightbox-next" aria-label="Next screenshot">&#8250;</button>' +
      '<button type="button" class="lightbox-btn lightbox-close" aria-label="Close">&#215;</button>'
    document.body.appendChild(box)

    var boxImg = box.querySelector('img')
    var boxTitle = box.querySelector('figcaption b')
    var boxCap = box.querySelector('figcaption span')
    var boxCount = box.querySelector('.lightbox-count')
    var current = -1

    function srcOf (a) { return isDark() && a.dataset.dark ? a.dataset.dark : a.getAttribute('href') }

    function preload (i) {
      var a = shots[(i + shots.length) % shots.length]
      var im = new Image()
      im.src = srcOf(a)
    }

    function show (i) {
      current = (i + shots.length) % shots.length
      var a = shots[current]
      var img = a.querySelector('img')
      boxImg.src = srcOf(a)
      boxImg.alt = img ? img.alt : ''
      boxTitle.textContent = a.dataset.title || ''
      boxCap.textContent = a.dataset.caption || ''
      boxCount.textContent = (current + 1) + ' / ' + shots.length
      preload(current + 1)
      preload(current - 1)
    }

    shots.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        // A modified click means "open in a new tab"; let the link do that.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return
        e.preventDefault()
        show(i)
        if (!box.open) box.showModal()
        box.querySelector('.lightbox-close').focus()
      })
    })

    box.querySelector('.lightbox-prev').addEventListener('click', function () { show(current - 1) })
    box.querySelector('.lightbox-next').addEventListener('click', function () { show(current + 1) })
    box.querySelector('.lightbox-close').addEventListener('click', function () { box.close() })

    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1) }
    })

    // A click on the backdrop — outside the figure and the buttons — closes.
    box.addEventListener('click', function (e) { if (e.target === box) box.close() })

    // Back to the picture you opened, which may not be the one you left on.
    box.addEventListener('close', function () {
      if (current >= 0) shots[current].focus()
      boxImg.removeAttribute('src')
    })
  }

  /* ─────────────────────────────────────────────── service worker */

  // The build ships a precaching worker with skipWaiting and clientsClaim, so
  // a new version installs, activates and takes over without a visit to the
  // tab. The one thing it cannot do is swap the page you are reading, so the
  // reload waits until the tab is hidden — nobody loses their place, and the
  // next look at the tab is the new version.
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () {
      var hadController = !!navigator.serviceWorker.controller
      var reloadWhenHidden = false

      navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function (reg) {
        // Ask for updates when the tab comes back, and hourly while it stays.
        document.addEventListener('visibilitychange', function () { if (!document.hidden) reg.update() })
        setInterval(function () { reg.update() }, 60 * 60 * 1000)
      }).catch(function () { /* the site works without it */ })

      navigator.serviceWorker.addEventListener('controllerchange', function () {
        // The first install takes control of a page that was served from the
        // network already; there is nothing newer to show.
        if (!hadController) { hadController = true; return }
        if (document.hidden) location.reload()
        else reloadWhenHidden = true
      })

      document.addEventListener('visibilitychange', function () {
        if (reloadWhenHidden && document.hidden) location.reload()
      })
    })
  }
})()
