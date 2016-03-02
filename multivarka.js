const MongoClient = require('mongodb').MongoClient;

module.exports = {
    query: {},

    server: function (server) {
        this.server = server;
        return this;
    },

    collection: function (collection) {
        this.collection = collection;
        return this;
    },

    where: function (field) {
        this.field = field;
        this.invertCondition = false;
        return this;
    },

    equal: function (value) {
        if (this.field === undefined) {
            return this;
        }
        if (!this.invertCondition) {
            this.query[this.field] = value;
        } else {
            this.query[this.field] = { $ne: value };
        }
        return this;
    },

    lessThan: function (value) {
        if (this.field === undefined) {
            return this;
        }
        if (!this.invertCondition) {
            this.query[this.field] = { $lt : value.toString() };
        } else {
            this.query[this.field] = { $not: { $lt : value.toString() } };
        }
        return this;
    },

    greatThan: function (value) {
        if (this.field === undefined) {
            return this;
        }
        if (!this.invertCondition) {
            this.query[this.field] = { $gt : value.toString() };
        } else {
            this.query[this.field] = { $not: { $gt : value.toString() } };
        }
        return this;

    },

    include: function (list) {
        if (this.field === undefined) {
            return this;
        }
        if (!this.invertCondition) {
            this.query[this.field] = { $in : list };
        } else {
            this.query[this.field] = { $not: { $in : list } };
        }
        return this;
    },

    not: function () {
        this.invertCondition = this.invertCondition ? false : true;
        return this;
    },

    find: function(callback) {
        MongoClient.connect(this.server, (function(err, db) {
            var col = db.collection(this.collection);
            console.log(this.query);
            col.find(this.query).toArray(function(err, data) {
                db.close();
                this.query = {};
                callback(err, data);
            });
        }).bind(this));
    }
};
