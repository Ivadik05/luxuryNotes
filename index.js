/**
 * @constructor
 */
appStorage = function(storageKey) {

  /**
   * @type {string}
   */
  this.__storageKey = storageKey;
};


/**
 * @param {!Object} payload
 */
appStorage.prototype.saveStorage = function(payload) {
  localStorage.setItem(this.__storageKey, JSON.stringify(payload));
};


/**
 * @return {Array}
 */
appStorage.prototype.restoreData = function() {
  var data = localStorage.getItem(this.__storageKey);
  if (data) {
    return JSON.parse(data)
  }
  return [];
};


/**
 */
appStorage.prototype.removeData = function() {
  localStorage.removeItem(this.__storageKey);
};


/**
 */
appStorage.prototype.listenerStorage = function(callback) {
  var self = this;
  window.addEventListener('storage', handleStorage, false);
  function handleStorage(event) {
    if (event.key === self.__storageKey) {
      callback(event);
    }
  }
};



/**
 * @constructor
 */
Notes = function() {
  this.__pageForm = {
    'name': document.querySelector('#note_name') || null,
    'text': document.querySelector('#note_text') || null,
    'saveBtn': document.querySelector('#note_save') || null,
    'deleteAllBtn': document.querySelector('#note_delete_all') || null,
    'notesWrap': document.querySelector('.notes_ul') || null,
    'noteSearch': document.querySelector('#note_search') || null
  };

  this.__storage = new appStorage('note-item');

  /**
   * @type {Array}
   */
  this.__notesList = this.__storage.restoreData() || [];


  this.__init();
  this.__handlers(this.__pageForm);
};

Notes.prototype.__init = function() {
  this.__drawNotes(this.__notesList, this.__pageForm.notesWrap);
};


/**
 * @param {!Object} form
 */
Notes.prototype.__handlers = function(form) {
  var self = this;
  function handleSaveBtn() {
    var ID = self.__generateID();
    var noteName = form.name.value;
    var noteText = form.text.value;
    if (noteName === '') {
      form.name.focus();
    } else if (noteText === '') {
      form.text.focus();
    } else {
      var newNote = {
        id: ID,
        'name': noteName,
        'text': noteText
      };
      self.__addNote(self.__notesList, newNote);
      self.__storage.saveStorage(self.__notesList);
      form.notesWrap.appendChild(self.__createNodeItem(newNote));
      form.name.value = '';
      form.text.value = '';
    }
  }

  function handleDeleteAllBtn() {
    self.__clearNotes(form.notesWrap);
    self.__notesList = [];
    self.__storage.removeData();
  }

  function handleStorage() {
    self.__notesList = self.__updateNoteList();
    self.__drawNotes(self.__notesList, form.notesWrap);
  }

  function handleDeleteBtn(event) {
    var id = event.target.parentNode.id;
    self.__notesList = self.__deleteNote(self.__notesList, id);
    self.__storage.saveStorage(self.__notesList);
    form.notesWrap.removeChild(event.target.parentNode);
  }

  function handleEditBtn(event) {
    var note = event.target.parentNode;
    var name = note.querySelector('.notes_item_name');
    var text = note.querySelector('.notes_item_text');

    event.target.classList.add('active');
    if (!note.querySelector('#notes_item_name')) {
      note.insertBefore(self.__createNode('input', {
        'id' : 'notes_item_name',
        'type' : 'text',
        'value' : name.innerText
      }), name);
    }

    if (!note.querySelector('#notes_item_text')) {
      note.insertBefore(self.__createNode('textarea', {
        'id' : 'notes_item_text',
        'type' : 'text',
        'value' : text.innerText
      }), text);
    }

    self.__hideNode(name);
    self.__hideNode(text);
  }

  function handleApplyEditBtn(event) {
    var id = event.target.parentNode.id;
    var note = event.target.parentNode;
    var name = note.querySelector('.notes_item_name');
    var text = note.querySelector('.notes_item_text');
    var nameInput = note.querySelector('#notes_item_name');
    var textInput = note.querySelector('#notes_item_text');
    var nameValue = nameInput.value;
    var textValue = textInput.value;

    event.target.classList.remove('active');
    if (nameInput) {
      name.innerText = nameValue;
      note.removeChild(nameInput);
      self.__showNode(name);
    }
    if (textInput) {
      text.innerText = textValue;
      note.removeChild(textInput);
      self.__showNode(text);
    }
    var newNote = {
      id: id,
      'name': nameValue,
      'text': textValue
    };
    self.__notesList = self.__editNote(self.__notesList, id, newNote);
    self.__storage.saveStorage(self.__notesList);
  }

  function handleSearch() {
    var noteName = form.noteSearch;
    self.__drawNotes(self.__findNotes(self.__notesList, noteName.value), self.__pageForm.notesWrap);
  }

  if (form.saveBtn) {
    form.saveBtn.addEventListener('click', handleSaveBtn);
  }

  if (form.deleteAllBtn) {
    form.deleteAllBtn.addEventListener('click', handleDeleteAllBtn);
  }

  if (form.noteSearch) {
    form.noteSearch.addEventListener('keyup', handleSearch);
  }

  document.querySelector('body').addEventListener('click', function(event) {
    if (event.target.id === 'note_delete' && event.target.parentNode) {
      handleDeleteBtn(event);
    }
    if (event.target.id === 'note_edit' && event.target.parentNode) {
      if (event.target.className.indexOf('active') === -1) {
        handleEditBtn(event);
      } else {
        handleApplyEditBtn(event);
      }
    }
  });

  this.__storage.listenerStorage(handleStorage);
};


