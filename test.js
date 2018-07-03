var tape = require('tape')
var BenPager = require('./')

tape('BenPager Tests: Get Page ', function (t) {
  var benPages = BenPager(1024)

  var benPage = benPages.get(0)

  t.same(benPage.offset, 0)
  t.same(benPage.buffer, Buffer.alloc(1024))
  t.end()
})

tape('BenPager Tests: Get Page Twice', function (t) {
  var benPages = BenPager(1024)
  t.same(benPages.length, 0)

  var benPage = benPages.get(0)

  t.same(benPage.offset, 0)
  t.same(benPage.buffer, Buffer.alloc(1024))
  t.same(benPages.length, 1)

  var other = benPages.get(0)

  t.same(other, benPage)
  t.end()
})

tape('BenPager Tests: Get Immutable Page', function (t) {
  var benPages = BenPager(1024)

  t.ok(!benPages.get(141, true))
  t.ok(benPages.get(141))
  t.ok(benPages.get(141, true))

  t.end()
})

tape('BenPager Tests: Get Far Out Page', function (t) {
  var benPages = BenPager(1024)

  var benPage = benPages.get(1000000)

  t.same(benPage.offset, 1000000 * 1024)
  t.same(benPage.buffer, Buffer.alloc(1024))
  t.same(benPages.length, 1000000 + 1)

  var other = benPages.get(1)

  t.same(other.offset, 1024)
  t.same(other.buffer, Buffer.alloc(1024))
  t.same(benPages.length, 1000000 + 1)
  t.ok(other !== benPage)

  t.end()
})

tape('BenPager Tests: Get Updates', function (t) {
  var benPages = BenPager(1024)

  t.same(benPages.lastUpdate(), null)

  var benPage = benPages.get(10)

  benPage.buffer[42] = 1
  benPages.updated(benPage)

  t.same(benPages.lastUpdate(), benPage)
  t.same(benPages.lastUpdate(), null)

  benPage.buffer[42] = 2
  benPages.updated(benPage)
  benPages.updated(benPage)

  t.same(benPages.lastUpdate(), benPage)
  t.same(benPages.lastUpdate(), null)

  t.end()
})
