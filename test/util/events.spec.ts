import 'mocha';

import { emitEventsSync } from '../../build/util/events';

describe('Utils/events', function () {
  it('should emit events sync with callback and promise support', function (done) {
    var completed = 0;
    var complete = () => {
      completed++;
      if (completed == 4) {
        done();
      }
    };

    var callbacks = [
      () => (
        (next: Function) => {
          next();
          complete();
        }
      ),
      () => {
        complete();
        return 'foo bar';
      },
      () => {
        complete();
      },
      () => (
        new Promise((resolve, reject) => {
          resolve();
          complete();
        })
      )
    ];

    emitEventsSync(callbacks);
  });
});
