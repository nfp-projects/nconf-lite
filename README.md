# nconf-lite

Nconf-lite is a complete re-written design of original nconf with zero dependancy, tiny and fast while maintaining most if not all of the documented features of the old nconf.

It is a hierarchical node.js configuration with files, environment variables, and atomic object merging.

Compared to nconf running at 952KB with over 220 files *installed*, nconf-lite is clocking at measly 42KB with only 11 files of easily reviewable code and a ton more unit test, testing almost every micro functionality.

## Example
Using nconf is easy; it is designed to be a simple key-value store with support for both local and remote storage. Keys are namespaced and delimited by `:`. Let's dive right into sample usage:

``` js
  import Nconf from 'nconf-lite'
  const nconf = new Nconf()

  //
  // Setup nconf to use (in-order):
  //   2. Environment variables
  //   3. A file located at 'path/to/config.json'
  //
  nconf.env()
   .file({ file: 'path/to/config.json' });

  //
  // Set a few variables on `nconf`.
  //
  nconf.set('database:host', '127.0.0.1');
  nconf.set('database:port', 5984);

  //
  // Get the entire database object from nconf. This will output
  // { host: '127.0.0.1', port: 5984 }
  //
  console.log('foo: ' + nconf.get('foo'));
  console.log('NODE_ENV: ' + nconf.get('NODE_ENV'));
  console.log('database: ' + nconf.get('database'));

  //
  // Save the configuration object to disk
  //
  nconf.save()
```

If you run the above script:

``` bash
  $ NODE_ENV=production sample.js
```

The output will be:

```
  NODE_ENV: production
  database: { host: '127.0.0.1', port: 5984 }
```

## Hierarchical configuration

Configuration management can get complicated very quickly for even trivial applications running in production. `nconf` addresses this problem by enabling you to setup a hierarchy for different sources of configuration with no defaults. **The order in which you attach these configuration sources determines their priority in the hierarchy.** Let's take a look at the options available to you

  2. **nconf.env(options)** Loads `process.env` into the hierarchy.
  3. **nconf.file(options)** Loads the configuration data at options.file into the hierarchy.
  4. **nconf.defaults(options)** Loads the data in options.store into the hierarchy.
  5. **nconf.overrides(options)** Loads the data in options.store into the hierarchy.

A sane default for this could be:

``` js
  import Nconf from 'nconf-lite'
  const nconf = new Nconf()

  //
  // 1. any overrides
  //
  nconf.overrides({
    'always': 'be this value'
  });

  //
  // 2. `process.env`
  //
  nconf.env();

  //
  // 4. Values in `config.json`
  //
  nconf.file('/path/to/config.json');

  //
  // Or with a custom name
  // Note: A custom key must be supplied for hierarchy to work if multiple files are used.
  //
  nconf.file('custom', '/path/to/config.json');

  //
  // 5. Any default values
  //
  nconf.defaults({
    'if nothing else': 'use this value'
  });
```

## API Documentation

### nconf.any(names, callback)
Given a set of key names, gets the value of the first key found to be truthy. The key names can be given as separate arguments
or as an array. If the last argument is a function, it will be called with the result; otherwise, the value is returned.

``` js
  //
  // Get one of 'NODEJS_PORT' and 'PORT' as a return value
  //
  let port = nconf.any('NODEJS_PORT', 'PORT');
```

### nconf.use(name)
Fetch a specific store with the specified name.

``` js
  //
  // Load a file store onto nconf with the specified settings
  //
  nconf.file('custom', '/path/to/config.json');
  //
  // Grab the instance and set it to be readonly
  //
  nconf.use('custom').readOnly = true
```

### nconf.required(keys)
Declares a set of string keys to be mandatory, and throw an error if any are missing.

``` js
  nconf.defaults({
    keya: 'a',
  });

  nconf.required(['keya', 'keyb']);
  // Error: Missing required keys: keyb
```
You can also chain `.required()` calls when needed. for example when a configuration depends on another configuration store

```js
config
  .env()
  .required([ 'STAGE']) //here you should have STAGE otherwise throw an error
  .file( 'stage', path.resolve( 'configs', 'stages', config.get( 'STAGE' ) + '.json' ) )
  .required([ 'OAUTH:redirectURL']) // here you should have OAUTH:redirectURL, otherwise throw an error
  .file( 'oauth', path.resolve( 'configs', 'oauth', config.get( 'OAUTH:MODE' ) + '.json' ) )
  .file( 'app', path.resolve( 'configs', 'app.json' ) )
  .required([ 'LOGS_MODE']) // here you should haveLOGS_MODE, otherwise throw an error
  .literal( 'logs', require( path.resolve( 'configs', 'logs', config.get( 'LOGS_MODE' ) + '.js') ))
  .defaults( defaults );
```

## Storage Engines

### Memory
A simple in-memory storage engine that stores a nested JSON representation of the configuration. To use this engine, just call `.use()` with the appropriate arguments. All calls to `.get()`, `.set()`, `.clear()`, `.reset()` methods are synchronous since we are only dealing with an in-memory object.