/**
 */
Notes.prototype.__hideNode = function(node) {
  node.style.display = 'none';
};


/**
 */
Notes.prototype.__showNode = function(node) {
  node.style.display = 'block';
};


/**
 */
Notes.prototype.__updateNoteList = function() {
  return this.__restoreData(this.__STORAGE_KEY);
};


/**
 * @param {!Array} list
 * @param {!Node} notesWrap
 */
Notes.prototype.__drawNotes = function(list, notesWrap) {
  var self = this;
  self.__clearNotes(notesWrap);
  list.forEach(function(el) {
    notesWrap.appendChild(self.__createNodeItem(el));
  });
};


/**
 * @param {!Node} notesWrap
 */
Notes.prototype.__clearNotes = function(notesWrap) {
  notesWrap.innerHTML = '';
};


/**
 * @param {!Object} itemParam
 */
Notes.prototype.__createNodeItem = function(itemParam) {
  var self = this;
  var nodeArray = [
    {
      'tagName': 'li',
      'prop': {
        'className': 'notes_item',
        'id': itemParam.id
      },
      children: [
        {
          'tagName': 'div',
          'prop': {
            'className': 'notes_item_name',
            'innerHTML': itemParam.name
          }
        },
        {
          'tagName': 'hr',
          'prop': {
            'className': 'separat'
          }
        },
        {
          'tagName': 'div',
          'prop': {
            'className': 'notes_item_text',
            'innerHTML': itemParam.text
          }
        },
        {
          'tagName': 'button',
          'prop': {
            'className': 'icon-trash notes_btn btn_delete',
            'id': 'note_delete'
          }
        },
        {
          'tagName': 'button',
          'prop': {
            'className': 'icon-pencil notes_btn btn_edit',
            'id': 'note_edit'
          }
        }
      ]
    }
  ];

  var item = self.__createNode(nodeArray['tagName'], nodeArray['prop']);
  if (nodeArray['children'].length) {
    nodeArray['children'].forEach(function(child) {
      item.appendChild(self.__createNode(child['tagName'], child['prop']));
    })
  }
  return item;
};


/**
 * @param {!String} tag
 * @param {!Object} params
 * @returns {!Node}
 */
Notes.prototype.__createNode = function(tag, params) {
  var node = document.createElement(tag);
  Object.keys(params).forEach(function(item) {
    node[item] = params[item];
  });
  return node;
};


/**
 *
 * @param {!Array} list
 * @param {!Object} item
 */
Notes.prototype.__addNote = function(list, item) {
  list.push(item);
};


/**
 *
 * @param {!Array} list
 * @param {!string} id
 */
Notes.prototype.__editNote = function(list, id, item) {
  return list.map(function(element) {
    return element.id === id ? element = item : element
  })
};


/**
 * @param {!Array} list
 * @param {!string} id
 */
Notes.prototype.__deleteNote = function(list, id) {
  return list.filter(function(element) {
    return element.id !== id
  })
};


/**
 * @param {!Array} list
 * @param {!string} findText
 */
Notes.prototype.__findNotes = function(list, findText) {
  return list.filter(function(element) {
    return element.name.toLocaleLowerCase()
            .indexOf(findText.toLocaleLowerCase()) !== -1 ||
        element.text.toLocaleLowerCase()
            .indexOf(findText.toLocaleLowerCase()) !== -1
  })
};


/**
 * @return {string}
 */
Notes.prototype.__generateID = function() {
  return '' + Math.random().toString(36).substr(2, 9) + '';
};


new Notes();
