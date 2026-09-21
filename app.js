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

    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab
        t.setAttribute('aria-selected', String(on))
        t.tabIndex = on ? 0 : -1
        var panel = document.getElementById(t.getAttribute('aria-controls'))
        if (panel) panel.hidden = !on
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
})()
