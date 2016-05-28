'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OXIDE_REGEX = /^\[Oxide\]\s(\d{1,2}:\d{2})\s\[(\w+)\]\s(?:\[([\w\s\-]+)\]:?\s)?(.*)$/;
var RCON_REGEX = /^\[RCON\]\[(.+)\]\s(.+)$/;
var CHAT_REGEX = /^\[CHAT\]\s(.+)\[(\d+)\/(\d+)\]\s:\s(.*)$/;

var SERVER_DESCRIPTION_REGEX = /^server\.description:\s\"(.*)\"$/;
var SERVER_URL_REGEX = /^server\.url:\s\"(.*)\"$/;
var SERVER_IMAGE_REGEX = /^server\.headerimage:\s\"(.*)\"$/;
var SERVER_HOSTNAME_REGEX = /^server\.hostname:\s\"(.*)\"$/;

var PLAYER_STATUS_REGEX = /^(\d+)\s"(.+)"\s+(\d{1,10})\s+(\w+)\s+([\w\.\:]+)\s+/;

/**
 * Parse RCON messages into constituent pieces
 */

var MessageParser = function () {
  function MessageParser() {
    _classCallCheck(this, MessageParser);

    throw new Error('MessageParser class should not be instantiated.');
  }

  // Entrypoint


  _createClass(MessageParser, null, [{
    key: 'parse',
    value: function parse(message) {
      if (MessageParser.isOxide(message)) {
        return MessageParser._toOxide(message);
      }
      if (MessageParser.isRCON(message)) {
        return MessageParser._toRCON(message);
      }
      if (MessageParser.isChat(message)) {
        return MessageParser._toChat(message);
      }
      return MessageParser._toGeneral(message);
    }

    /**
     * Checkers
     */

  }, {
    key: 'isOxide',
    value: function isOxide(message) {
      return OXIDE_REGEX.test(message);
    }
  }, {
    key: 'isRCON',
    value: function isRCON(message) {
      return RCON_REGEX.test(message);
    }
  }, {
    key: 'isChat',
    value: function isChat(message) {
      return CHAT_REGEX.test(message);
    }
  }, {
    key: 'isGeneral',
    value: function isGeneral(message) {
      return !MessageParser.isOxide(message) && !MessageParser.isRCON(message) && !MessageParser.isChat(message);
    }

    /**
     * Specific Parsers
     */

  }, {
    key: 'parseServerDescription',
    value: function parseServerDescription(message) {
      var props = SERVER_DESCRIPTION_REGEX.exec(message);
      return props[1];
    }
  }, {
    key: 'parseServerURL',
    value: function parseServerURL(message) {
      var props = SERVER_URL_REGEX.exec(message);
      return props[1];
    }
  }, {
    key: 'parseServerImage',
    value: function parseServerImage(message) {
      var props = SERVER_IMAGE_REGEX.exec(message);
      return props[1];
    }
  }, {
    key: 'parseServerHostname',
    value: function parseServerHostname(message) {
      var props = SERVER_HOSTNAME_REGEX.exec(message);
      return props[1];
    }
  }, {
    key: 'parserPlayerStatus',
    value: function parserPlayerStatus(message) {
      message = message + "";
      return message.split('\n').slice(6, -1).map(function (player) {
        var p = PLAYER_STATUS_REGEX.exec(player);
        return { steamId: p[1], name: p[2], ping: p[3], connected: p[4], ipAddress: p[5] };
      });
    }

    /**
     * General Parsers
     */

  }, {
    key: '_toOxide',
    value: function _toOxide(message) {
      var props = OXIDE_REGEX.exec(message);
      return {
        type: 'oxide',
        msg: message,
        timestamp: new Date(),
        level: props[2].toLowerCase(),
        plugin: props[3],
        content: props[4]
      };
    }
  }, {
    key: '_toRCON',
    value: function _toRCON(message) {
      var props = RCON_REGEX.exec(message);
      return {
        type: 'rcon',
        msg: message,
        timestamp: new Date(),
        host: props[1],
        content: props[2]
      };
    }
  }, {
    key: '_toChat',
    value: function _toChat(message) {
      var props = CHAT_REGEX.exec(message);
      return {
        type: 'chat',
        msg: message,
        timestamp: new Date(),
        name: props[1],
        id: props[2],
        steamId: props[3],
        content: props[4]
      };
    }
  }, {
    key: '_toGeneral',
    value: function _toGeneral(message) {
      return {
        type: 'general',
        msg: message,
        timestamp: new Date(),
        content: message
      };
    }
  }]);

  return MessageParser;
}();

exports.default = MessageParser;