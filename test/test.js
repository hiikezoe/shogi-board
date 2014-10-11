(function() {
  'use strict';
  jasmine.getFixtures().fixturesPath = '/test/fixtures';
  elementSuite('shogi-board', 'fixtures/shogi-board', function() {
    function equalPiece(expected, actual) {
      assert.equal(expected.name, actual.name);
      assert.equal(expected.player, actual.player);
      assert.equal(expected.promoted, actual.element.classList.contains('promoted'));
    }

    suite('positions', function() {
      test('All pieces place correct positions', function(done) {
        // The karma-polymer-test adds some extra function calls to Mocha to work
        // around the timing issues of setting Polymer attributes. Set the attributes in
        // the `this.set` callback then check them in the `this.then` callback
        this.set(function(element) {
        }).then(function(element) {
          jasmine.getFixtures().fixturesPath = '/test/fixtures';
          var kifu = readFixtures('one.json');
          element.setKifu(kifu);

          var expectedPositions = '香桂銀金玉金銀桂香'+
                                  '　飛　　　　　角　'+
                                  '歩歩歩歩歩歩歩歩歩'+
                                  '　　　　　　　　　'+
                                  '　　　　　　　　　'+
                                  '　　　　　　　　　'+
                                  '歩歩歩歩歩歩歩歩歩'+
                                  '　角　　　　　飛　'+
                                  '香桂銀金玉金銀桂香';
          for (var i = 0, l = expectedPositions.length; i < l; i++) {
            var name = expectedPositions.charAt(i);
            if (name == '　') {
              continue;
            }
            var x = 9 - (i % 9);
            var y = Math.floor(i / 9) + 1;
            var player = y > 5 ? "black" : "white";
            assert.equal(name, element._getPieceAtPosition(x, y).name);
            assert.equal(player, element._getPieceAtPosition(x, y).player);
          }
        });
      });
    });
    suite('moves', function() {
      test('should move to next and previous position', function(done) {
        this.set(function(element) {
        }).then(function(element) {
          jasmine.getFixtures().fixturesPath = '/test/fixtures';
          var kifu = readFixtures('one.json');
          element.setKifu(kifu);

          assert.equal(0, element.turnNumber);
          assert.equal(2, element.maxTurnNumber);

          assert.equal("歩", element._getPieceAtPosition(7, 7).name);
          assert.isTrue(element.next());
          assert.equal(1, element.turnNumber);
          assert.isUndefined(element._getPieceAtPosition(7, 7));
          assert.equal("歩", element._getPieceAtPosition(7, 6).name);
          assert.isFalse(element.next());
          assert.equal(1, element.turnNumber);

          assert.isTrue(element.previous());
          assert.equal(0, element.turnNumber);
          assert.isUndefined(element._getPieceAtPosition(7, 6));
          assert.equal("歩", element._getPieceAtPosition(7, 7).name);
          assert.isFalse(element.previous());
          assert.equal(0, element.turnNumber);
        });
      });
    });
    suite('jumpTo', function() {
      test('should jump to next and previous position', function(done) {
        this.set(function(element) {
        }).then(function(element) {
          var kifu = readFixtures('jump.json');
          element.setKifu(kifu);

          assert.equal(0, element.turnNumber);
          assert.equal(11, element.maxTurnNumber);

          assert.isTrue(element.jumpTo(10));
          assert.equal(10, element.turnNumber);
          assert.isUndefined(element._getPieceAtPosition(2, 2));
          equalPiece({
            name: "角",
            player: "white",
            promoted: true
          }, element._getPieceAtPosition(7, 7));

          assert.isFalse(element.jumpTo(11));
          assert.equal(10, element.turnNumber);

          assert.isTrue(element.jumpTo(7));
          assert.equal(7, element.turnNumber);
          equalPiece({
            name: "角",
            player: "black",
            promoted: false
          }, element._getPieceAtPosition(7, 7));
          equalPiece({
            name: "角",
            player: "white",
            promoted: false
          }, element._getPieceAtPosition(2, 2));
        });
      });
    });
    suite('resign', function() {
      test('should move to next and previous position with regination kifu', function(done) {
        this.set(function(element) {
        }).then(function(element) {
          var kifu = readFixtures('resign.json');
          element.setKifu(kifu);

          assert.equal(0, element.turnNumber);
          assert.equal(3, element.maxTurnNumber);

          assert.isTrue(element.next());
          assert.equal(1, element.turnNumber);

          assert.isTrue(element.next());
          assert.equal(2, element.turnNumber);

          assert.isFalse(element.next());

          assert.isTrue(element.previous());
          assert.equal(1, element.turnNumber);

          assert.isTrue(element.previous());
          assert.equal(0, element.turnNumber);

          assert.isFalse(element.jumpTo(3));
          assert.isTrue(element.jumpTo(2));

          assert.isTrue(element.jumpTo(0));
        });
      });
    });
  });
}());
