var WReader = Em.Application.create({
  ready: function() {
    //On mobile devices, hide the address bar
    window.scrollTo(0);

    WReader.settingsController.loadSettings();
    WReader.GetItemsFromDataStore();
    WReader.GetItemsFromServer();

    // Call the superclass's `ready` method.
    this._super();
  }
});

WReader.GetItemsFromDataStore = function() {

};

WReader.GetItemsFromServer = function() {
  $.ajax({
    url: 'fake-data.js',
    dataType: 'json',
    success: function(data) {
      var items = data.map(function(obj) {
        var item = WReader.Item.create(obj);
        WReader.dataController.addItem(item);
      });
    },

    error: function() {

    }
  });
};

WReader.GetItemsFromServer();

WReader.Settings = Em.Object.extend({
  tabletControls: false
});

WReader.settingsController = WReader.Settings.create({
  loadSettings: function() {
    if (Modernizr.touch) {
      this.tabletControls = true;
    }
  },
  saveSettings: function() {

  }
});

WReader.Item = Em.Object.extend({
  read: false,
  starred: false,
  item_id: null,
  title: null,
  pub_name: null,
  pub_author: null,
  pub_date: new Date(0),
  short_desc: null,
  content: null,
  feed_link: null,
  item_link: null
});

WReader.itemsController = Em.ArrayController.create({
  content: [],

  filterBy: function(key, value) {
    this.set('content', WReader.dataController.filterProperty('read', true));
    //this.set('content', WReader.dataController.filterProperty(key, value));
  },

  itemCount: function() {
    return this.get('length');
  }.property('@each'),

  readCount: function() {
    return this.filterProperty('read', true).get('length');
  }.property('@each.read'),

  unreadCount: function() {
    return this.filterProperty('read', false).get('length');
  }.property('@each.read'),

  starredCount: function() {
    return this.filterProperty('starred', true).get('length');
  }.property('@each.starred')

});

WReader.dataController = Em.ArrayController.create({
  content: [],

  addItem: function(item) {
    var exists = this.filterProperty('item_id', item.item_id).length;
    if (!exists) {
      var length = this.get('length'), idx;
      idx = this.binarySearch(Date.parse(item.get('pub_date')), 0, length);
      this.insertAt(idx, item);
    }
  },

  // Binary search implementation that finds the index where a entry
  // should be inserted when sorting by date.
  binarySearch: function(value, low, high) {
    var mid, midValue;
    if (low === high) {
      return low;
    }
    mid = low + Math.floor((high - low) / 2);
    midValue = Date.parse(this.objectAt(mid).get('pub_date'));

    if (value < midValue) {
      return this.binarySearch(value, mid + 1, high);
    } else if (value > midValue) {
      return this.binarySearch(value, low, mid);
    }
    return mid;
  },

  itemCount: function() {
    return this.get('length');
  }.property('@each'),

  readCount: function() {
    return this.filterProperty('read', true).get('length');
  }.property('@each.read'),

  unreadCount: function() {
    return this.filterProperty('read', false).get('length');
  }.property('@each.read'),

  starredCount: function() {
    return this.filterProperty('starred', true).get('length');
  }.property('@each.starred'),

  markAllRead: function() {
    this.setEach('read', true);
  }
});

WReader.selectedItemController = Em.Object.create({
  selectedItem: null,
  select: function(item) {
    this.set('selectedItem', item);
    this.toggleRead(true);
    var url = location.origin + location.pathname + '';
    var item_url = "#" + item.get('item_id');
    history.pushState(item.get('item_id'), 'title', url + item_url);
  },

  toggleRead: function(read) {
    if (read === true) {
      this.selectedItem.set('read', true);
    } else if (read === false) {
      this.selectedItem.set('read', false);
    } else {
      var isRead = this.selectedItem.get('read');
      this.selectedItem.set('read', !isRead);
    }
  },

  toggleStar: function(star) {
    if (star === true) {
      this.selectedItem.set('star', true);
    } else if (star === false) {
      this.selectedItem.set('star', false);
    } else {
      var isStarred = this.selectedItem.get('starred');
      this.selectedItem.set('starred', !isStarred);
    }
  },

  next: function() {
    var currentIndex = WReader.itemsController.content.indexOf(this.get('selectedItem'));
    var nextItem = WReader.itemsController.content[currentIndex + 1];
    if (nextItem) {
      this.select(nextItem);
    }
  },

  prev: function() {
    var currentIndex = WReader.itemsController.content.indexOf(this.get('selectedItem'));
    var nextItem = WReader.itemsController.content[currentIndex - 1];
    if (nextItem) {
      this.select(nextItem);
    }
  },

  scrollAndNext: function() {
    console.log('scroll first');
    this.next();
  }
});

