const MongoClient = require('mongodb').MongoClient;

module.exports = function () {
    return {
        conditions: [],

        updates: {},

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
                console.log('warning: field was not set. Use .where() method.')
                return this;
            }

            var condition = {};

            condition[this.field] = !this.invertCondition ? value : { $ne: value};
            this.conditions.push(condition);

            return this;
        },

        lessThan: function (value) {
            if (this.field === undefined) {
                console.log('warning: field was not set. Use .where() method.')
                return this;
            }

            var condition = {};

            condition[this.field] = !this.invertCondition ? {$lt: value} : {$not: {$lt: value}};
            this.conditions.push(condition);

            return this;
        },

        greatThan: function (value) {
            if (this.field === undefined) {
                console.log('warning: field was not set. Use .where() method.')
                return this;
            }

            var condition = {};

            condition[this.field] = !this.invertCondition ? {$gt: value} : {$not: {$gt: value}};
            this.conditions.push(condition);

            return this;

        },

        include: function (list) {
            if (this.field === undefined) {
                console.log('warning: field was not set. Use .where() method.')
                return this;
            }

            var condition = {};

            condition[this.field] = !this.invertCondition ? {$in: list} : {$not: {$in: list}};
            this.conditions.push(condition);

            return this;
        },

        not: function () {
            if (this.field === undefined) {
                console.log('warning: field was not set. Use .where() method.')
                return this;
            }

            this.invertCondition = this.invertCondition ? false : true;

            return this;
        },

        set: function (field, value) {
            this.updates[field] = value;

            return this;
        },

        find: function (callback) {
            var error = this.checkArgs();

            if (error !== null) {
                callback(error, null);
                return;
            }

            var client = new MongoClient();

            client.connect(this.server, (function (err, db) {
                if (err) {
                    callback(err, null);
                    return;
                }

                var col = db.collection(this.collection);
                var query = this.conditions.length === 0 ? {} : {$and: this.conditions};

                col.find(query).toArray((function (err, data) {
                    db.close();
                    this.reset();

                    callback(err, data);
                }).bind(this));
            }).bind(this));
        },

        remove: function (callback) {
            var error = this.checkArgs();

            if (error !== null) {
                callback(error, null);
                return;
            }

            var client = new MongoClient();

            client.connect(this.server, (function (err, db) {
                if (err) {
                    callback(err, null);
                    return;
                }

                var col = db.collection(this.collection);
                var query = this.conditions.length === 0 ? {} : {$and: this.conditions};

                col.remove(query, null, (function (err, data) {
                    db.close();
                    this.reset();

                    callback(err, data);
                }).bind(this));
            }).bind(this));
        },

        update: function (callback) {
            var error = this.checkArgs();

            if (error !== null) {
                callback(error, null);
                return;
            }

            if (Object.keys(this.updates).length === 0) {
                callback(new Error('Updates was not set. Use .set() method'), null);
                return;
            }

            var client = new MongoClient();

            client.connect(this.server, (err, db) => {
                if (err) {
                    callback(err, null);
                    return;
                }

                var col = db.collection(this.collection);
                var query = this.conditions.length === 0 ? {} : {$and: this.conditions};
                var updateQuery = {$set: this.updates};

                col.update(query, updateQuery, null, (err, data) => {
                    db.close();
                    this.reset();

                    callback(err, data);
                });
            });
        },

        insert: function (record, callback) {
            var error = this.checkArgs();

            if (error !== null) {
                callback(error, null);
                return;
            }

            var client = new MongoClient();

            client.connect(this.server, (function (err, db) {
                if (err) {
                    callback(err, null);
                    return;
                }

                var col = db.collection(this.collection);

                col.insert(record, null, (function (err, data) {
                    db.close();
                    this.reset();

                    callback(err, data);
                }).bind(this));
            }).bind(this));
        },

        checkArgs: function () {
            if (!this.isServerSet()) {
                return new Error('Server was not set. Use .server() method');
            }

            if (!this.isCollectionSet()) {
                return new Error('Collection was not set. Use .collection() method');
            }

            return null;
        },

        isServerSet: function () {
            return this.server !== undefined;
        },

        isCollectionSet: function () {
            return this.collection !== undefined;
        },

        reset: function () {
            this.conditions = [];
            this.updates = {};
            this.field = undefined;
            this.invertCondition = false;
        }

    };
};
