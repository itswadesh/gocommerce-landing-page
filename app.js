/* Behaviour for the GoCommerce landing page.
 *
 * Everything here is progressive: the page is readable and complete with the
 * script blocked. The tabs fall back to the first screenshot, the copy buttons
 * simply do nothing, and the repository numbers stay at the values measured
 * when the page was built.
 */

(function () {
  'use strict'

  var $ = function (sel, root) { return (root || document).querySelector(sel) }
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)) }

  /* ───────────────────────────────────────────────── mobile nav */

  var menu = $('.menu')
  var links = $('#navlinks')

  function closeNav () {
    if (!menu || !links) return
    links.classList.remove('open')
    menu.setAttribute('aria-expanded', 'false')
  }

  if (menu && links) {
    menu.addEventListener('click', function () {
      var open = menu.getAttribute('aria-expanded') !== 'true'
      menu.setAttribute('aria-expanded', String(open))
      links.classList.toggle('open', open)
    })
    $$('#navlinks a').forEach(function (a) { a.addEventListener('click', closeNav) })
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav() })
  }

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
      var text = target.innerText.replace(/ /g, ' ')

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
            var el = $('[data-gh="' + key + '"]')
            var value = data[entry.fields[key]]
            if (el && typeof value === 'number') el.textContent = value.toLocaleString('en')
          })
        })
        .catch(function () { /* keep the measured values */ })
    })
  }

  /* ──────────────────────────────────────────── conversion events */

  // Shipped dark, per the audit playbook §117: with no analytics configured
  // this records nothing and requests nothing. It exists so that turning
  // analytics on later is one assignment rather than a hunt through the
  // markup for every CTA — and so the funnel is named in one place.
  //
  // The events are the ones worth knowing: which project a visitor chose,
  // whether they copied the compose command, whether they went to GitHub.
  var analytics = window.KC_ANALYTICS || null

  function track (name, detail) {
    if (!name) return
    if (!analytics || typeof analytics.track !== 'function') return
    try { analytics.track(name, detail || {}) } catch (e) { /* never break a click */ }
  }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-ev]') : null
    if (!el) return
    track(el.dataset.ev, { text: (el.textContent || "").trim().slice(0, 40) })
  })

  $$('.faq details').forEach(function (d) {
    d.addEventListener('toggle', function () { if (d.open) track('faq_expand', { q: (d.querySelector("summary") || {}).textContent }) })
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

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

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


  /* ─────────────────────────────────────────────── privacy notice */

  // Not a cookie banner, because there are no cookies to consent to. This site
  // sets none, keeps no analytics and has nothing to profile you with — so a
  // consent gate here would be asking permission for something that does not
  // happen, and an "accept" button that governs nothing is theatre.
  //
  // What is true and worth saying: three third parties see your IP address
  // because the page asks them for something. Google Fonts serves the two
  // typefaces, and api.github.com is asked for the live star counts. That is a
  // disclosure, not a decision, so the notice states it and gets out of the way.
  //
  // The dismissal is remembered in localStorage — the one thing the site does
  // store, and only because you closed this. It is strictly functional, which
  // is the one category consent rules have never required consent for, and the
  // notice says so rather than leaving you to assume it.
  var NOTICE_KEY = 'kc-privacy-notice-dismissed'

  function remembered (key) {
    // Private windows and blocked site data both throw here rather than
    // returning null, so every read and write is guarded. A storage failure
    // means the notice shows again, which is the harmless direction to fail in.
    try { return localStorage.getItem(key) } catch (e) { return null }
  }

  function remember (key, value) {
    try { localStorage.setItem(key, value) } catch (e) { /* shows again; fine */ }
  }

  function showPrivacyNotice () {
    if (remembered(NOTICE_KEY)) return

    var el = document.createElement('aside')
    el.className = 'notice'
    // A region rather than a dialog: it demands nothing, traps no focus and
    // blocks no content, so announcing it as a modal would misdescribe it.
    el.setAttribute('role', 'region')
    el.setAttribute('aria-label', 'Privacy notice')
    el.innerHTML =
      '<p class="notice-text">' +
        '<b>This site sets no cookies</b> and runs no analytics. ' +
        'Google Fonts serves the typefaces and GitHub serves the star counts, ' +
        'so those two see your IP address. Closing this remembers itself in ' +
        'local storage &mdash; the only thing stored, and only because you closed it.' +
      '</p>' +
      '<button class="notice-close" type="button">Got it</button>'

    var close = el.querySelector('.notice-close')
    close.addEventListener('click', function () {
      remember(NOTICE_KEY, '1')
      el.classList.remove('is-in')
      // Removed after the transition so it does not sit in the DOM invisible,
      // where a screen reader would still find it.
      setTimeout(function () { el.remove() }, 220)
    })

    document.body.appendChild(el)
    // Next frame, so the element has a resting state to animate from rather
    // than appearing already-arrived.
    requestAnimationFrame(function () { el.classList.add('is-in') })
  }

  showPrivacyNotice()
})()