``` js
  nconf.use('memory');
```

### Env
Responsible for loading the values parsed from `process.env` into the configuration hierarchy.
By default, the env variables values are loaded into the configuration as strings.

#### Options

##### `lowerCase: {true|false}` (default: `false`)
Convert all input keys to lower case. Values are not modified.

If this option is enabled, all calls to `nconf.get()` must pass in a lowercase string (e.g. `nconf.get('port')`)

##### `parseValues: {true|false}` (default: `false`)
Attempt to parse well-known values (e.g. 'false', 'true', 'null', 'undefined', '3', '5.1' and JSON values)
into their proper types. If a value cannot be parsed, it will remain a string.

##### `transform: function(obj)`
Pass each key/value pair to the specified function for transformation.

The input `obj` contains two properties passed in the following format:
```
{
  key: '<string>',
  value: '<string>'
}
```

The transformation function may alter both the key and the value.

The function may return either an object in the asme format as the input or a value that evaluates to false.
If the return value is falsey, the entry will be dropped from the store, otherwise it will replace the original key/value.

*Note: If the return value doesn't adhere to the above rules, an exception will be thrown.*

#### Examples

``` js
  //
  // Can optionally also be an Array of values to limit process.env to.
  //
  nconf.env(['only', 'load', 'these', 'values', 'from', 'process.env']);

  //
  // Can also specify a separator for nested keys (instead of the default ':')
  //
  nconf.env({ separator: '__' });
  // Get the value of the env variable 'database__host'
  let dbHost = nconf.get('database:host');

  //
  // Can also lowerCase keys.
  // Especially handy when dealing with environment variables which are usually
  // uppercased.
  //

  // Given an environment variable PORT=3001
  nconf.env();
  let port = nconf.get('port') // undefined

  nconf.env({ lowerCase: true });
  let port = nconf.get('port') // 3001

  //
  // Or use all options
  //
  nconf.env({
    separator: '__',
    match: /^whatever_matches_this_will_be_whitelisted/
    whitelist: ['database__host', 'only', 'load', 'these', 'values', 'if', 'whatever_doesnt_match_but_is_whitelisted_gets_loaded_too'],
    lowerCase: true,
    parseValues: true,
    transform: function(obj) {
      if (obj.key === 'foo') {
        obj.value = 'baz';
      }
      return obj;
    }
  });
  let dbHost = nconf.get('database:host');
```

### Literal
Loads a given object literal into the configuration hierarchy. Both `nconf.defaults()` and `nconf.overrides()` use the Literal store.

``` js
  nconf.defaults({
    'some': 'default value'
  });
```

### File
Based on the Memory store, but provides additional methods `.save()` and `.load()` which allow you to read your configuration to and from file. As with the Memory store, all method calls are synchronous includ `.save()` and `.load()`.

It is important to note that setting keys in the File engine will not be persisted to disk until a call to `.save()` is made. Note a custom key must be supplied as the first parameter for hierarchy to work if multiple files are used.

``` js
  nconf.file('path/to/your/config.json');
  // add multiple files, hierarchically. notice the unique key for each file
  nconf.file('user', 'path/to/your/user.json');
  nconf.file('global', 'path/to/your/global.json');

  // Set a variable in the user store and save it
  nconf.user('user').set('some:variable', true)
  nconf.user('user').save()
```

The file store is also extensible for multiple file formats, defaulting to `JSON`. To use a custom format, simply pass a format object to the `.use()` method. This object must have `.parse()` and `.stringify()` methods just like the native `JSON` object.

If the file does not exist at the provided path, the store will simply be empty.

#### Encrypting file contents

Encryption and decrypting file contents using the `secure` option:

``` js
nconf.file('secure-file', {
  file: 'path/to/secure-file.json',
  secure: {
    secret: 'super-secretzzz-keyzz',
    alg: 'aes-256-ctr'
  }
})
```

This will encrypt each key using [`crypto.createCipheriv`](https://nodejs.org/api/crypto.html#crypto_crypto_createcipheriv_algorithm_key_iv_options), defaulting to `aes-256-ctr`. The encrypted file contents will look like this:

```
{
  "config-key-name": {
    "alg": "aes-256-ctr", // cipher used
    "value": "af07fbcf",   // encrypted contents
    "iv": "49e7803a2a5ef98c7a51a8902b76dd10" // initialization vector
  },
  "another-config-key": {
    "alg": "aes-256-ctr",   // cipher used
    "value": "e310f6d94f13", // encrypted contents
    "iv": "b654e01aed262f37d0acf200be193985" // initialization vector
  },
}
```

## Installation
``` bash
  npm install nconf-lite --save
```

## Run Tests
Tests are written in vows and give complete coverage of all APIs and storage engines.

``` bash
  $ npm test
```

#### Original author: [Charlie Robbins](http://nodejitsu.com)
#### Rewriter of all that garbage: TheThing
#### License: MIT

[0]: http://github.com/nfp-projects/nconf-lite
