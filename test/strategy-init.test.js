const { JwtStrategy: Strategy } = require('../lib/strategy');
const { expect } = require('chai');

describe('Strategy init', () => {
  it('should be named jwt', () => {
    const strategy = new Strategy(
      { extractToken: () => {}, secretOrKey: 'secret' },
      () => {}
    );

    expect(strategy.name).to.equal('jwt');
  });

  it('should throw if constructed without a verify callback', () => {
    expect(() => {
      new Strategy({
        extractToken: () => {},
        secretOrKey: 'secret',
      });
    }).to.throw(TypeError, 'JwtStrategy requires a verify callback');
  });

  it('should throw if constructed neither a secretOrKey or a secretOrKeyProvider arg', () => {
    expect(() => {
      new Strategy({ extractToken: () => {}, secretOrKey: null }, () => {});
    }).to.throw(TypeError, 'JwtStrategy requires a secret or key');
  });

  it('should throw if constructed with both a secretOrKey and a secretOrKeyProvider', () => {
    expect(() => {
      new Strategy({
        secretOrKey: 'secret',
        secretOrKeyProvider: () => 'secret',
        extractToken: () => {},
      });
    }).to.throw(TypeError);
  });

  it('should throw if constructed without a extractToken arg', () => {
    expect(() => {
      new Strategy({ secretOrKey: 'secret' }, () => {});
    }).to.throw(TypeError);
  });
});
