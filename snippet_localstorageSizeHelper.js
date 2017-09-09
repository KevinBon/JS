
var localStorageSizeHelper = function() {
  function public() {}
  
  public.prototype.getSizeLeft = function getSizeUsed({ maxSize = 10000, chunk = 200, key = 'bombUpTest'} = {}) {
    function gen(n) {
      return new Array((n * 1024) + 1).join('a')
    }
    
    if (key in localStorage) {
      throw Error(`key '${key}' already in use. Please set one manually like, getSizeLeft({ key: 'anotherKey' })`);
    }
     
    var i = 0;
    try {
      for (i = 0; i <= maxSize; i += chunk) {
        localStorage.setItem(key, gen(i));
      }
    } catch (e) {
      localStorage.removeItem(key);
      return `${i} kb`;
    }
  };

  public.prototype.getSizeUsed = function getSizeUsed() {
    let result = {
      total: 0,
      byKeys: {}
    };
  
    let currLen = 0;
    for (key in localStorage) {
      if (!localStorage.hasOwnProperty(key)) { continue; }
      currLen = JSON.stringify(localStorage[key]).length;
      result.total += currLen;
      result.byKeys[key] = currLen;
    }
    return result;
  };

  return new public;
}();
localStorageSizeHelper.getSizeUsed();
localStorageSizeHelper.getSizeLeft();