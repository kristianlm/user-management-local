
var klmdb = (function () {
  var elm = document.querySelector(elm),
      status = document.querySelector("#status"),
      db = null,
      showingTimeline = true,
      latest = 0;

  function initDb() {
    status.innerHTML = 'initialising database';
    try {
      if (window.openDatabase) {
        db = openDatabase("html5demos", "1.0", "HTML 5 Database API example", 200000);
        if (db) {
          db.transaction(function(tx) {

            tx.executeSql("CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT, created_at TEXT, event_type TEXT )", [], function (tx, result) {
            });

            tx.executeSql("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, created_at TEXT, uid TEXT )", [], function (tx, result) {
              klmdb.timeline();
            });
          });
        } else {
          status.innerHTML = 'error occurred trying to open DB';
        }
      } else {
        status.innerHTML = 'Web Databases not supported';
      }
    } catch (e) {
      status.innerHTML = 'error occurred during DB init, Web Database supported?';
    }
  }

  function load(table, myelm) {
    db.transaction(function (tx) {
      tx.executeSql('SELECT * FROM ' + table + ' ORDER BY id DESC', [], function (tx, results) {

        var list = [], i, since_id = 0, script;

        if (results.rows && results.rows.length) {
          status.innerHTML = 'loading from DB';
          for (i = 0; i < results.rows.length; i++) {
            list.push(results.rows.item(i));
          }

          show(list, table, myelm);
        }

      }, function (tx) {
        status.innerHTML = 'error occurred, please reset DB';
      });
    });

  }

  function show(tweets, table, myelm) {
  console.log("displaying " + tweets.length + " " + table + ":" );
    if (tweets.length) {
      status.innerHTML = 'showing ' + tweets.length + ' users';
      tweets = tweets.reverse();
      var html = '', li;

        // reset list
        while ( myelm.childNodes.length >= 1 )
        {
            myelm.removeChild( elm.firstChild );
        }

        var tr = document.createElement('tr');

        for(var key in tweets[0]) {
            console.log("key " + key);
            var td = document.createElement('td');
            td.innerHTML = key;
            tr.appendChild(td);
        }


        tr.className = "users_tr_head";
        myelm.appendChild(tr);

      for (var i = 0; i < tweets.length; i++) {
        var tr = document.createElement('tr');


        for(var key in tweets[i]) {
            var td = document.createElement('td');
            td.innerHTML = tweets[i][key];
            tr.appendChild(td);
        }

// add delete link
        {
            var td = document.createElement('td');
            td.innerHTML = '<a href=\"javascript:klmdb.dbdelete(\'' + table + '\', ' + tweets[i].id + ')">x</a>';
            tr.appendChild(td);
        }

//        li.innerHTML = ify.clean(tweets[i].text) + ' (<a href="http://twitter.com/' + tweets[i].screen_name + '/status/' + tweets[i].id + '">' + tweets[i].created_at + '</a>)';

//        td3.innerHTML = "<a href=\"javascript:deleteUser(" + tweets[i].id + ")\">delete</a>";


        if(i % 2 == 0)
            tr.className = "users_tr_even";
        else
            tr.className = "users_tr_odd";


        myelm.appendChild(tr);

        latest = tweets[i].id;
      }
    }
  }

  return {
    latest: function () {
      return latest;
    },

    init: initDb,

    timeline: function () {
      status.innerHTML = 'loading timeline';

      load("users", document.querySelector("#users"));
      load("events", document.querySelector("#events"));
    },


    reset: function () {
      status.innerHTML = 'resetting database';

      db.transaction(function (tx) {
        tx.executeSql('DROP TABLE IF EXISTS tweets', [], function () {
          status.innerHTML = 'database has been cleared - please reload';
          clear();
        });
      });
    },

    dbcreate: function (table, object) {
        db.transaction(function (tx) {

            var keys = "";
            var paramarks = "";
            var params = [];

            var first = true;

            for(key in object) {
                if(!first) {
                    keys += ", ";
                    paramarks  += ", ";
                }
                keys += key;
                paramarks += "?";
                first = false;

                params.push(object[key]);
            }
            console.log("keys : " + keys);
            tx.executeSql('INSERT INTO ' + table + ' (' + keys + ')  values (' + paramarks + ')', params);
        });
    	load();
    },

    dbdelete: function (table, id) {
        db.transaction(function (tx) {
            tx.executeSql('DELETE FROM ' + table + ' WHERE id = ?', [id]);
        })
    	load();
    }

  };

})();
// twitter username, element with the list of tweets, status field
//
//
//var ify = function() {
//  var entities = {
//      '"' : '&quot;',
//      '&' : '&amp;',
//      '<' : '&lt;',
//      '>' : '&gt;'
//  };
//
//  return {
//    "link": function(t) {
////      return t.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+[^\.,\)\s*$]/g, function(m) {
//        return '<a href="' + m + '">' + ((m.length > 25) ? m.substr(0, 24) + '...' : m) + '</a>';
////      });
//    },
//    "at": function(t) {
////      return t.replace(/(^|[^\w]+)\@([a-zA-Z0-9_]{1,15})/g, function(m, m1, m2) {
//        return m1 + '@<a href="http://twitter.com/' + m2 + '">' + m2 + '</a>';
////      });
//    },
//    "hash": function(t) {
////      ret urn t.replace(/(^|[^\w]+)\#([a-zA-Z0-9_]+)/g, function(m, m1, m2) {
//        return m1 + '#<a href="http://search.twitter.com/search?q=%23' + m2 + '">' + m2 + '</a>';
////      });
//    },
//    "clean": function(tweet) {
//      return this.hash(this.at(this.link(tweet)));
//    }
//  };
//}();
//
