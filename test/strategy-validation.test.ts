import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { use } from './chai-passport-strategy';

import { JwtStrategy as Strategy } from '../src/strategy';
import * as testData from './testdata';
import { fromAuthHeaderAsBearerToken } from '../src/extract-jwt';
import { jsonWebTokenVerifier } from '../src/json-web-token-verifier';

describe('Strategy validation', () => {
  describe('calling JWT validation function', () => {
    it('should call with the right secret as an argument', (done) => {
      const verifyStub = sinon.stub();
      verifyStub.callsArgWith(1, null, {}, {});

      const verifyJwtStub = sinon.stub();
      verifyJwtStub.resolves(testData.payload);

      const strategy = new Strategy(
        {
          secretOrKey: 'secret',
          verifyJwt: verifyJwtStub,
          verifyJwtOptions: {
            algorithms: ['HS256', 'HS384'],
            issuer: 'TestIssuer',
            audience: 'TestAudience',
            clockTolerance: 10,
            maxAge: '1h',
            ignoreExpiration: false,
          },
          extractToken: fromAuthHeaderAsBearerToken(),
        },
        verifyStub
      );

      use(strategy, done)
        .success(() => {
          expect(verifyJwtStub.args[0][0]).to.have.property(
            'secretOrKey',
            'secret'
          );
          expect(verifyJwtStub.args[0][0]).to.have.property('options');
          expect(verifyJwtStub.args[0][0].options).to.deep.equal({
            algorithms: ['HS256', 'HS384'],
            issuer: 'TestIssuer',
            audience: 'TestAudience',
            clockTolerance: 10,
            maxAge: '1h',
            ignoreExpiration: false,
          });
        })
        .req((req) => {
          req.headers['authorization'] = 'bearer ' + testData.token;
        })
        .authenticate();
    });
  });

  describe('handling valid jwt', () => {
    it('should call verify with the correct payload', (done) => {
      const verifyJwtStub = sinon.stub();
      verifyJwtStub.resolves(testData.payload);

      const strategy = new Strategy(
        {
          extractToken: fromAuthHeaderAsBearerToken(),
          secretOrKey: 'secret',
          verifyJwt: verifyJwtStub,
        },
        ({ payload }, next) => {
          next(null, payload, {});
        }
      );

      use(strategy, done)
        .success((payload) => {
          expect(payload).to.deep.equal(testData.payload);
        })
        .req((req) => {
          req.headers['authorization'] = 'bearer ' + testData.token;
        })
        .authenticate();
    });
  });

  describe('handling failing jwt', () => {
    it('should not call verify and fail with error message', (done) => {
      const verifySpy = sinon.spy();

      const verifyJwtStub = sinon.stub();
      verifyJwtStub.rejects(new Error('jwt expired'));

      const strategy = new Strategy(
        {
          extractToken: fromAuthHeaderAsBearerToken(),
          secretOrKey: 'secret',
          verifyJwt: verifyJwtStub,
        },
        verifySpy
      );

      use(strategy, done)
        .fail((info) => {
          sinon.assert.notCalled(verifySpy);
          expect(info).to.have.property('message', 'jwt expired');
        })
        .req((req) => {
          req.headers['authorization'] = 'bearer ' + testData.token;
        })
        .authenticate();
    });
  });

  describe('handling an invalid authentication header', () => {
    it('should not call verify and fail with error message', (done) => {
      const verifySpy = sinon.spy();

      const strategy = new Strategy(
        {
          extractToken: fromAuthHeaderAsBearerToken(),
          secretOrKey: 'secret',
          verifyJwt: jsonWebTokenVerifier,
        },
        verifySpy
      );

      use(strategy, done)
        .fail((info) => {
          sinon.assert.notCalled(verifySpy);
          expect(info).to.be.an.instanceof(Error);
        })
        .req((req) => {
          req.headers['authorization'] = 'malformed';
        })
        .authenticate();
    });
  });
});
