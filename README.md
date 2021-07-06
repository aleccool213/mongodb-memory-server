# MongoDB In-Memory Server

[![Node.js CI](https://github.com/nodkz/mongodb-memory-server/workflows/Node.js%20CI/badge.svg)](https://github.com/nodkz/mongodb-memory-server/actions?query=workflow%3A"Node.js+CI")
[![NPM version](https://img.shields.io/npm/v/mongodb-memory-server.svg)](https://www.npmjs.com/package/mongodb-memory-server)
[![Downloads stat](https://img.shields.io/npm/dt/mongodb-memory-server.svg)](http://www.npmtrends.com/mongodb-memory-server)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![TypeScript compatible](https://img.shields.io/badge/typescript-compatible-brightgreen.svg)](https://www.typescriptlang.org)
[![codecov.io](https://codecov.io/github/nodkz/mongodb-memory-server/coverage.svg?branch=master)](https://codecov.io/github/nodkz/mongodb-memory-server?branch=master)
[![Backers on Open Collective](https://opencollective.com/mongodb-memory-server/backers/badge.svg)](#backers)
[![Sponsors on Open Collective](https://opencollective.com/mongodb-memory-server/sponsors/badge.svg)](#sponsors)

This package spins up an actual/real MongoDB server programmatically from node, for testing or mocking during development. By default it holds the data in memory. A fresh spun up `mongod` process takes about 7Mb of memory. The server will allow you to connect your favorite ODM or client library to the MongoDB server and run integration tests isolated from each other.

On install, this [package downloads](#configuring-which-mongod-binary-to-use) the latest MongoDB binaries and saves them to a cache folder.

On starting a new instance of the memory server, if the binary cannot be found, it will be auto-downloaded, thus the first run may take some time. All further runs will be fast, because they will use the downloaded binaries.

This package automatically downloads binaries from [https://fastdl.mongodb.org/](https://fastdl.mongodb.org/) according to your operating system. You can see all available versions for [Linux](https://www.mongodb.org/dl/linux) (Ubuntu, RHEL, Debian, SUSE, Amazon), [OSX](https://www.mongodb.org/dl/osx), and [Windows](https://www.mongodb.org/dl/win32).

> If your network is behind a proxy, make sure that it is configured through the `HTTPS_PROXY` or `HTTP_PROXY` environment variable.

Every `MongoMemoryServer` instance creates and starts a fresh MongoDB server on some free port. You may start up several `mongod` simultaneously. When you terminate your script or call `stop()`, the MongoDB server(s) will be automatically shutdown.

Works perfectly [with Travis CI](https://github.com/nodkz/graphql-compose-mongoose/commit/7a6ac2de747d14281f9965f418065e97a57cfb37) without additional `services` and `addons` options in `.travis.yml`.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Installation](#installation)
  - [Requirements](#requirements)
  - [Known Issues](#known-issues)
  - [Choose the Correct Package](#choose-the-correct-package)
  - [Configuring which mongod binary to use](#configuring-which-mongod-binary-to-use)
- [Usage](#usage)
  - [Simple server start](#simple-server-start)
  - [Available options for MongoMemoryServer](#available-options-for-mongomemoryserver)
  - [Replica Set start](#replica-set-start)
  - [Available options for MongoMemoryReplSet](#available-options-for-mongomemoryreplset)
  - [Config Options](#config-options)
  - [Simple test with MongoClient](#simple-test-with-mongoclient)
  - [Provide connection string to mongoose](#provide-connection-string-to-mongoose)
  - [Several mongoose connections simultaneously](#several-mongoose-connections-simultaneously)
  - [Integration Examples](#integration-examples)
  - [AVA test runner](#ava-test-runner)
  - [Docker Alpine](#docker-alpine)
  - [Enable Debug Mode](#enable-debug-mode)
- [CI](#ci)
- [Contributing](#contributing)
- [Join Our Discord Server](#join-our-discord-server)
- [Documentation](#documentation)
- [Credits](#credits)
- [Maintainers](#maintainers)
- [Contributors](#contributors)
- [Backers](#backers)
- [Sponsors](#sponsors)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

This tool provides three packages for different purposes:

- With auto-download mongod binary on npm install
- Without auto-download on npm install

Choose any package, because they are the same. They differ only in the default configuration, which you may override (see section [Available options](#available-options-for-mongomemoryserver)).

### Requirements

- NodeJS: 12.22+
- Typescript: 4.0+ (if used)

And one of those:

- having `lsb-core` installed (or any that provides the `lsb_release` command)
- having an `/etc/os-release` file that is compliant to the [OS-Release Spec](https://www.freedesktop.org/software/systemd/man/os-release.html)
- having an `/etc/*-release` file that is compliant to the [OS-Release Spec](https://www.freedesktop.org/software/systemd/man/os-release.html) (and does not include `lsb`)
- manually specify which version & system should be used

### Known Issues

[Known Issues in the Documentation](https://nodkz.github.io/mongodb-memory-server/docs/guides/known-issues)

### Choose the Correct Package

[Choose the right package for the task](https://nodkz.github.io/mongodb-memory-server/docs/guides/quick-start-guide#choose-the-right-package)

### Configuring which mongod binary to use

The default behavior is that version ~~`latest`~~`4.0.25` for your OS will be downloaded. By setting [Environment variables](https://nodkz.github.io/mongodb-memory-server/docs/api/config-options) you are able to specify which version and binary will be downloaded:

```sh
export MONGOMS_DOWNLOAD_URL=https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu1804-4.2.8.tgz
export MONGOMS_VERSION=4.2.8
```

## Usage

### Simple server start

```js
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = await MongoMemoryServer.create();

const uri = mongod.getUri();

// some code
//   ... where you may use `uri` for as a connection string for mongodb or mongoose

// you may get instance info
console.log(mongod.instanceInfo); // return Object with instance data

// you may stop mongod manually
await mongod.stop();

// even you forget to stop `mongod` when you exit from script
// special childProcess killer will shutdown it for you
```

### Available options for MongoMemoryServer

All options are optional.

```js
const mongod = await MongoMemoryServer.create({
  instance: {
    port?: number, // by default choose any free port
    ip?: string, // by default '127.0.0.1', for binding to all IP addresses set it to `::,0.0.0.0`,
    dbName?: string, // by default generate random dbName
    dbPath?: string, // by default create in temp directory
    storageEngine?: string, // by default `ephemeralForTest`, available engines: [ 'devnull', 'ephemeralForTest', 'mmapv1', 'wiredTiger' ]
    replSet?: string, // by default no replica set, replica set name
    auth?: boolean, // by default `mongod` is started with '--noauth', start `mongod` with '--auth'
    args?: string[], // by default no additional arguments, any additional command line arguments for `mongod` `mongod` (ex. ['--notablescan'])
  },
  binary: {
    version?: string, // by default '4.0.25'
    downloadDir?: string, // by default node_modules/.cache/mongodb-memory-server/mongodb-binaries
    platform?: string, // by default os.platform()
    arch?: string, // by default os.arch()
    checkMD5?: boolean, // by default false OR process.env.MONGOMS_MD5_CHECK
    systemBinary?: string, // by default undefined or process.env.MONGOMS_SYSTEM_BINARY
  },
  autoStart?: boolean, // by default true
});
```

### Replica Set start

```js
import { MongoMemoryReplSet } from 'mongodb-memory-server';

const replSet = new MongoMemoryReplSet({
  replSet: { storageEngine: 'wiredTiger' },
});
await replSet.waitUntilRunning();
const uri = await replSet.getUri();
// or you may obtain the connection config parts:
// const port = await replSet.getPort();
// const dbPath = await replSet.getDbPath();
// const dbName = await replSet.getDbName();

// some code, eg. for mongoose
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// after some useful code don't forget to disconnect
mongoose.disconnect();

// stop replica set manually
replSet.stop();
// or it should be stopped automatically when you exit from script
```

### Available options for MongoMemoryReplSet

All options are optional.

```js
const replSet = new MongoMemoryReplSet({
  autoStart, // same as for MongoMemoryServer
  binary: binaryOpts, // same as for MongoMemoryServer
  instanceOpts: [
    {
      args, // any additional instance specific args
      port, // port number for the instance
      dbPath, // path to database files for this instance
      storageEngine, // same storage engine options
    },
    // each entry will result in a MongoMemoryServer
  ],
  // unless otherwise noted below these values will be in common with all instances spawned.
  replSet: {
    name, // replica set name (default: 'testset')
    auth, //  enable auth support? (default: false)
    args, // any args specified here will be combined with any per instance args from `instanceOpts`
    count, // number of `mongod` processes to start; (default: 1)
    dbName, // default database for db URI strings. (default: uuid.v4())
    ip, // by default '127.0.0.1', for binding to all IP addresses set it to `::,0.0.0.0`
    oplogSize, // size (in MB) for the oplog; (default: 1)
    spawn, // spawn options when creating the child processes
    storageEngine, // default storage engine for instance. (Can be overridden per instance)
    configSettings: {
      // Optional settings for replSetInitiate command. See https://docs.mongodb.com/manual/reference/command/replSetInitiate/
      chainingAllowed: boolean, // When true it allows secondary members to replicate from other secondary members. When false, secondaries can replicate only from the primary.
      heartbeatTimeoutSecs: number, // Number of seconds that the replica set members wait for a successful heartbeat from each other. If a member does not respond in time, other members mark the delinquent member as inaccessible.
      heartbeatIntervalMillis: number, // The frequency in milliseconds of the heartbeats.
      electionTimeoutMillis: number, // The time limit in milliseconds for detecting when a replica set’s primary is unreachable.
      catchUpTimeoutMillis: number, // Time limit for a newly elected primary to sync (catch up) with the other replica set members that may have more recent writes.
    },
  },
});
```

### Config Options

[Documentation of Config Options](https://nodkz.github.io/mongodb-memory-server/docs/api/config-options)

### Simple test with MongoClient

Take a look at this [test file](https://github.com/nodkz/mongodb-memory-server/blob/master/packages/mongodb-memory-server-core/src/__tests__/singleDB.test.ts).

### Provide connection string to mongoose

```js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongoServer = new MongoMemoryServer();

mongoose.Promise = Promise;
mongoServer.getUri().then((mongoUri) => {
  const mongooseOpts = {
    // options for mongoose 4.11.3 and above
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    useMongoClient: true, // remove this line if you use mongoose 5 and above
  };

  mongoose.connect(mongoUri, mongooseOpts);

  mongoose.connection.on('error', (e) => {
    if (e.message.code === 'ETIMEDOUT') {
      console.log(e);
      mongoose.connect(mongoUri, mongooseOpts);
    }
    console.log(e);
  });

  mongoose.connection.once('open', () => {
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  });
});
```

For additional information I recommend you to read this article [Testing a GraphQL Server using Jest with Mongoose](https://medium.com/entria/testing-a-graphql-server-using-jest-4e00d0e4980e)

### Several mongoose connections simultaneously

```js
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

mongoose.Promise = Promise;

const mongoServer1 = new MongoMemoryServer();
const mongoServer2 = new MongoMemoryServer();

// Firstly create connection objects, which you may import in other files and create mongoose models.
// Connection to databases will be estimated later (after model creation).
const connections = {
  conn1: mongoose.createConnection(),
  conn2: mongoose.createConnection(),
  conn3: mongoose.createConnection(),
};

const mongooseOpts = { // options for mongoose 4.11.3 and above
  promiseLibrary: Promise;
  autoReconnect: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000,
  useMongoClient: true, // remove this line if you use mongoose 5 and above
};

mongoServer1.getUri('server1_db1').then((mongoUri) => {
  connections.conn1.open(mongoUri, mongooseOpts);
  connection.once('open', () => {
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  });
});

mongoServer1.getUri('server1_db2').then((mongoUri) => {
  connections.conn2.open(mongoUri, mongooseOpts);
  connection.once('open', () => {
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  });
});

mongoServer2.getUri('server2_db').then((mongoUri) => {
  connections.conn3.open(mongoUri, mongooseOpts);
  connection.once('open', () => {
    console.log(`MongoDB successfully connected to ${mongoUri}`);
  });
});

export default connections;


// somewhere in other file
import { Schema } from 'mongoose';
import { conn1, conn2, conn3 } from './file_above';

const userSchema = new Schema({
  name: String,
});

const taskSchema = new Schema({
  userId: String,
  task: String,
});

export default {
  User: conn1.model('user', userSchema),
  Task: conn2.model('task', taskSchema),
  UserOnServer2: conn3.model('user', userSchema),
}
```

Note: When you create mongoose connection manually, you should do:

```js
import mongoose from 'mongoose';

const opts = { useMongoClient: true }; // remove this option if you use mongoose 5 and above
const conn = mongoose.createConnection(); // just create connection instance
const User = conn.model('User', new mongoose.Schema({ name: String })); // define model
conn.open(uri, opts); // open connection to database (NOT `connect` method!)
```

With default connection:

```js
import mongoose from 'mongoose';

const opts = { useMongoClient: true }; // remove this option if you use mongoose 5 and above
mongoose.connect(uri, opts);
const User = mongoose.model('User', new mongoose.Schema({ name: String })); // define model
```

### Integration Examples

[Documentation for Integration Examples](https://nodkz.github.io/mongodb-memory-server/docs/guides/integration-examples)

### AVA test runner

For AVA written [detailed tutorial](https://github.com/zellwk/ava/blob/8b7ccba1d80258b272ae7cae6ba4967cd1c13030/docs/recipes/endpoint-testing-with-mongoose.md) how to test mongoose models by @zellwk.

### Docker Alpine

There isn't currently an official MongoDB release for alpine linux. This means that we can't pull binaries for Alpine
(or any other platform that isn't officially supported by MongoDB), but you can use a Docker image that already has mongod
built in and then set the MONGOMS_SYSTEM_BINARY variable to point at that binary. This should allow you to use
mongodb-memory-server on any system on which you can install mongod.

### Enable Debug Mode

The Debug mode can be enabled with an Environment-Variable or in the package.json "config" section:

```sh
MONGOMS_DEBUG=1 # also available case-insensitive values: "on" "yes" "true"
```

or

```json
{
  "config": {
    "mongodbMemoryServer": {
      "debug": "1", // also available case-insensitive values: "on" "yes" "true"
    }
  }
}
```

## CI

**It is very important** to limit spawned number of Jest workers for avoiding race condition. Cause Jest spawn huge amount of workers for every node environment on same machine. [More details](https://github.com/facebook/jest/issues/3765)
Use `--maxWorkers 4` or `--runInBand` option.

script:

```diff
-  yarn run coverage
+  yarn run coverage -- --maxWorkers 4
```

## Contributing

Contributing Guidelines are setup in [CONTRIBUTING](./.github/CONTRIBUTING.md)

## Join Our Discord Server

To ask questions or just talk with us, [join our Discord Server](https://discord.gg/bgCrRP9).

## Documentation

- [Documentation](https://nodkz.github.io/mongodb-memory-server/docs/api/index-api)
- [Quick start guide](https://nodkz.github.io/mongodb-memory-server/docs/guides/quick-start-guide/)

## Credits

Inspired by alternative runners for [mongodb-prebuilt](https://github.com/winfinit/mongodb-prebuilt):

- [mockgoose](https://github.com/mockgoose/Mockgoose)
- [mongomem](https://github.com/CImrie/mongomem)

## Maintainers

- [@nodkz](https://github.com/nodkz) Pavel Chertorogov
- [@AJRdev](https://github.com/AJRdev) Andre Ranarivelo
- [@hasezoey](https://github.com/hasezoey)

## Contributors

This project exists thanks to all the people who contribute.
<a href="graphs/contributors"><img src="https://opencollective.com/mongodb-memory-server/contributors.svg?width=890&button=false" /></a>

## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/mongodb-memory-server#backer)]

<a href="https://opencollective.com/mongodb-memory-server#backers" target="_blank"><img src="https://opencollective.com/mongodb-memory-server/backers.svg?width=890"></a>

## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/mongodb-memory-server#sponsor)]

<a href="https://opencollective.com/mongodb-memory-server/sponsor/0/website" target="_blank"><img src="https://opencollective.com/mongodb-memory-server/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/mongodb-memory-server/sponsor/1/website" target="_blank"><img src="https://opencollective.com/mongodb-memory-server/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/mongodb-memory-server/sponsor/2/website" target="_blank"><img src="https://opencollective.com/mongodb-memory-server/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/mongodb-memory-server/sponsor/3/website" target="_blank"><img src="https://opencollective.com/mongodb-memory-server/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/mongodb-memory-server/sponsor/4/website" target="_blank"><img src="https://opencollective.com/mongodb-memory-server/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/mongodb-memory-server/sponsor/5/website" target="_blank"><img src="https://opencollective.com/mongodb-memory-server/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/mongodb-memory-server/sponsor/6/website" target="_blank"><img src="https://opencollective.com/mongodb-memory-server/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/mongodb-memory-server/sponsor/7/website" target="_blank"><img src="https://opencollective.com/mongodb-memory-server/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/mongodb-memory-server/sponsor/8/website" target="_blank"><img src="https://opencollective.com/mongodb-memory-server/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/mongodb-memory-server/sponsor/9/website" target="_blank"><img src="https://opencollective.com/mongodb-memory-server/sponsor/9/avatar.svg"></a>

## License

MIT
