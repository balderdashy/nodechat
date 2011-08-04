// Localstorage -> server connector
var Store = function(b) {
    this.name = b;
    var a = localStorage.getItem(this.name);
    this.data = (a && JSON.parse(a)) || {}
};
_.extend(Store.prototype, {
    save: function() {
        localStorage.setItem(this.name, JSON.stringify(this.data))
    },
    create: function(a) {
        if (!a.id) {
            a.id = a.attributes.id = _.guid()
        }
        this.data[a.id] = a;
        this.save();
        return a
    },
    update: function(a) {
        this.data[a.id] = a;
        this.save();
        return a
    },
    find: function(a) {
        return this.data[a.id]
    },
    findAll: function() {
        return _.values(this.data)
    },
    destroy: function(a) {
        delete this.data[a.id];
        this.save();
        return a
    }
});
Backbone.sync = function(f, c, e, b) {
    var d;
    var a = c.localStorage || c.collection.localStorage;
    switch (f) {
    case "read":
        d = c.id ? a.find(c) : a.findAll();
        break;
    case "create":
        d = a.create(c);
        break;
    case "update":
        d = a.update(c);
        break;
    case "delete":
        d = a.destroy(c);
        break
    }
    if (d) {
        e(d)
    } else {
        b("Record not found")
    }
};