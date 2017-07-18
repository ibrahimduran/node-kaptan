# Kaptan [![NPM](https://img.shields.io/npm/v/kaptan.svg)](https://www.npmjs.com/package/kaptan) [![License](https://img.shields.io/npm/l/kaptan.svg)](LICENSE) [![Build Status](https://travis-ci.org/ibrahimduran/node-kaptan.svg?branch=master)](https://travis-ci.org/ibrahimduran/node-kaptan) [![Codecov](https://codecov.io/gh/ibrahimduran/node-kaptan/branch/master/graph/badge.svg)](https://codecov.io/gh/ibrahimduran/node-kaptan)
> All in one micro-service framework with minimum dependencies and simplistic design. Most suitable for distributed applications and applications that serve multiple endpoints. The main concept behind _Kaptan_ framework is using services as parts to build application.

- [Getting Started](#getting-started)
    - [Creating an application](#creating-an-application)
    - [Adding services to application](#adding-services-to-application)
    - [Starting application](#starting-application)
    - [Developing services](#developing-services)
- [Network](#network)
    - [Using the service](#using-the-service)

## Getting Started
You can install _Kaptan_ framework and its services easily from NPM using your favorite tool. 
```sh
$ npm install --save kaptan
# or
$ yarn add kaptan
```
TypeScript users don't need to install any package for type definitions, they're served in the main package.

### Creating an application
First parameter of `Kaptan.constructor` is label for the application. Having a label prevents mess in logs when you have multiple instances of kaptan.
```js
import { Kaptan } from 'kaptan';

const kaptan = new Kaptan('my-app');
```
Or feel free to extend `Kaptan` class:
```js
import { Kaptan } from 'kaptan';

class MyApp extends Kaptan {
  constructor() {
    super();

    // (lines below are only visible to who believes in unicorns)
    // My secret code - start


    // My secret code - end
  }
}

const app = new MyApp();
```

### Adding services to application
Services can be installed from NPM. You can use `Kaptan.use` method to add service and service options.
```js
import { CustomService } from 'kaptan-foo-bar';

kaptan.use(CustomService, { XYZ: false });
```

### Starting application
This will fire up application and create service instances.
```js
kaptan.start();
```

### Developing Services
Services are created by extending Service class. _Service_ constructor takes _kaptan_ intance as first parameter and options object as second. Also `kaptan`, `logger` and `options` properties get set in extended _Service_ constructor.
```js
import { Service } from 'kaptan';

class MyService extends Service {
  constructor(kaptan, options) {
    super(kaptan, {
      XYZ: 'some_default_val',
      ...options
    });

    // theese are automatically set
    console.log(this.kaptan);
    console.log(this.options);
    console.log(this.logger);

    // service dependencies/injections
    const fooBar = kaptan.services.spawn('FooBar');
  }
}
```
You can use `kaptan.services.spawn` method to access service instances.

## Network
> Kaptan framework comes with a built-in Network service to simplify networking. All features of network service is async/await - promise compatible. It currently supports three protocols for sending packets; _Request_/_Response_ for sending request and receiving response synchronously (using promises) and _Raw_ for sending data without waiting for response. 

### Using the service
Kaptan package exports _Network_ namespace which contains _Network_ service. So you'll need to add `Network.Network` as service.

```js
import { Network } from 'kaptan';

kaptan.use(Network.Network, { PORT: 5000 });
```

## License
MIT