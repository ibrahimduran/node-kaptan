# Kaptan
> All in one micro-service framework with minimum dependencies and fast, simple design. Most suitable for distributed applications and applications that serves multiple endpoints. The main concept behind _Kaptan_ framework is using services to develop application.


## Getting Started
You can install _Kaptan_ framework from npm. For TypeScript users, all type definitions are served with the main package, you don't need to install it separately.
```sh
$ npm install --save kaptan
```

### Creating an application
```js
import { Kaptan } from 'kaptan';

// first param is optional and it's used in logs to prevent mess
// when you have multiple instances
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
```js
// you can install services from npm
import { CustomService } from 'kaptan-foo-bar';

// second param is used to specify options for service
kaptan.use(CustomService, { X: false });
```

### Starting application
This will fire up application and create service instances.
```js
kaptan.start();
```

### Developing Services
```js
import { Service } from 'kaptan';

// Services are created by extending Service class
class MyService extends Service {
  // Service class takes kaptan instances as the first param
  constructor(kaptan) {
    // You can use this kaptan object to access other
    // services and util methods
    const fooBar = kaptan.services.spawn('FooBar');
  }
}
```