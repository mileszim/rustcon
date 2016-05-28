const OXIDE_REGEX = /^\[Oxide\]\s(\d{1,2}:\d{2})\s\[(\w+)\]\s(?:\[([\w\s\-]+)\]:?\s)?(.*)$/;
const RCON_REGEX = /^\[RCON\]\[(.+)\]\s(.+)$/;
const CHAT_REGEX = /^\[CHAT\]\s(.+)\[(\d+)\/(\d+)\]\s:\s(.*)$/;

const SERVER_DESCRIPTION_REGEX = /^server\.description:\s\"(.*)\"$/;
const SERVER_URL_REGEX = /^server\.url:\s\"(.*)\"$/;
const SERVER_IMAGE_REGEX = /^server\.headerimage:\s\"(.*)\"$/;
const SERVER_HOSTNAME_REGEX = /^server\.hostname:\s\"(.*)\"$/;

const PLAYER_STATUS_REGEX = /^(\d+)\s"(.+)"\s+(\d{1,10})\s+(\w+)\s+([\w\.\:]+)\s+/;


/**
 * Parse RCON messages into constituent pieces
 */
export default class MessageParser {
  constructor() {
    throw new Error('MessageParser class should not be instantiated.');
  }


  // Entrypoint
  static parse(message) {
    if (MessageParser.isOxide(message)) { return MessageParser._toOxide(message); }
    if (MessageParser.isRCON(message))  { return MessageParser._toRCON(message);  }
    if (MessageParser.isChat(message))  { return MessageParser._toChat(message);  }
    return MessageParser._toGeneral(message);
  }


  /**
   * Checkers
   */
  static isOxide(message) {
    return OXIDE_REGEX.test(message);
  }

  static isRCON(message) {
    return RCON_REGEX.test(message);
  }

  static isChat(message) {
    return CHAT_REGEX.test(message);
  }

  static isGeneral(message) {
    return !MessageParser.isOxide(message) && !MessageParser.isRCON(message) && !MessageParser.isChat(message);
  }


  /**
   * Specific Parsers
   */
  static parseServerDescription(message) {
    let props = SERVER_DESCRIPTION_REGEX.exec(message);
    return props[1];
  }

  static parseServerURL(message) {
    let props = SERVER_URL_REGEX.exec(message);
    return props[1];
  }

  static parseServerImage(message) {
    let props = SERVER_IMAGE_REGEX.exec(message);
    return props[1];
  }

  static parseServerHostname(message) {
    let props = SERVER_HOSTNAME_REGEX.exec(message);
    return props[1];
  }

  static parserPlayerStatus(message) {
    message = message + "";
    return message.split('\n').slice(6,-1).map((player) => {
      let p = PLAYER_STATUS_REGEX.exec(player);
      return { steamId: p[1], name: p[2], ping: p[3], connected: p[4], ipAddress: p[5] };
    });
  }


  /**
   * General Parsers
   */
  static _toOxide(message) {
    let props = OXIDE_REGEX.exec(message);
    return {
      type: 'oxide',
      msg: message,
      timestamp: new Date(),
      level: props[2].toLowerCase(),
      plugin: props[3],
      content: props[4]
    };
  }

  static _toRCON(message) {
    let props = RCON_REGEX.exec(message);
    return {
      type: 'rcon',
      msg: message,
      timestamp: new Date(),
      host: props[1],
      content: props[2]
    };
  }

  static _toChat(message) {
    let props = CHAT_REGEX.exec(message);
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

  static _toGeneral(message) {
    return {
      type: 'general',
      msg: message,
      timestamp: new Date(),
      content: message
    }
  }
}
