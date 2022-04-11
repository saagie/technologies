/**
 * Copyright 2013 Michael Hart (michael.hart.au@gmail.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
module.exports = function(size) {
    return new LruCache(size)
}

function LruCache(size) {
    this.capacity = size | 0
    this.map = Object.create(null)
    this.list = new DoublyLinkedList()
}

LruCache.prototype.get = function(key) {
    var node = this.map[key]
    if (node == null) return undefined
    this.used(node)
    return node.val
}

LruCache.prototype.set = function(key, val) {
    var node = this.map[key]
    if (node != null) {
        node.val = val
    } else {
        if (!this.capacity) this.prune()
        if (!this.capacity) return false
        node = new DoublyLinkedNode(key, val)
        this.map[key] = node
        this.capacity--
    }
    this.used(node)
    return true
}

LruCache.prototype.used = function(node) {
    this.list.moveToFront(node)
}

LruCache.prototype.prune = function() {
    var node = this.list.pop()
    if (node != null) {
        delete this.map[node.key]
        this.capacity++
    }
}


function DoublyLinkedList() {
    this.firstNode = null
    this.lastNode = null
}

DoublyLinkedList.prototype.moveToFront = function(node) {
    if (this.firstNode == node) return

    this.remove(node)

    if (this.firstNode == null) {
        this.firstNode = node
        this.lastNode = node
        node.prev = null
        node.next = null
    } else {
        node.prev = null
        node.next = this.firstNode
        node.next.prev = node
        this.firstNode = node
    }
}

DoublyLinkedList.prototype.pop = function() {
    var lastNode = this.lastNode
    if (lastNode != null) {
        this.remove(lastNode)
    }
    return lastNode
}

DoublyLinkedList.prototype.remove = function(node) {
    if (this.firstNode == node) {
        this.firstNode = node.next
    } else if (node.prev != null) {
        node.prev.next = node.next
    }
    if (this.lastNode == node) {
        this.lastNode = node.prev
    } else if (node.next != null) {
        node.next.prev = node.prev
    }
}


function DoublyLinkedNode(key, val) {
    this.key = key
    this.val = val
    this.prev = null
    this.next = null
}
