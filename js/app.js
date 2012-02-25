var WReader = Em.Application.create();

WReader.Item = Em.Object.extend({
  read: false,
  starred: false,
  item_id: 12345,
  title: null,
  pub_name: null,
  pub_author: null,
  pub_date: new Date(),
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

/*
 Helper test methods to add a couple of items to our list
*/
var item = WReader.Item.create({ item_id: 1, title: 'Item A', pub_name: 'Feed',
    pub_author: 'Author', pub_date: new Date(), sort_desc: 'Short Desc',
    content: 'Lorem Ipsum, yah it\'s all that!', starred: true,
    feed_link: 'http://google.com/', item_link: 'http://google.com/1'});
WReader.itemsController.addItem(item);
item = WReader.Item.create({ item_id: 2, title: 'Item B', pub_name: 'Feed',
    pub_author: 'Author', pub_date: new Date(), sort_desc: 'Short Desc',
    content: 'Lorem Ipsum, yah it\'s all that!', starred: false,
    feed_link: 'http://google.com/', item_link: 'http://google.com/2'});
WReader.itemsController.addItem(item);
item = WReader.Item.create({ item_id: 3, title: 'Born Read', pub_name: 'Feed',
    pub_author: 'Author', pub_date: new Date(), sort_desc: 'Short Desc',
    content: 'Lorem Ipsum, yah it\'s all that!', starred: false, read: true,
    feed_link: 'http://google.com/', item_link: 'http://google.com/3'});
WReader.itemsController.addItem(item);
