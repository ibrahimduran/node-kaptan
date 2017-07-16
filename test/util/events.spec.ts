import 'mocha';
import { assert } from 'chai';

import { Events } from '../../build/util/events';

describe('Utils/events', function () {
  it('should run callbacks sync', function (done) {
    var completed = 0;
    var complete = () => {
      completed++;
      if (completed == 5) {
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

    Events.runIntercepted(callbacks).then(() => done());    
  });

  it('should handler intercepted events', async function () {
    const em = new Events();

    em.onIntercepted('increment', (data) => {
      data.num++;
    });
    
    em.onIntercepted('increment', (data) => {
      data.num++;
    });

    em.onceIntercepted('increment', (data) => {
      data.num++;
    });

    let data = { num: 0 };
    
    await em.emitIntercepted('increment', data);
    assert.equal(data.num, 3);
    
    data.num = 0;
    
    await em.emitIntercepted('increment', data);
    assert.equal(data.num, 2);
  });
});


