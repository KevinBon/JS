var comboKeyWatcher = function(_window) {
  function public() {}
  
  let isWatching = false;
  let registered = new Map;
  let keysRegistered = new Map;
  
  function stopEventListener () {
    isWatching = false;
    _window.removeEventListener('keydown', onKeyDown);
    return this;
  }

  function initEventListener () {
    stopEventListener();
    isWatching = true;
    _window.addEventListener('keydown', onKeyDown); // Instead of keyup to handle combo key like: ctrl + a
    return this;
  }

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

  function onKeyDown(e) {
    let skippable = [];
    let keyCode = parseInt(e.keyCode, 10);
    if (!keysRegistered.has(keyCode)) { // None watcher have this key on watch
      return;
    } else {
      let alreadyHandled = {};
      keysRegistered.get(keyCode).forEach(elem => {
        // Right order?
        if (!(elem.refObj.name in alreadyHandled) && elem.position === elem.refObj.currentIndex) {
          if (elem.refObj.currentIndex === elem.refObj.maxIndex) { // Sequence finished
            elem.refObj.callback.call(result);
          } else {
            skippable.push(elem.refObj.name);
            elem.refObj.currentIndex +=1;
          }
          alreadyHandled[elem.refObj.name] = true;
        }
      });
    }
    resetAllCurrentIndex(skippable);
    return this;
  }

  function reformatKey (key) {
    if (typeof key === 'number') return key;
    key = String(key).toLowerCase();
    if (!(key in result.keys)) {
      throw Error(`Key ${key} not found. Take a look at the available keys with comboKeyWatcher.keys`);
    }
    return result.keys[key];
  }

  function reformatKeys (keys) {
    return keys.map(reformatKey);
  }
  
  function register (keys = [], name = null, callback = function() {}) {
    if (registered.has(name)) {
      throw new Error(`name ${name} already registered, pick another`);
    }
    if (!isWatching) {
      initEventListener();
    }

    keys = reformatKeys(keys);
    let refObj = {
      name,
      currentIndex: 0,
      maxIndex: keys.length - 1,
      keys,
      callback
    };
    registered.set(name, refObj);
    for (let [position, key] of keys.entries()) {
      if (!keysRegistered.has(key)) {
        keysRegistered.set(key, []);
      }
      let keyRegister = keysRegistered.get(key);
      keyRegister.push({ position, refObj });
      keysRegistered.set(key, keyRegister);
    }
    return this;
  }

  function unregister(name) {
    if (!registered.has(name)) return this;
    let target = registered.get(name);
    for (let key of target.keys) {
      if (!keysRegistered.has(key)) {
        continue;
      };
      let keysRegisteredTarget = keysRegistered.get(key);
      if (keysRegisteredTarget.length === 1) {
        keysRegistered.delete(key);
      } else {
        for (let [index, keysRegisteredTargetElement] of keysRegisteredTarget.entries()) {
          if (keysRegisteredTargetElement.refObj.name === name) {
            keysRegisteredTarget.splice(index, 1);
            break;
          }
        }
      }
    }
    registered.delete(name);
    if (registered.size === 0)
      stopEventListener();
    return this;
  }

  function getKeys() {
    // Based on: https://github.com/timoxley/keycode
    let codes = {
      'windows': 91,
      '⇧': 16,
      '⌥': 18,
      '⌃': 17,
      '⌘': 91,
      'control': 17,
      'ctl': 17,
      'ctrl': 17,
      'option': 18,
      'pause': 19,
      'break': 19,
      'caps': 20,
      'return': 13,
      'escape': 27,
      'esc': 27,
      'spc': 32,
      'insert': 45,
      'ins': 45,
      'delete': 46,
      'del': 46,
      'command': 91,
      'cmd': 91,
      'backspace': 8,
      'tab': 9,
      'enter': 13,
      'shift': 16,
      'alt': 18,
      'pause/break': 19,
      'caps lock': 20,
      'space': 32,
      'page up': 33,
      'pgup': 33,
      'page down': 34,
      'pgdn': 34,
      'end': 35,
      'home': 36,
      'left': 37,
      'up': 38,
      'right': 39,
      'down': 40,
      'left command': 91,
      'right command': 93,
      'numpad *': 106,
      'numpad +': 107,
      'numpad -': 109,
      'numpad .': 110,
      'numpad /': 111,
      'num lock': 144,
      'scroll lock': 145,
      'my computer': 182,
      'my calculator': 183,
      ';': 186,
      '=': 187,
      ',': 188,
      '-': 189,
      '.': 190,
      '/': 191,
      '`': 192,
      '[': 219,
      '\\': 220,
      ']': 221,
      '\'': 222
    };

    // lower case chars
    for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32
  
    // numbers
    for (var i = 48; i < 58; i++) codes[i - 48] = i
  
    // function keys
    for (i = 1; i < 13; i++) codes['f'+i] = i + 111
  
    // numpad keys
    for (i = 0; i < 10; i++) codes['numpad '+i] = i + 96
    
    return codes;
  }

  public.prototype.watch = function (keys = [], name = null, callback = function() {}) {
    register(keys, name, callback);
    return this;
  };
  public.prototype.stopWatch = function (name = null) {
    unregister(name);
    return this;
  };

  let result = new public;
  // Helper aliases
  result.keys = getKeys();
  return result;
}(window);

var konamiCode = [
  'Up',
  'Up',
  'Down',
  'Down',
  'Left',
  'Right',
  'Left',
  'Right',
  'B',
  'A',
];

comboKeyWatcher
  // KonamiCode
  .watch(konamiCode, 'konamiCode', function() {
    console.log('Time to implement something crazy!');
  })
  // With keyCode number
  .watch([17, 65], 'all', function() {
    console.log('all');
  })
  // With String (will only be triggered once)
  .watch(['Ctrl', 'a'], 'allText', function() {
    console.log('allText');
    this.stopWatch('allText');
  });
