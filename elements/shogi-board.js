if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

(function() {
  'use strict';
  Polymer('shogi-board', {

    publish: {
      src: {
        value: '',
        reflect: true
      },

      cors_api_url: {
        value: 'http://cors-shogi.herokuapp.com/',
        reflect: true
      }
    },

    created: function() {
      this.kifu = null;
      this.turnNumber = 0;
      this.maxTurnNumber = 0;
      this.pieces = [];
      this.captured = [];
      this.update_interval = -1;
    },

    ready: function() {
      if (this.src) {
        this.load(this.src);
      }

      var width = this.$['player-black'].clientWidth;
      this.$['player-black'].style.fontSize = width / 6 + 'px';
      width = this.$['player-white'].clientWidth;
      this.$['player-white'].style.fontSize = width / 6 + 'px';
    },

    attributeChanged: function(name, oldValue, newValue) {
      switch (name) {
        case 'src':
          this.load(newValue);
          break;
      }
    },

    load: function(url) {
      var request = new XMLHttpRequest();
      request.open('GET', this.cors_api_url + url);
      if (url.search(/\.kif$/) != -1) {
        request.overrideMimeType('text/plain; charset=Shift_JIS');
      }
      request.onload = function() {
        this.setKifu(KifParser.parse(request.responseText));
        if (this.update_interval != -1) {
          window.setTimeout(function() {
            this.load(url);
          }.bind(this), this.update_interval);
        }
      }.bind(this);
      request.onerror = function() {
        console.log(request.responseText);
      };
      request.send();
    },

    setKifu: function(kifu) {
      if (typeof kifu === 'string') {
        kifu = JSON.parse(kifu);
      }
      var turnNumber = 0;
      if (this.kifu && this.kifu['対局ID'] == kifu['対局ID']) {
        turnNumber = this.turnNumber;
      }
      this.initialize();
      this.kifu = kifu;
      if (this.kifu.moves) {
        this.maxTurnNumber = this.kifu.moves.length;
      }
      if (this.turnNumber == 0) {
        this.updateComment();
      }
      this.updateKifu();
      this.titleName = this.kifu["棋戦"];
      this.place = this.kifu["場所"];
      this.blackPlayerName = this.kifu["先手"];
      this.whitePlayerName = this.kifu["後手"];
      if (turnNumber != 0) {
        this.$.kifu.selectedIndex = turnNumber;
        this.jumpTo(turnNumber);
      }
    },

    isFinished: function() {
      return (this.kifu && this.kifu.result);
    },

    _appendMoveString: function(string) {
      var div = document.createElement('div');
      div.innerHTML = string;
      this.$.kifu.appendChild(div);
    },

    _isResultMoveIndex: function(index) {
      return (index == this.maxTurnNumber - 1 &&
              !this.kifu.moves[index].move.from &&
              !this.kifu.moves[index].move.to &&
              this.kifu.result);
    },

    _isValidMoveIndex: function(index) {
      return (index < this.maxTurnNumber &&
              (this.kifu.moves[index].move.from ||
               this.kifu.moves[index].move.to));
    },

    updateKifu: function() {
      this._removeAllChildren(this.$.kifu);

      this._appendMoveString('*= 開始局面 =');

      for (var i = 1; i < this.maxTurnNumber; i++) {
        if (this._isResultMoveIndex(i)) {
          this._appendMoveString(this.kifu.result.replace(/\d{1,3}手で/,''));
          break;
        }
        if (!this._isValidMoveIndex(i)) {
          continue;
        }

        var header = '&nbsp;';
        if (this.kifu.moves[i].comments) {
          if (this.kifu.moves[i].comments.find(function(element) {
                return element.search(/※局後の感想※/) != -1;
              })) {
            header = '#';
          } else {
            header = '*';
          }
        }
        for (var space = 0; space < 2 - Math.log(i) / Math.LN10; space++) {
          header += '&nbsp;'
        }

        var player = (i % 2) ? '▲' : '△';
        var move_string = '';
        if (this.kifu.moves[i].move_string) {
          move_string = this.kifu.moves[i].move_string.replace(/\(.*\)/, '');
        }
        this._appendMoveString(header + i + player + move_string);
      }
    },

    updateComment: function() {
      if (!this.kifu.moves) {
        return;
      }

      this._removeAllChildren(this.$.comment);

      var comments = this.currentComment;
      if (!comments) {
        return;
      }
      this.$.comment.scrollTop = 0;

      for (var i = 0, l = comments.length; i < l; i++) {
        var line = document.createElement('p');
        if (comments[i].match(/^\u3010.*\u3011/) &&
            i + 1 < l &&
            comments[i + 1].match(/^http(s)?:/)) {
            var a = document.createElement('a');
            a.setAttribute('href', comments[i + 1]);
            a.innerHTML = comments[i];
            i++;
            line.appendChild(a);
        } else {
          line.innerHTML = comments[i];
        }
        this.$.comment.appendChild(line);
      }
    },

    _promote: function(piece) {
      var promote = piece.element.querySelector('.promoted');
      if (!promote) {
        return;
      }
      piece.element.querySelector('.normal')
           .setAttributeNS(null, 'visibility', 'hidden');
      piece.element.querySelector('.promoted')
           .setAttributeNS(null, 'visibility', 'visible');
    },

    _unpromote: function(piece) {
      var promote = piece.element.querySelector('.promoted');
      if (!promote) {
        return false;
      }
      var visibility = promote.getAttributeNS(null, 'visibility');
      piece.element.querySelector('.normal')
           .setAttributeNS(null, 'visibility', 'visible');
      promote.setAttributeNS(null, 'visibility', 'hidden');
      return visibility == 'visible';
    },

    _isDropping: function(move) {
      return (move.aux && move.aux == '打');
    },

    _isPromoting: function(move) {
      return (move.aux && move.aux == '成');
    },

    _isCapturing: function(move) {
      return (this._getPieceAtPosition(move.to.x, move.to.y));
    },

    _isCaptured: function(move) {
      return move.capturedPiece;
    },

    _betray: function(piece) {
      piece.player = piece.player == 'black' ? 'white' : 'black';
      piece.element.setAttribute('player', piece.player);
    },

    _placePieceInCaptured: function(piece) {
      piece.x = -1;
      piece.y = -1;
    },

    _capturePiece: function(piece) {
      this._betray(piece);
      piece.promoted = this._unpromote(piece);
      this._undropPiece(piece);
    },

    _uncapturePiece: function(piece) {
      this._betray(piece);
      this._dropPiece(piece);
    },

    _sortPiecesInCaptured: function() {
      var id = 'captured-' + this.currentPlayer;
      var pieces = this.$[id].children;
      var pieceArray = [];
      for (var i = 0; i < pieces.length; i ++) {
        pieceArray.push(pieces[i]);
      }
      var order = {
        '飛': 1,
        '角': 2,
        '金': 3,
        '銀': 4,
        '桂': 5,
        '香': 6,
        '歩': 7,
      };
      pieceArray.sort(function(a, b) {
        return order[a.classList.item(1)] - order[b.classList.item(1)];
      });
      pieceArray.forEach(function(element, index) {
        var x;
        var y;
        if (this.currentPlayer == 'white') {
          x = 75 - (index % 3) * 40;
          y = 670 - Math.floor(index / 3) * 50;
        } else {
          x = (index % 3) * 40 - 5;
          y = Math.floor(index / 3) * 50;
        }
        var transform = 'translate(' + x + ', ' + y + ')';
        if (this.currentPlayer == 'white') {
          transform += ' rotate(180, 24, 26)';
        }
        element.setAttributeNS(null, 'transform', transform);
      }.bind(this));
    },

    _undropPiece: function(piece) {
      this.captured.push(piece);
      var id = 'captured-' + this.currentPlayer;

      this.$[id].appendChild(piece.element);
      this._placePieceInCaptured(piece);
      this._sortPiecesInCaptured();
    },

    _dropPiece: function(piece) {
      this.captured.some(function(element, index) {
        if (element == piece) {
          this.captured.splice(index, 1);
        };
      }.bind(this));
      this.$.board.appendChild(piece.element);
      this._sortPiecesInCaptured();
    },

    get currentPlayer() {
      return (this.turnNumber % 2) ? 'black' : 'white'
    },

    _getPieceInCaptured: function(player, name) {
      return this.captured.find(function(element, index, array) {
        return (element.player == player) &&
               (element.name == name);
      });
    },

    moveNext: function(move) {
      var piece;
      if (this._isDropping(move)) {
        piece = this._getPieceInCaptured(this.currentPlayer,
                                         move.piece);
        this._dropPiece(piece);
      } else if (move.from) {
        piece = this._getPieceAtPosition(move.from.x, move.from.y);
      }

      if (!piece) {
        return false;
      }

      if (this._isCapturing(move)) {
        var capturingPiece = this._getPieceAtPosition(move.to.x, move.to.y);
        if (capturingPiece) {
          this._capturePiece(capturingPiece);
          move.capturedPiece = capturingPiece;
        }
      }

      if (this._isPromoting(move)) {
        this._promote(piece);
      }

      this._placePiece(piece, move.to.x, move.to.y);

      return true;
    },

    movePrevious: function(move) {
      if (!move.to) {
        return false;
      }
      var piece = this._getPieceAtPosition(move.to.x, move.to.y);
      if (!piece) {
        return false;
      }

      if (this._isPromoting(move)) {
        this._unpromote(piece);
      }

      if (this._isDropping(move)) {
        this._undropPiece(piece);
      } else {
        this._placePiece(piece, move.from.x, move.from.y);
      }

      var capturedPiece = move.capturedPiece;
      if (capturedPiece) {
        this._uncapturePiece(capturedPiece);
        if (capturedPiece.promoted) {
          this._promote(capturedPiece);
          capturedPiece.promoted = false;
        }
        this._placePiece(capturedPiece, move.to.x, move.to.y);
        move.capturedPiece = null;
      }

      return true;
    },

    get currentMove() {
      return this.kifu.moves[this.turnNumber].move;
    },

    get currentComment() {
      return this.kifu.moves[this.turnNumber].comments;
    },

    removeHighlight: function(move) {
      var move = this.currentMove;
      if (!move || !move.to) {
        return;
      }
      var piece = this._getPieceAtPosition(move.to.x, move.to.y);
      piece.element.classList.remove("current-turn");
    },

    addHighlight: function(move) {
      var move = this.currentMove;
      if (!move || !move.to) {
        return;
      }
      var piece = this._getPieceAtPosition(move.to.x, move.to.y);
      piece.element.classList.add("current-turn");
    },

    next: function() {
      if (this.turnNumber >= this.maxTurnNumber - 1) {
        return false;
      }
      this.removeHighlight();
      this.turnNumber++;
      this.moveNext(this.currentMove);
      this.addHighlight();
      this.updateComment();
      return true;
    },

    previous: function() {
      if (this.turnNumber <= 0) {
        return false;
      }
      this.removeHighlight();
      this.movePrevious(this.currentMove);
      this.turnNumber--;
      this.addHighlight();
      this.updateComment();
      return true;
    },

    jumpTo: function(turnNumber) {
      if (typeof turnNumber !== 'number') {
        turnNumber = this.$.kifu.selectedIndex;
      }
      if (turnNumber < 0 || turnNumber >= this.maxTurnNumber) {
        return false;
      }

      if (this.turnNumber < turnNumber) {
        while (this.turnNumber < turnNumber) {
          this.next();
        }
      } else {
        while (turnNumber < this.turnNumber) {
          this.previous();
        }
      }
      return true;
    },

    _removeAllChildren: function(node) {
      while (node.firstChild) {
        node.removeChild(node.firstChild);
      }
    },

    _clearAllPieces: function() {
      var pieces = this.$.board.querySelectorAll('.piece');
      for (var i = 0, l = pieces.length; i < l; i++) {
        this.$.board.removeChild(pieces[i]);
      }
      this._removeAllChildren(this.$['captured-black']);
      this._removeAllChildren(this.$['captured-white']);
    },

    initialize: function() {
      var piecePositions = '香桂銀金玉金銀桂香'+
                           '　飛　　　　　角　'+
                           '歩歩歩歩歩歩歩歩歩'+
                           '　　　　　　　　　'+
                           '　　　　　　　　　'+
                           '　　　　　　　　　'+
                           '歩歩歩歩歩歩歩歩歩'+
                           '　角　　　　　飛　'+
                           '香桂銀金玉金銀桂香';

      this._clearAllPieces();
      this.pieces = [];
      this.captured = [];

      var self = this;
      function createPieceElement(piece) {
        var element = self.$.board.querySelector('#' + piece.name).cloneNode(true);
        element.classList.add('piece');
        element.classList.add(piece.name);
        element.removeAttribute('id');
        element.setAttributeNS(null, 'visibility', 'visible');
        return element;
      };

      function createPiece(name, player) {
        var piece = {
          name: name,
          player: player
        };
        piece.element = createPieceElement(piece);
        return piece;
      };

      for (var i = 0, l = piecePositions.length; i < l; i++) {
        var name = piecePositions.charAt(i);
        if (name == '　') {
          continue;
        }

        var player = (i > 9 * 3) ? 'black' : 'white';
        var piece = createPiece(name, player);
        var x = 9 - (i % 9);
        var y = Math.floor(i / 9) + 1;
        this._placePiece(piece, x, y);
        this.pieces.push(piece);
      }

      this._placePieces(this.pieces);
      this.turnNumber = 0;
      this.maxTurnNumber = 0;
    },

    _placePieces: function(pieces) {
      for (var i = 0, l = pieces.length; i < l; i++) {
        this.$.board.appendChild(pieces[i].element);
      }
    },

    _placePiece: function(piece, x, y) {
      piece.x = x;
      piece.y = y;
      var transform = 'translate(' + (9 - x) * (440 / 9) + ', ' + (y - 1) * (480 / 9) + ')';

      if (piece.player == 'white') {
        transform += ' rotate(180, 24.5, 27)';
      }
      piece.element.setAttributeNS(null, 'transform', transform);
    },

    _getPieceAtPosition: function(x, y) {
      return this.pieces.find(function(element, index, array) {
        return (element.x == x && element.y == y);
      });
    },
  });
})();
