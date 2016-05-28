import SourceCon from 'sourcecon';
import { EventEmitter } from 'events';
import MessageParser from './message_parser';

const SERVER_UPDATE_DELAY = 500;


/**
 * rustcon
 */
export default class RustCon extends EventEmitter {
  constructor(ip, port, pass) {
    super();

    if (!ip)   { throw new Error('Required IP address param missing.'); }
    if (!port) { throw new Error('Required port param missing.'); }
    if (!pass) { throw new Error('Required rcon password param missing.'); }

    // Properties
    this.ip = ip;
    this.port = port;
    this.pass = pass;
    this.hostname = null;
    this.description = null;
    this.url = null;
    this.image = null;
    this.players = [];

    this.connected = false;

    // Private
    this._sourcecon = new SourceCon(ip, port);
  }


  connect() {
    this._connect()
      .then(() => this._auth())
      .then(() => this.updateServer())
      .then(() => this.updatePlayers())
      .then(() => this._listen())
      .catch((error) => {
        console.error(error);
        process.exit();
      }
    );
  }


  /**
   * Fetch server info
   */
  updateServer() {
    return this.getHostname()
      .then(() => this.getDescription())
      .then(() => this.getURL())
      .then(() => this.getImage())
      .then(() => {
        let info = { hostname: this.hostname, description: this.description, url: this.url, image: this.image };
        this.emit('server_info', info);
      })
      .catch((error) => {
        console.error(error);
      }
    );
  }


  /**
   * Fetch server info
   */
  updatePlayers() {
    return this.getPlayers().then(() => {
      this.emit('player_status', this.players);
    })
    .catch((error) => {
      console.error(error);
    });
  }


  getHostname() {
    return this._getServerAttribute('server.hostname', 'hostname', 'parseServerHostname');
  }

  getDescription() {
    return this._getServerAttribute('server.description', 'description', 'parseServerDescription');
  }

  getURL() {
    return this._getServerAttribute('server.url', 'url', 'parseServerURL');
  }

  getImage() {
    return this._getServerAttribute('server.headerimage', 'image', 'parseServerImage');
  }

  getPlayers() {
    return this._getServerAttribute('status', 'players', 'parserPlayerStatus');
  }


  /**
   * Handle updating server attr
   * @private
   */
  _getServerAttribute(cmd, attr, func) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this._sourcecon.send(cmd, (error, res) => {
          if (error) { reject(error); }
          this[attr] = MessageParser[func](res);
          resolve();
        });
      }, SERVER_UPDATE_DELAY);
    });
  }


  /**
   * Connect
   * @private
   */
  _connect() {
    return new Promise((resolve, reject) => {
      this._sourcecon.connect((error) => {
        if (error) { reject(error); }
        resolve(this.sourcecon);
      });
    });
  }


  /**
   * Auth
   * @private
   */
  _auth() {
    return new Promise((resolve, reject) => {
      this._sourcecon.auth(this.pass, (error) => {
        if (error) { reject(error); }
        this.connected = true;
        resolve(this.sourcecon);
      });
    });
  }


  /**
   * Listen for messages
   * @private
   */
  _listen() {
    this._sourcecon.on('message', (msg) => {
      this.emit('message', MessageParser.parse(msg.body + ""));
    });
  }
}
