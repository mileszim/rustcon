'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sourcecon = require('sourcecon');

var _sourcecon2 = _interopRequireDefault(_sourcecon);

var _events = require('events');

var _message_parser = require('./message_parser');

var _message_parser2 = _interopRequireDefault(_message_parser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SERVER_UPDATE_DELAY = 500;

/**
 * rustcon
 */

var RustCon = function (_EventEmitter) {
  _inherits(RustCon, _EventEmitter);

  function RustCon(ip, port, pass) {
    _classCallCheck(this, RustCon);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RustCon).call(this));

    if (!ip) {
      throw new Error('Required IP address param missing.');
    }
    if (!port) {
      throw new Error('Required port param missing.');
    }
    if (!pass) {
      throw new Error('Required rcon password param missing.');
    }

    // Properties
    _this.ip = ip;
    _this.port = port;
    _this.pass = pass;
    _this.hostname = null;
    _this.description = null;
    _this.url = null;
    _this.image = null;
    _this.players = [];

    _this.connected = false;

    // Private
    _this._sourcecon = new _sourcecon2.default(ip, port);
    return _this;
  }

  _createClass(RustCon, [{
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      this._connect().then(function () {
        return _this2._auth();
      }).then(function () {
        return _this2.updateServer();
      }).then(function () {
        return _this2.updatePlayers();
      }).then(function () {
        return _this2._listen();
      }).catch(function (error) {
        console.error(error);
        process.exit();
      });
    }

    /**
     * Fetch server info
     */

  }, {
    key: 'updateServer',
    value: function updateServer() {
      var _this3 = this;

      return this.getHostname().then(function () {
        return _this3.getDescription();
      }).then(function () {
        return _this3.getURL();
      }).then(function () {
        return _this3.getImage();
      }).then(function () {
        var info = { hostname: _this3.hostname, description: _this3.description, url: _this3.url, image: _this3.image };
        _this3.emit('server_info', info);
      }).catch(function (error) {
        console.error(error);
      });
    }

    /**
     * Fetch server info
     */

  }, {
    key: 'updatePlayers',
    value: function updatePlayers() {
      var _this4 = this;

      return this.getPlayers().then(function () {
        _this4.emit('player_status', _this4.players);
      }).catch(function (error) {
        console.error(error);
      });
    }
  }, {
    key: 'getHostname',
    value: function getHostname() {
      return this._getServerAttribute('server.hostname', 'hostname', 'parseServerHostname');
    }
  }, {
    key: 'getDescription',
    value: function getDescription() {
      return this._getServerAttribute('server.description', 'description', 'parseServerDescription');
    }
  }, {
    key: 'getURL',
    value: function getURL() {
      return this._getServerAttribute('server.url', 'url', 'parseServerURL');
    }
  }, {
    key: 'getImage',
    value: function getImage() {
      return this._getServerAttribute('server.headerimage', 'image', 'parseServerImage');
    }
  }, {
    key: 'getPlayers',
    value: function getPlayers() {
      return this._getServerAttribute('status', 'players', 'parserPlayerStatus');
    }

    /**
     * Handle updating server attr
     * @private
     */

  }, {
    key: '_getServerAttribute',
    value: function _getServerAttribute(cmd, attr, func) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          _this5._sourcecon.send(cmd, function (error, res) {
            if (error) {
              reject(error);
            }
            _this5[attr] = _message_parser2.default[func](res);
            resolve();
          });
        }, SERVER_UPDATE_DELAY);
      });
    }

    /**
     * Connect
     * @private
     */

  }, {
    key: '_connect',
    value: function _connect() {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        _this6._sourcecon.connect(function (error) {
          if (error) {
            reject(error);
          }
          resolve(_this6.sourcecon);
        });
      });
    }

    /**
     * Auth
     * @private
     */

  }, {
    key: '_auth',
    value: function _auth() {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        _this7._sourcecon.auth(_this7.pass, function (error) {
          if (error) {
            reject(error);
          }
          _this7.connected = true;
          resolve(_this7.sourcecon);
        });
      });
    }

    /**
     * Listen for messages
     * @private
     */

  }, {
    key: '_listen',
    value: function _listen() {
      var _this8 = this;

      this._sourcecon.on('message', function (msg) {
        _this8.emit('message', _message_parser2.default.parse(msg.body + ""));
      });
    }
  }]);

  return RustCon;
}(_events.EventEmitter);

exports.default = RustCon;