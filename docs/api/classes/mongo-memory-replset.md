---
id: mongo-memory-replset
title: 'MongoMemoryReplSet'
---

API Documentation of `MongoMemoryReplSet`-Class

## Functions

### new

Typings: `constructor(opts: Partial<MongoMemoryReplSetOpts> = {})`

Create an new ReplSet without starting it

:::tip
When directly starting the replset, [`create`](#create) should be used
:::

### create

Typings: `static async create(opts: Partial<MongoMemoryReplSetOpts> = {}): Promise<MongoMemoryReplSet>`

Create an new ReplSet and start it (while being an Promise)

### stateChange

<span class="badge badge--warning">Internal</span>

Typings: `protected stateChange(newState: MongoMemoryReplSetStates, ...args: any[]): void`

Used to change the state of the class, it is `protected` to not accidentally use it

### getInstanceOpts

<span class="badge badge--warning">Internal</span>

Typings: `protected getInstanceOpts(baseOpts: MongoMemoryInstancePropBase = {}): MongoMemoryInstanceProp`

Constructs the options used for an instance

### getUri

Typings: `getUri(otherDb?: string): string`

Get an mongodb-usable uri (can also be used in mongoose)

### start

Typings: `async start(): Promise<void>`

Used to start an new ReplSet or to Re-Start an stopped ReplSet

:::caution
Will Error if ReplSet is already running
:::

### initAllServers

<span class="badge badge--warning">Internal</span>

Typings: `protected async initAllServers(): Promise<void>`

Used by [`start`](#start) and to restart without fully running everything again

### stop

Typings: `async stop(runCleanup: boolean = true): Promise<boolean>`

Stop an running instance

This function will by default run [`.cleanup`](#cleanup), this must be set to `false` to be able to restart (and an engine other than `ephemeralForTest` must be used)

:::caution
Will not Error if instance is not running
:::

### cleanup

Typings: `async cleanup(force: boolean = false): Promise<void>`

Cleanup all files used by this ReplSet & instances

:::tip
Runs automatically on `process.on('beforeExit')`
:::

### waitUntilRunning

Typings: `async waitUntilRunning(): Promise<void>`

Wait until all instances are running

### _initReplSet

<span class="badge badge--warning">Internal</span>

Typings: `protected async _initReplSet(): Promise<void>`

This is used to connect to the first server and initiate the ReplSet with an command<br/>
Also enables `auth`

### _initServer

<span class="badge badge--warning">Internal</span>

Typings: `protected _initServer(instanceOpts: MongoMemoryInstanceProp): MongoMemoryServer`

Creates an new [`instance`](./mongo-memory-server.md) for the ReplSet

### _waitForPrimary

<span class="badge badge--warning">Internal</span>

Typings: `protected async _waitForPrimary(timeout: number = 30000): Promise<void>`

Wait until the ReplSet has elected an Primary

## Values

### servers

Typings: `servers: MongoMemoryServer[]`

Stores all the servers of this ReplSet

### instanceOpts

Typings:

- `get instanceOpts(): MongoMemoryInstancePropBase[]`
- `set instanceOpts(val: MongoMemoryInstancePropBase[])`

Getter & Setter for [`_instanceOpts`](#_instanceOpts)

:::caution
Will Throw an Error if `state` is not `stopped`
:::

### _instanceOpts

<span class="badge badge--warning">Internal</span>

Typings: `protected _instanceOpts!: MongoMemoryInstancePropBase[]`

Stores Options used for an instance

### binaryOpts

Typings:

- `get binaryOpts(): MongoBinaryOpts`
- `set binaryOpts(val: MongoBinaryOpts)`

Getter & Setter for [`_binaryOpts`](#_binaryOpts)

:::caution
Will Throw an Error if `state` is not `stopped`
:::

### _binaryOpts

<span class="badge badge--warning">Internal</span>

Typings: `protected _binaryOpts!: MongoBinaryOpts`

Stores the options used for the binary

### replSetOpts

Typings:

- `get replSetOpts(): ReplSetOpts`
- `set replSetOpts(val: ReplSetOpts)`

Getter & Setter for [`_replSetOpts`](#_replSetOpts)

:::caution
Will Throw an Error if `state` is not `stopped`
:::

### _replSetOpts

<span class="badge badge--warning">Internal</span>

Typings: `protected _replSetOpts!: Required<ReplSetOpts>`

Stores the options used for the ReplSet Initiation

### state

Typings: `get state(): MongoMemoryReplSetStates`

Getter for [`_state`](#_state)

:::caution
Will Throw an Error if `state` is not `stopped`
:::

### _state

<span class="badge badge--warning">Internal</span>

Typings: `protected _state: MongoMemoryReplSetStates`

Stores the current State

### _ranCreateAuth

<span class="badge badge--warning">Internal</span>

Typings: `protected _ranCreateAuth: boolean`

Stores if the auth creation has already ran
