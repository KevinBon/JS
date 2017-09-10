
const konamiCode = [
  '38', // Up
  '38', // Up
  '40', // Down
  '40', // Down
  '37', // Left
  '39', // Right
  '37', // Left
  '39', // Right
  '66', // B
  '65', // A
  // '13', // Enter
];

var comboKeyWatched = function(_window) {
  function public()
  
  let isWatching = false;
  let registered = new Map;
  let keysRegistered = new Map;

  function resetAllCurrentIndex(skips = []) {
    const skippedHash = skips.reduce((memo, name) => {
      memo[name] = true;
      return memo;
    }, {});
    for (let [key, value] of registered) {
      if (value.name in skippedHash) continue;
      value.currentIndex = 0;
    }
    return this;
  }

  function onKeyUp(e) {
    let skippable = [];

    if (!e.keyCode in keysRegistered) {
      return;
    } else {
      keysRegistered[e.keyCode].forEach(elem => {
        elem.refObj.currentIndex +=1;
        // Right order
        if (elem.index === elem.refObj.currentIndex) {
          if (elem.refObj.currentIndex && elem.refObj.maxIndex) {
            elem.refObj.callback();
          } else {
            skippable.push(elem.refObj.name);
          }
        }
      });
    }
    resetAllCurrentIndex(skippable);
    return this;
  }

  initEventListener = () => {
    isWatching = true;
    window.addEventListener('keyup', onKeyUp);
    return this;
  }

  register = (keys = [], name = null, callback = function() {}) => {
    if (!isWatching) {
      initEventListener();
    }
    // TODO: Make it compatible with no name or non unique
    // if (name == null) {
      
    // }
    let refObj = {
      _uid: name,
      name,
      currentIndex: 0,
      maxIndex: keys.length,
      keys,
      callback
    };
    registered.set(name, refObj);
    for (let [index, key] of keys.entries()) {
      if (!keysRegistered.has(key)) {
        keysRegistered.set(key, []);
      }
      keysRegistered.set(key, keysRegistered.get(key).push({
        index,
        refObj
      }));
    }
    return this;
  }

  public.prototype.watch = (keys = [], name = null, callback = function() {}) => {
    register(keys, callback);
    return this;
  };
  public.prototype.stopWatch = (name = null) => {
    return this;
  };

  return new public;
}(window);