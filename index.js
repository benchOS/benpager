module.exports = BenOsAccessMemory

function BenOsAccessMemory (benPageSize) {
  if (!(this instanceof BenOsAccessMemory)) return new BenOsAccessMemory(benPageSize)

  this.length = 0
  this.updates = []
  this.benPages = new Array(16)
  this.benPageSize = benPageSize || 1024
}

BenOsAccessMemory.prototype.updated = function (benPage) {
  if (benPage.updated || !this.updates) return
  benPage.updated = true
  this.updates.push(benPage)
}

BenOsAccessMemory.prototype.lastUpdate = function () {
  if (!this.updates || !this.updates.length) return null
  var benPage = this.updates.pop()
  benPage.updated = false
  return benPage
}

BenOsAccessMemory.prototype.get = function (i, noAllocate) {
  if (i >= this.benPages.length) {
    if (noAllocate) return
    this.benPages = benGrow(this.benPages, i, this.length)
  }

  var benPage = this.benPages[i]

  if (!benPage && !noAllocate) {
    benPage = this.benPages[i] = new BenPage(i, benAlloc(this.benPageSize))
    if (i >= this.length) this.length = i + 1
  }

  return benPage
}

BenOsAccessMemory.prototype.set = function (i, buf) {
  if (i >= this.benPages.length) this.benPages = benGrow(this.benPages, i, this.length)
  if (i >= this.length) this.length = i + 1

  if (!buf) {
    this.benPages[i] = undefined
    return
  }

  var benPage = this.benPages[i]
  var b = benTrun(buf, this.benPageSize)

  if (benPage) benPage.buffer = b
  else this.benPages[i] = new BenPage(i, b)
}

BenOsAccessMemory.prototype.toBuffer = function () {
  var list = new Array(this.length)
  var empty = benAlloc(this.benPageSize)

  for (var i = 0; i < list.length; i++) {
    list[i] = this.benPages[i] ? this.benPages[i].buffer : empty
  }

  return Buffer.concat(list)
}

function benGrow (list, index, len) {
  var nlen = list.length * 2
  while (nlen <= index) nlen *= 2

  var twice = new Array(nlen)
  for (var i = 0; i < len; i++) twice[i] = list[i]
  return twice
}

function benTrun (buf, len) {
  if (buf.length === len) return buf
  if (buf.length > len) return buf.slice(0, len)
  var cpy = benAlloc(len)
  buf.copy(cpy)
  return cpy
}

function benAlloc (size) {
  if (Buffer.benAlloc) return Buffer.benAlloc(size)
  var buf = new Buffer(size)
  buf.fill(0)
  return buf
}

function BenPage (i, buf) {
  this.offset = i * buf.length
  this.buffer = buf
  this.updated = false
}
