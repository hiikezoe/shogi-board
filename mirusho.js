(function() {
  var thisModule = {};
  var root, previousModule;

  root = this;
  if (root != null) {
    previousModule = root.kisen;
  }

  var noConflict = function() {
    root.kisen = previousModule;
    return thisModule;
  };

  var collect = function(callback) {
    var kisenList = [
      { name : '竜王戦',
        url  : 'http://live.shogi.or.jp/ryuou/' },
      { name : '王位戦',
        url  : 'http://live.shogi.or.jp/oui/' },
      { name : '王座戦',
        url  : 'http://live.shogi.or.jp/ouza/' },
      { name : '棋王戦',
        url  : 'http://live.shogi.or.jp/kiou/' },
      { name : '棋聖戦',
        url  : 'http://live.shogi.or.jp/kisei/' },
      { name : '朝日杯将棋オープン戦',
        url  : 'http://live.shogi.or.jp/asahi/' },
      { name : '新人王戦',
        url  : 'http://live.shogi.or.jp/shinjin/' },
      { name : '達人戦',
        url  : 'http://live.shogi.or.jp/tatsujin/' }
    ];

    kisenList.forEach(function(element) {
      loader.setCorsApiUrl('http://cors-shogi.herokuapp.com/');
      loader.load(element.url, function(response) {
        var kif = response.match(/a href="(http:\/\/.*)?(kifu\/.+?).html"/);
        if (!kif) {
          return;
        }
        var base_url;
        if (kif[1]) {
          base_url = kif[1];
        } else {
          base_url = element.url;
        }
        callback({ name: element.name, url: base_url + kif[2] + '.kif'});
      });
    });
  };

  thisModule.noConflict = noConflict;
  thisModule.collect = collect;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = thisModule;
  } else {
    root.kisen = thisModule;
  }

}());

(function() {
  var thisModule = {};
  var root, previousModule;

  root = this;
  if (root != null) {
    previousModule = root.loader;
  }

  var noConflict = function() {
    root.loader = previousModule;
    return thisModule;
  };

  var cors_api_url = '';
  var setCorsApiUrl = function(url) {
    cors_api_url = url;
  };

  var load = function(url, successCallback) {
    var request = new XMLHttpRequest();
    request.open('GET', cors_api_url + url);
    if (url.search(/\.kif$/) != -1) {
      request.overrideMimeType('text/plain; charset=Shift_JIS');
    }
    request.onload = function() {
      successCallback(request.responseText);
    };
    request.onerror = function() {
      console.log(request.responseText);
    };
    request.send();
  };

  thisModule.noConflict = noConflict;
  thisModule.load = load;
  thisModule.setCorsApiUrl = setCorsApiUrl;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = thisModule;
  } else {
    root.loader = thisModule;
  }

}());

(function() {
  'use strict';

  kisen.collect(function(kif) {
    var scope = document.querySelector('#kisen-list');
    scope.titles.push(kif);
  });

  window.addEventListener('polymer-ready', function(e) {
    var scope = document.querySelector('#kisen-list');

    scope.titles = [];

    scope.selectAction = function(event) {
    };
    scope.activateAction = function(event) {
      var item = event.target.selectedItem;
      var url = item.getAttribute("url");
      if (!url) {
        return;
      }
      var element = document.querySelector('shogi-board');
      element.src = url;
    };
  });

}());