WReader.selectedItemController.addObserver('selectedItem', function() {
  //TODO: could change to use document.querySelector
  /*
  var curScrollPos = $('.entries').scrollTop();
  var itemTop = $('.entry.active').offset().top - 60;
  $(".entries").animate({"scrollTop": curScrollPos + itemTop}, 200);
  */

  $('.entries').animate({"scrollTop": 0}, 200);

  var curScrollPos = $('.summaries').scrollTop();
  var itemTop = $('.summary.active').offset().top - 60;
  $(".summaries").animate({"scrollTop": curScrollPos + itemTop}, 200);
});

WReader.SummaryListView = Em.View.extend({
  tagName: 'article',
  classNames: ['well', 'summary'],
  classNameBindings: ['active', 'read', 'prev', 'next'],
  /*contentBinding: 'WReader.itemsController.content',*/
  click: function(evt) {
    var content = this.get('content');
    WReader.selectedItemController.select(content);
  },
  touch: function(evt) {
    var content = this.get('content');
    WReader.selectedItemController.select(content);
  },
  active: function() {
    var selectedItem = WReader.selectedItemController.get('selectedItem');
    var content = this.get('content');
    if (content === selectedItem) {
      return true;
    }
  }.property('WReader.selectedItemController.selectedItem'),
  read: function() {
    var read = this.get('content').get('read');
    return read;
  }.property('WReader.TestController.@each.read'),
  formattedDate: function() {
    var date = this.get('content').get('pub_date');
    //return moment(date).format("MMMM Do YYYY, h:mm a");
    return moment(date).fromNow();
  }.property('WReader.selectedItemController.selectedItem')
});

WReader.EntryItemView = Em.View.extend({
  tagName: 'article',
  contentBinding: 'WReader.selectedItemController.selectedItem',
  classNames: ['well', 'entry'],
  classNameBindings: ['active', 'read', 'prev', 'next'],
  active: function() {
    return true;
  }.property('WReader.selectedItemController.selectedItem'),
  read: function() {
    var read = this.get('content').get('read');
    return read;
  }.property('WReader.itemsController.@each.read'),
  formattedDate: function() {
    var date = this.get('content').get('pub_date');
    var result = moment(date).format("MMMM Do YYYY, h:mm a");
    //result += " (" + moment(date).fromNow() + ")";
    return result;
  }.property('WReader.selectedItemController.selectedItem')
});

WReader.SettingsView = Em.View.extend({
  classNames: ['modal', 'fade']
});

WReader.UserView = Em.View.extend({
  classNames: ['modal', 'fade']
});

WReader.NavControlsView = Em.View.extend({
  tagName: 'section',
  classNames: ['controls'],
  classNameBindings: ['hide'],
  hide: function() {
    return !WReader.settingsController.tabletControls;
  }.property('WReader.settingsController.tabletControls'),
  navUp: function(event) {
    WReader.selectedItemController.prev();
  },
  navDown: function(event) {
    WReader.selectedItemController.next();
  },
  toggleStar: function(event) {
    WReader.selectedItemController.toggleStar();
  },
  toggleRead: function(event) {
    WReader.selectedItemController.toggleRead();
  },
  markAllRead: function(event) {
    WReader.itemsController.markAllRead();
  },
  updateFromServer: function(event) {
    console.log("NYI");
  },
  starClass: function() {
    var selectedItem = WReader.selectedItemController.get('selectedItem');
    if (selectedItem) {
      if (selectedItem.get('starred')) {
        return 'icon-star';
      }
    }
    return 'icon-star-empty';
  }.property('WReader.selectedItemController.selectedItem.starred'),
  readClass: function() {
    var selectedItem = WReader.selectedItemController.get('selectedItem');
    if (selectedItem) {
      if (selectedItem.get('read')) {
        return 'icon-ok-sign';
      }
    }
    return 'icon-ok-circle';
  }.property('WReader.selectedItemController.selectedItem.read'),
  buttonDisabled: function() {
    var selectedItem = WReader.selectedItemController.get('selectedItem');
    if (selectedItem) {
      return false;
    }
    return true;
  }.property('WReader.selectedItemController.selectedItem')
});

