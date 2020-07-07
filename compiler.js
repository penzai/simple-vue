class Compiler {
  constructor(vm) {
    this.el = vm.$el
    this.vm = vm
    this.compile(this.el)
  }

  // 编译模板
  compile(el) {
    let childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {
      if(this.isTextNode(node)) {
        this.compileText(node)
      } else if(this.isElementNode(node)) {
        this.compileElement(node)
      }

      if(node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }

  // 编译元素节点，处理指令
  compileElement(node) {
    const attrs = node.attributes
    Array.from(node.attributes).forEach(attr => {
      let attrName = attr.name
      if(this.isDirective(attrName)) {
        attrName = attrName.substr(2)
        let key = attr.value
        this.update(node, key, attrName)
      }
    })
  }

  update(node, key, attrName) {
    let updateFn = this[`${attrName}Updater`]
    updateFn && updateFn.call(this, node, this.vm[key], key)
  }

  textUpdater(node, value, key) {
    node.textContent = value
    new Watcher(this.vm, key, newValue => {
      node.textContent = newValue
    })
  }

  modelUpdater(node, value, key) {
    node.value = value
    new Watcher(this.vm, key, newValue => {
      node.value = newValue
    })
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }

  // 编译文本节点，处理差值表达式
  compileText(node) {
    let reg = /\{\{(.+?)\}\}/
    let value = node.textContent
    if(reg.test(value)) {
      let key = RegExp.$1.trim()
      node.textContent = value.replace(reg, this.vm[key])

      new Watcher(this.vm, key, val => {
        node.textContent = value.replace(reg, val)
      })
    }
  }

  // 判断元素属性是否是指令
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }

  // 判断节点是否是文本节点
  isTextNode(node) {
    return node.nodeType === 3
  }

  // 判断节点是否是元素节点
  isElementNode(node) {
    return node.nodeType === 1
  }
}