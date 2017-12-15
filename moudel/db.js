const MongoClient = require("mongodb").MongoClient;

//封装指定数据库的名称

function _connect(myDatabase, callback) {
    var url = "mongodb://localhost:27017/" + myDatabase;
    MongoClient.connect(url, function (err, db) {
        callback(err, db);
    });
};

// 封装插入一行数据
exports._insertOne = function (myDatabase, collectionName, data, callback) {
    if (arguments.length != 4) {
        callback(null); return;
    }
    _connect(myDatabase, function (err, db) {
        if (err) { callback(err, db); return; }
        db.collection(collectionName).insertOne(data, function (err, result) {
            callback(err, result);
            db.close();
        });
    });
}

// 封装插入多行数据
exports._insertMany = function (myDatabase, collectionName, data, callback) {
    if (arguments.length != 4) {
        callback(null); return;
    }
    _connect(myDatabase, function (err, db) {
        if (err) { callback(err, db); return; }
        db.collection(collectionName).insertMany(data, function (err, result) {
            callback(err, result);
            db.close();
        });
    });
}

//查找数据
exports._find = function (myDatabase, collectionName, data, C, D) {
    var result = [];
    if (arguments.length == 4) {
        // 此时查询的是 不分页
        var callback = C;
        var skipNumber = 0;
        var limitNumber = 0;
    } else if (arguments.length == 5) {
        // 分页
        // showLineData 每页显示的数据数
        // page 当前是第几页
        var args = C;
        var callback = D;
        var skipNumber = args.showLineData * args.page || 0;
        var limitNumber = args.showLineData || 0;
        var sort = args.sort || {};
    } else {
        throw new Error("参数错误");
        return;
    }
    _connect(myDatabase, function (err, db) {
        if (err) { callback(err, db); return; }
        var findData = db.collection(collectionName).find(data).limit(limitNumber).skip(skipNumber).sort(sort);
        findData.each(function (err, doc) {
            if (err) {
                callback(err, null);
                db.close();
                return;
            }
            if (doc != null) {
                result.push(doc);
            } else {
                callback(null, result);
                db.close();
            }
        });
    });
}

// 删除
exports._deleteMany = function (myDatabase, collectionName, data, callback) {
    _connect(myDatabase, function (err, db) {
        if (err) { callback(err, db); return; }
        db.collection(collectionName).deleteMany(data, function (err, result) {
            callback(err, result);
            db.close();
        });
    });
}

// 更新
exports._updateMany = function (myDatabase, collectionName, data1, data2, callback) {
    _connect(myDatabase, function (err, db) {
        if (err) { callback(err, db); return; }
        db.collection(collectionName).updateMany(data1, data2, function (err, result) {
            callback(err, result);
            db.close();
        });
    });
}

//封装统计
exports._count = function (myDatabase, collectionName, data, callback) {
    _connect(myDatabase, function (err, db) {
        if (err) { callback(err, db); return; }
        db.collection(collectionName).count(data,
            function (err, result) {
                callback(err, result);
            }
        );
    });
}