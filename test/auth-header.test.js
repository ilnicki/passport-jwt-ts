const authHeader = require('../lib/auth-header');

describe('Parsing Auth Header field-value', function () {
  it('Should handle single space separated values', function () {
    const res = authHeader.parse('SCHEME VALUE');
    expect(res).to.deep.equal({ scheme: 'SCHEME', value: 'VALUE' });
  });

  it('Should handle CRLF separator', function () {
    const res = authHeader.parse('SCHEME\nVALUE');
    expect(res).to.deep.equal({ scheme: 'SCHEME', value: 'VALUE' });
  });

  it('Should handle malformed authentication headers with no scheme', function () {
    const res = authHeader.parse('malformed');
    expect(res).to.not.be.ok;
  });

  it('Should return null when the auth header is not a string', function () {
    const res = authHeader.parse({});
    expect(res).to.be.null;
  });
});
