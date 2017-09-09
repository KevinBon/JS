### String Templating

#### Example

> ES5

```js
  var val = 14,
      str = 'result: ' + val;
  // str = "result: 14"
```

> ES6

```js
  var val = 14,
      str = `result: ${val}`;
  // str = "result: 14"
```

#### Cons 
##### Cross Scripting vulnerability

> Function needed

```js
// Inspired by SaferHTML function from https://hacks.mozilla.org/2015/05/es6-in-depth-template-strings-2/
var EscapeHTML = (_templateData, ..._vars) => {
      console.log(_templateData, _vars);
      var indexTpl = 0,
          retour = _templateData[indexTpl];

      for (var row of vars) {
        let str = String(row);

        // Escape special characters in the substitution.
        retour += str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

        // Don't escape special characters in the template.
        retour += _templateData[++indexTpl];
      }
      return retour;
    };
```
##### Unique Build

The assignement is done one time and will be typed as a string, and will never been re-rendered through times.

> Tests

```js
var test = 14,
    updatedValue = function() {
      return test; // Only running one time
};
// Same outputs with each one of those template
var str = `1 + 1 = ${(function() { return test; }())}`;
// var str = `1 + 1 = ${updatedValue())}`;
// var str = `1 + 1 = ${test}`;
console.log(test, str);        // 14  1 + 1 = 14
console.log(++test, str);      // 15  1 + 1 = 14
console.log(test++, str);      // 15  1 + 1 = 14
console.log(test, str);        // 16  1 + 1 = 14
```
The only way i found to use the String template as a variable is to use it as a function

> Solution 1 : Simple

```js
var templates = {
  catchy: (_one, _two, _three) => {
    return `${_one} and ${_two} will be ${_three}`;
  }
  // ...
};
templates.catchy('Youtube', 'Internet', 'Happy'); // Youtube and Internet will be Happy
templates.catchy('John', 'Johnny', 'JohnJohnny'); // John and Johnny will be JohnJohnny
````

> Solution 2 : Dynamic

```js
var templates = {
  rowStack: _name => {
     return ` and ${_name}`;
  },
  stackPersons: persons => {
      var retour = persons[0];
    
      for (var i = 1, len = persons.length; i < len; i++) {
        retour += templates.rowStack(persons[i]);
      }
      return retour;
  },
  catchy: (..._persons) => {
    return `${templates.stackPersons(_persons)} will be happy <3`;
  }
};
templates.catchy('Yorick', 'Stan', 'Paul', 'John'); // "Yorick and Stan and Paul and John will be happy <3"
```

