var expect = require('chai').expect;

var instructions = require('./../build/server/instructions.js');

describe('instructions module', () => {
  it('is a string', () => {
    expect(instructions).to.be.a('string');
  });
});
