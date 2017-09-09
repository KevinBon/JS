var format = {
  escapeHTML: (_templateData, ..._vars) => {
      var indexTpl = 0,
          retour = _templateData[indexTpl];

      for (var row of _vars) {
        var str = String(row);

        // Escape special characters in the substitution.
        retour += str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

        // Don't escape special characters in the template.
        retour += _templateData[++indexTpl];
      }
      return retour;
    },

  dummyFormat: _date => {
    if (Object.prototype.toString.call(_date) !== '[object Date]') {
      throw new Error('Nop, we need a date');
    }

    var forceDateFormat2Digit = _int => {
     return _int < 10 ? '0' + _int : _int;
    };

    return forceDateFormat2Digit(_date.getHours()) + ':' + forceDateFormat2Digit(_date.getMinutes());
  }
};

var objComment = new function() {
  // -- Model
  var model = new function () {

    var data = {
      comments: []
    };

    var checkComment = _comment => {
        return _comment.content !== '';
    };

    return {
      add: _comment => {
          return new Promise((_resolve, _reject) => {
            if (checkComment(_comment)) {
                data.comments.push(_comment);
                _resolve(`ajout du commentaire ${_comment._id} dans le model`);
            }
            _reject(Error(`Structure du commentaire ${_comment._id} invalide`));
          });
      },
      getAll: () => {
        return data.comments;
      }
    };
  };

  // -- View
  var view = new function () {

    var tpl = {
      row: _msg => { return format.escapeHTML`<div>
          <span>${_msg.author} (${format.dummyFormat(_msg.date)}):</span>
          <p>${_msg.content}</p>
      </div>` }
    };

    var elems = {
      $container: $('#commentContainer')
    };

    return {
      add: (_comment) => {
          return new Promise((_resolve, _reject) => {
              // console.log('view', tpl.row(_comment));
              elems.$container.append(tpl.row(_comment));
              console.log('view', 'ajout du commentaire dans la vue');
              _resolve(`ajout du commentaire ${_comment._id} dans la vue`);
          });
      }
    };
  };

   // -- Controler
   // ---- Private
   var add = _comment => {

      return new Promise((_resolve, _reject) => {

        model.add(_comment)
            .then(view.add(_comment), err => {
                console.log('erreur model', err);
            })
            .then((_res) => {
               console.log('Fini', _comment._id);
               _resolve(_res);
            })
            .catch(err => {
                _reject(err);
            });
      });
  };

  // ---- Public
  var controler = {
    add: _comment => {

      if (!Array.isArray(_comment)) {
        add(_comment);
      } else {

        Promise.all(_comment.map(add))
          .then( res => {
            console.log('<3', res);
          })
          .catch(err => {
            console.log('nop', err);
          });
      }
      return this;
    },
    getAll: () => {
      return model.getAll();
    }
  };
  return controler;
};

var lala = {
  _id: 0,
  author: 'Dummy',
  date: new Date(),
  content: '<a onmouseenter="alert(\'XSS\');">Lorem ipsum...</a>'
};

var lalas = [{
    _id: 0,
    author: 'Dummy1',
    date: new Date(),
    content: '<a onmouseenter="alert(\'XSS\');">Lorem ipsum...</a>'
  },
  {
    _id: 1,
    author: 'Dummy2',
    date: new Date(),
    content: '<a onmouseenter="alert(\'XSS\');">Lorem ipsum...</a>'
  },
  {
    _id: 2,
    author: 'Dummy3',
    date: new Date(),
    content: '<a onmouseenter="alert(\'XSS\');">Lorem ipsum...</a>'
  }
];

objComment.add(lalas);
objComment.add(lala);
// objComment.add(lala);