WReader.HandleSpaceKey = function() {
  var itemHeight = $('.entry.active').height() + 60;
  var winHeight = $(window).height();
  var curScroll = $('.entries').scrollTop();
  var scroll = curScroll + winHeight;
  if (scroll < itemHeight) {
    $('.entries').scrollTop(scroll);
  } else {
    WReader.selectedItemController.next();
  }
};

function handleBodyKeyDown(evt) {
  
  //console.log("X", evt.keyCode);

  switch (evt.keyCode) {
    case 34: // PgDn
    case 39: // right arrow
    case 40: // down arrow
    case 74: // j
      WReader.selectedItemController.next();
      break;

    case 32: // Space
      WReader.HandleSpaceKey();
      evt.preventDefault();
      break;

    case 33: // PgUp
    case 37: // left arrow
    case 38: // up arrow
    case 75: // k
      WReader.selectedItemController.prev();
      break;

    case 85: // U
      WReader.selectedItemController.toggleRead();
      break;

    case 72: // H
      WReader.selectedItemController.toggleStar();
      break;

    case 67: // C
      WReader.settingsController.set('tabletControls', !WReader.settingsController.tabletControls);
      break;
    }
}

function handlePopState(evt) {
  console.log("Pop State", evt);
}

document.addEventListener('keydown', handleBodyKeyDown, false);
window.addEventListener('popstate', handlePopState, false);


/*
 Helper test methods to add a couple of items to our list
*/
//var items = [];

  var names = ["Adam", "Bert", "Charlie", "Dave", "Ernie", "Frances",
    "Gary", "Isabelle", "John", "Kyle", "Lyla", "Matt", "Nancy", "Ophelia",
    "Peter", "Quentin", "Rachel", "Stan", "Tom", "Uma", "Veronica", "Wilson",
    "Xander", "Yehuda", "Zora"];
  var feeds = ["Engadget", "Gizmodo", "Memegen", "New York Times"];

  var lorem = "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed ";
  lorem += "do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ";
  lorem += "ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut ";
  lorem += "aliquip ex ea commodo consequat. Duis aute irure dolor in ";
  lorem += "reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla ";
  lorem += "pariatur. Excepteur sint occaecat cupidatat non proident, sunt in ";
  lorem += "culpa qui officia deserunt mollit anim id est laborum.</p>";
  lorem += lorem;
  lorem += lorem;
  lorem += lorem;

function addNewItems(num) {
  for (var i = 0; i < num; i++) {
    var item = {};
    item.item_id = i;
    item.pub_name = feeds[Math.floor(Math.random()*feeds.length)];
    item.pub_author = names[Math.floor(Math.random()*names.length)] + " " + names[Math.floor(Math.random()*names.length)];
    item.title = "Item Title " + i.toString();
    item.item_link = "http://url/" + i.toString();
    item.feed_link = "http://url/" + i.toString();
    item.content = "<p>" + item.title + "<p>" + lorem;
    item.short_desc = item.content.substr(0, 128) + "...";
    item.pub_date = new Date(1300000000000 + i * 86400000 + (86400000 * Math.random()));
    if (Math.random() > 0.5) {
      item.read = true;
    }
    if (Math.random() > 0.5) {
      item.starred = true;
    }
    //items.push(item);
    item = WReader.Item.create(item);
    WReader.itemsController.addItem(item);
  }
}

function addSingleNew() {
  var item = {};
  var i = 100;
  item.item_id = i;
  item.pub_name = feeds[Math.floor(Math.random()*feeds.length)];
  item.pub_author = names[Math.floor(Math.random()*names.length)] + " " + names[Math.floor(Math.random()*names.length)];
  item.title = "Item Title " + i.toString();
  item.item_link = "http://url/" + i.toString();
  item.feed_link = "http://url/" + i.toString();
  item.content = "<p>" + item.title + "<p>" + lorem;
  item.short_desc = item.content.substr(0, 128) + "...";
  item.pub_date = new Date(1100000000000 + i * 86400000 + (86400000 * Math.random()));
  item.read = false;
  item = WReader.Item.create(item);
  WReader.itemsController.addItem(item);
}


