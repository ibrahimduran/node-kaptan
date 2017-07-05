import 'mocha';
import { assert } from 'chai';

import * as texts from '../../build/util/texts';

describe('Utils/texts', function () {
  it('should convert to hyphen space', function () {
    const tests = {
      'hyphen-space': 'Hyphen Space',
      'hello-world': 'HelloWorld',
      'foo-bar': 'fooBar',
      'one-two-three-four': 'oneTwoThreeFour'
    };

    Object.keys(tests).map(v => assert.equal(v, texts.toHyphenSpace(v)));
  });
});
