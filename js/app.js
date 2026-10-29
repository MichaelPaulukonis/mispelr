// mispelr playground: wires the page to the esbuild bundle (global `mispelr`)
;(function () {
  var input = document.getElementById('input')
  var output = document.getElementById('output')
  var chance = document.getElementById('chance')
  var chanceOut = document.getElementById('chance-out')
  var roMethod = document.getElementById('ro-method')
  var roChance = document.getElementById('ro-chance')
  var roChanged = document.getElementById('ro-changed')

  document.getElementById('version').textContent = mispelr.version

  // mulberry32: a fresh rng per render from one seed, so moving the slider
  // replays the same misspellings and only adds or drops words
  var seeded = function (a) {
    return function () {
      a = (a + 0x6d2b79f5) | 0
      var t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }
  var seed = 0
  var reseed = function () {
    seed = (Math.random() * 4294967296) >>> 0
  }

  var checked = function () {
    return document.querySelector('input[name=spelltype]:checked')
  }

  var esc = function (s) {
    return s.replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]
    })
  }

  var readout = function (changed, total) {
    roMethod.textContent = checked().nextElementSibling.textContent
    roChance.textContent = chance.value + '%'
    roChanged.textContent =
      changed === null
        ? '? of ' + total + ' words'
        : changed + ' of ' + total + ' words (' + Math.round((100 * changed) / total) + '%)'
  }

  // Mark changed words when the word count survives respelling
  // (homophilia can split or join words; then the count reads '?')
  var render = function (src, out) {
    var a = src.split(/(\s+)/)
    var b = out.split(/(\s+)/)
    var total = src.split(/\s+/).filter(Boolean).length
    if (a.length !== b.length) {
      output.textContent = out
      readout(null, total)
      return
    }
    var changed = 0
    output.innerHTML = b
      .map(function (t, i) {
        if (t !== a[i] && /\S/.test(t)) {
          changed++
          return '<mark>' + esc(t) + '</mark>'
        }
        return esc(t)
      })
      .join('')
    readout(changed, total)
  }

  var draw = function () {
    var text = input.value.trim()
    if (!text) return
    render(
      text,
      mispelr.respell(text, checked().value, {
        rng: seeded(seed),
        chance: chance.value / 100
      })
    )
  }

  var run = function () {
    reseed()
    draw()
  }

  document.getElementById('respell').addEventListener('click', run)
  document.querySelectorAll('input[name=spelltype]').forEach(function (r) {
    r.addEventListener('change', run)
  })
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run()
  })
  chance.addEventListener('input', function () {
    chanceOut.textContent = chance.value + '%'
    draw()
  })

  // Easter egg: the title respells itself on click
  var title = document.querySelector('[data-respell]')
  title.addEventListener('click', function () {
    title.textContent = mispelr.respell(title.dataset.respell, 'random')
  })

  run()
})()
