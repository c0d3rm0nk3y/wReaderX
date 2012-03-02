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
  
  select: function(item) {
    item.set('read', true);
    this.set('selectedItem', item);
    var url = location.origin + location.pathname + '';
    var item_url = "#" + item.get('item_id');
    history.pushState(item.get('item_id'), 'title', url + item_url);
  },
  selectedItem: null,

  next: function() {
    var currentIndex = this.content.indexOf(this.get('selectedItem'));
    var nextItem = this.content[currentIndex + 1];
    if (nextItem) {
      this.select(nextItem);
    }
  },

  prev: function() {
    var currentIndex = this.content.indexOf(this.get('selectedItem'));
    var nextItem = this.content[currentIndex - 1];
    if (nextItem) {
      this.select(nextItem);
    }
  }
});

WReader.SummaryListView = Em.View.extend({
  classNames: ['well', 'summary'],
  classNameBindings: ['active', 'read', 'prev', 'next'],
  click: function(evt) {
    var content = this.get('content');
    WReader.itemsController.select(content);
  },
  active: function() {
    var selectedItem = WReader.itemsController.get('selectedItem');
    var content = this.get('content');
    if (content === selectedItem) {
      return true;
    }
  }.property('WReader.itemsController.selectedItem'),
  read: function() {
    var read = this.get('content').get('read');
    return read;
  }.property('WReader.itemsController.@each.read'),
  formattedDate: function() {
    var date = this.get('content').get('pub_date');
    return moment(date).format("MMMM Do YYYY, h:mm a");
  }.property('WReader.itemsController.selectedItem')
});

WReader.EntryListView = Em.View.extend({
  classNames: ['well', 'entry'],
  classNameBindings: ['active', 'read', 'prev', 'next'],
  active: function() {
    var selectedItem = WReader.itemsController.get('selectedItem');
    var content = this.get('content');
    if (content === selectedItem) {
      return true;
    }
  }.property('WReader.itemsController.selectedItem'),
  read: function() {
    var read = this.get('content').get('read');
    return read;
  }.property('WReader.itemsController.@each.read'),
  formattedDate: function() {
    var date = this.get('content').get('pub_date');
    return moment(date).format("MMMM Do YYYY, h:mm a");
  }.property('WReader.itemsController.selectedItem')
});

function handleBodyKeyDown(evt) {
  switch (evt.keyCode) {
    case 34: // PgDn
    case 39: // right arrow
    case 40: // down arrow
    case 74: // j
      WReader.itemsController.next();
      event.preventDefault();
      break;

    case 33: // PgUp
    case 37: // left arrow
    case 38: // up arrow
    case 75: // k
      WReader.itemsController.prev();
      event.preventDefault();
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
for (var i = 0; i < 20; i++) {
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
