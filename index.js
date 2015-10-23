/**
 * @constructor
 */
Notes = function() {
  /**
   * @type {string}
   */
  this.__STORAGE_KEY = 'note-item';

  this.__pageForm = {
    'name': document.querySelector('#note_name') || null,
    'text': document.querySelector('#note_text') || null,
    'saveBtn': document.querySelector('#note_save') || null,
    'deleteAllBtn': document.querySelector('#note_delete_all') || null,
    'notesWrap': document.querySelector('.notes_ul') || null,
    'noteSearch': document.querySelector('#note_search') || null
  };


  /**
   * @type {Array}
   */
  this.__notesList = this.__restoreData(this.__STORAGE_KEY) || [];


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
      self.__saveStorage(self.__STORAGE_KEY, self.__notesList);
      form.notesWrap.appendChild(self.__createNodeItem(newNote));
      form.name.value = '';
      form.text.value = '';
    }
  }

  function handleDeleteAllBtn() {
    self.__clearNotes(form.notesWrap);
    self.__notesList = [];
    self.__removeData(self.__STORAGE_KEY);
  }

  function handleStorage(event) {
    if (event.key === self.__STORAGE_KEY) {
      self.__notesList = self.__updateNoteList();
      self.__drawNotes(self.__notesList, form.notesWrap);
    }
  }

  function handleDeleteBtn(event) {
    var id = event.target.parentNode.id;
    self.__notesList = self.__deleteNote(self.__notesList, id);
    self.__saveStorage(self.__STORAGE_KEY, self.__notesList);
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
    self.__saveStorage(self.__STORAGE_KEY, self.__notesList);
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

  window.addEventListener('storage', handleStorage, false);
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
  var item = document.createElement('li');
  item.className = 'notes_item';
  item.setAttribute('id', itemParam.id);
  item.innerHTML = '' +
      '<div class="notes_item_name">' + itemParam.name + '</div>' +
      '<hr class="separat">' +
      '<div class="notes_item_text">' + itemParam.text + '</div>' +
      '<button class="icon-trash notes_btn btn_delete" id="note_delete"></button>' +
      '<button class="icon-pencil notes_btn btn_edit" id="note_edit"></button>';
  return item;
};


/**
 * @param {!String} tag
 * @param {!Object} params
 * @returns {!Node}
 */
Notes.prototype.__createNode = function(tag, params) {
  var node = document.createElement(tag);
  node.className = params.class || '';
  node.id = params.id;
  node.innerHTML = params.html || '';
  node.type = params.type || '';
  node.name = params.name || '';
  node.value = params.value || '';
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


/**
 * @param {!string} key
 * @param {!Object} payload
 */
Notes.prototype.__saveStorage = function(key, payload) {
  localStorage.setItem(key, JSON.stringify(payload));
};


/**
 * @param {!string} key
 * @return {Array}
 */
Notes.prototype.__restoreData = function(key) {
  var data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data)
  }
  return [];
};


/**
 * @param {!string} key
 */
Notes.prototype.__removeData = function(key) {
  localStorage.removeItem(key);
};

new Notes();
