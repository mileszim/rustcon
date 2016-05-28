# rustcon
RCON service &amp; log parser for Rust

## Usage ##

### Install ###
```npm install --save rustcon```

### Run ###
    import RustCon from 'rustcon';

    // initialize
    let rustcon = new RustCon("rust.server.ip.address", port, "rcon password");

    // listen for events
    rustcon.on('server_info', (msg) => console.log(msg));   // hostname, desc, url, image
    rustcon.on('player_status', (msg) => console.log(msg)); // list of players
    rustcon.on('message', (msg) => console.log(msg));       // server messages

    // connect to your server
    rustcon.connect();


### Events ###

#### server_info response ####
The server_info event response will return an object of the current server information, like so:]

    {
      hostname: 'example hostname here',
      description: 'this is a description of your server',
      url: '...',
      image: '...'
    }


#### player_status response ####
The player_status event response will return an array of the current players on the server, each as an object like so:

    [
      {
        steamId: '12345678901234566',
        name: 'my cool player name',
        ping: '26',
        connected: '2403s',
        ipAddress: '123.123.123.123:12345'
      },
      ...
    ]

#### message ####
The message event is emitted after every rcon line on the server. It is broken down into objects according to the type of log line:

**RCON:**

    {
      type: 'rcon',
      msg: '[RCON][123.123.123.123:12345] status',
      timestamp: 2016-05-28T09:43:12.993Z,
      host: '123.123.123.123:12345',
      content: 'status'
    }

**Oxide:**

    {
      type: 'oxide',
      msg: '[Oxide] 02:43 [Info] [BetterLoot] BetterLoot: Refreshed 39 containers (0 destroyed)',
      timestamp: 2016-05-28T09:43:13.914Z,
      level: 'info',
      content: '[BetterLoot] BetterLoot: Refreshed 39 containers (0 destroyed)'
    }

**Chat:**

    {
      type: 'chat',
      msg: '[CHAT] playername[1234567/12345678901234566] : Hello playername.',
      timestamp: 2016-05-28T02:37:31.847Z,
      name: 'playername',
      id: '1234567',
      steamId: '12345678901234566',
      content: 'Hello playername.'
    }

**General:**

    {
      type: 'general',
      msg: 'playername[1234567/12345678901234566] died (Bite)',
      timestamp: 2016-05-28T02:07:56.362Z,
      content: 'playername[1234567/12345678901234566] died (Bite)'
    }
