var WReader = Em.Application.create();

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

WReader.itemsController = Em.ArrayProxy.create({
  content: [],

  addItem: function(item) {
    this.pushObject(item);
  },

  read: function() {
    return this.filterProperty('read', true);
  }.property('@each.read'),

  readCount: function() {
    return this.filterProperty('read', true).get('length');
  }.property('@each.read'),

  unreadCount: function() {
    return this.filterProperty('read', false).get('length');
  }.property('@each.read'),

  starredCount: function() {
    return this.filterProperty('starred', true).get('length');
  }.property('@each.starred'),
  
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
  }
});

WReader.selectedItemController.addObserver('selectedItem', function() {
  //TODO: could change to use document.querySelector
  var curScrollPos = $('.entries').scrollTop();
  var itemTop = $('.entry.active').offset().top - 60;
  $(".entries").animate({"scrollTop": curScrollPos + itemTop}, 200);

  curScrollPos = $('.summaries').scrollTop();
  itemTop = $('.summary.active').offset().top - 60;
  $(".summaries").animate({"scrollTop": curScrollPos + itemTop}, 200);
});

WReader.SummaryListView = Em.View.extend({
  tagName: 'article',
  classNames: ['well', 'summary'],
  classNameBindings: ['active', 'read', 'prev', 'next'],
  click: function(evt) {
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
  }.property('WReader.itemsController.@each.read'),
  formattedDate: function() {
    var date = this.get('content').get('pub_date');
    return moment(date).format("MMMM Do YYYY, h:mm a");
  }.property('WReader.selectedItemController.selectedItem')
});

WReader.EntryListView = Em.View.extend({
  tagName: 'article',
  classNames: ['well', 'entry'],
  classNameBindings: ['active', 'read', 'prev', 'next'],
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
  }.property('WReader.itemsController.@each.read'),
  formattedDate: function() {
    var date = this.get('content').get('pub_date');
    var result = moment(date).format("MMMM Do YYYY, h:mm a");
    result += " (" + moment(date).fromNow() + ")";
    return result;
  }.property('WReader.selectedItemController.selectedItem')
});

WReader.EntryItemView = Em.View.extend({
  tagName: 'article',
  classNames: ['well', 'entry'],
  classNameBindings: ['active', 'read', 'prev', 'next'],
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
  }.property('WReader.itemsController.@each.read'),
  formattedDate: function() {
    var date = this.get('content').get('pub_date');
    var result = moment(date).format("MMMM Do YYYY, h:mm a");
    result += " (" + moment(date).fromNow() + ")";
    return result;
  }.property('WReader.selectedItemController.selectedItem')
});

WReader.NavControlsView = Em.View.extend({
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

function handleBodyKeyDown(evt) {
  switch (evt.keyCode) {
    case 34: // PgDn
    case 39: // right arrow
    case 40: // down arrow
    case 74: // j
      WReader.selectedItemController.next();
      break;

    case 33: // PgUp
    case 37: // left arrow
    case 38: // up arrow
    case 75: // k
      WReader.selectedItemController.prev();
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
for (var i = 0; i < 101; i++) {
  var item = WReader.Item.create({ item_id: 1, title: 'Item A',
    pub_name: 'Feed', pub_author: 'Author', pub_date: new Date(1000000000000),
    short_desc: 'Short Desc', content: 'Lorem Ipsum, yah it\'s all that!',
    feed_link: 'http://google.com/', item_link: 'http://google.com/'});
  item.item_id = i;
  item.title += " " + i.toString();
  item.item_link += i.toString();
  item.pub_date = new Date(1300000000000 + i * 86400000 + (86400000 * Math.random()));
  if (Math.random() > 0.5) {
    item.read = true;
  }
  if (Math.random() > 0.5) {
    item.starred = true;
  }
  WReader.itemsController.addItem(item);
}
