var WReader = Em.Application.create();

WReader.Item = Em.Object.extend({
  read: false,
  starred: false,
  item_id: 12345,
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
  }.property('@each.starred')

});


WReader.selectedItemController = Em.Object.create({
  _content: null,

  content: Ember.computed(function(key, value) {
    if (arguments.length === 1) {
      //Getter
      return this.get("_content");
    } else {
      //Setter
      value.set('read', true);
      this.set("_content", value);
      //this.set("next", value);
      return value;
    }
  }).property('content')
});

WReader.ItemListView = Em.View.extend({
  classNames: ['well', 'summary'],
  classNameBindings: ['active', 'read'],
  /*contentBinding: this,*/
  contentBinding: 'WReader.itemsController.content',
  click: function(evt) {
    var content = this.get('content');
    WReader.selectedItemController.set('content', content);
  },
  active: function() {
    var selectedItem = WReader.selectedItemController.get('content'),
      content = this.get('content');
    if (content === selectedItem) { return true; }
  }.property('WReader.selectedItemController.content'),
  read: function() {
    var read = this.get('content').get('read');
    return read;
  }.property('WReader.selectedItemController.content'),
  formattedDate: function() {
    var date = this.get('content').get('pub_date');
    return moment(date).format("MMMM Do YYYY, h:mm a");
  }.property('WReader.selectedItemController.content')
});

WReader.ItemView = Em.View.extend({
  classNames: ['well', 'entry'],
  contentBinding: 'WReader.selectedItemController.content',
  formattedDate: function() {
    var date = this.get('content').get('pub_date');
    return moment(date).format("dddd, MMMM Do YYYY, h:mm a");
  }.property('WReader.selectedItemController.content'),
  keyUp: function(evt) {
    console.log('key', evt);
  }
});

/*
 Helper test methods to add a couple of items to our list
*/
var item = WReader.Item.create({ item_id: 1, title: 'Item A', pub_name: 'Feed',
    pub_author: 'Author', pub_date: new Date(0), short_desc: 'Short Desc',
    content: 'Lorem Ipsum, yah it\'s all that!', starred: true,
    feed_link: 'http://google.com/', item_link: 'http://google.com/1'});
WReader.itemsController.addItem(item);
item = WReader.Item.create({ item_id: 2, title: 'Item B', pub_name: 'Feed',
    pub_author: 'Author', pub_date: new Date(5000000000), short_desc: 'Short Desc',
    content: 'Lorem Ipsum, yah it\'s all that!', starred: false,
    feed_link: 'http://google.com/', item_link: 'http://google.com/2'});
WReader.itemsController.addItem(item);
item = WReader.Item.create({ item_id: 3, title: 'Born Read', pub_name: 'Feed',
    pub_author: 'Author', pub_date: new Date(1000000000000), short_desc: 'Short Desc',
    content: 'Lorem Ipsum, yah it\'s all that!', starred: false, read: true,
    feed_link: 'http://google.com/', item_link: 'http://google.com/3'});
WReader.itemsController.addItem(item);

