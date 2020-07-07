class Observer {
  constructor(data) {
    this.walk(data)
  }

  walk(data) {
    if(!data || typeof data !== 'object') {
      return 
    }

    Object.keys(data).forEach(key => { 
      this.defineReactive(data, key, data[key])
    })
  } 
  
  defineReactive(obj, key, val) {
    let that = this
    this.walk(val)
    const dep = new Dep()
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 不用obj[key]，为了防止无限递归

        // 收集依赖
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      set(newValue){
        if(newValue === val) {
          return
        }
        val = newValue
        that.walk(newValue)
        dep.notify()
        // notify()
      }
    })
  }
}
