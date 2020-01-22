/* eslint-disable no-undef */
import { connect } from 'socket.io-client';
import { expect } from 'chai';


describe('Suite of unit tests', () => {
  let socket;

  beforeEach((done) => {
    // Setup
    socket = connect('http://localhost:3001', {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true,
    });
    socket.on('connect', () => {
      console.log('worked...');
      // done();
    });
    socket.on('disconnect', () => {
      console.log('disconnected...');
    });
    done();
  });

  afterEach((done) => {
    // Cleanup
    if (socket.connected) {
      console.log('disconnecting...');
      socket.disconnect();
    } else {
      console.log('no connection to break...');
    }
    done();
  });

  it('should communicate', (done) => {
    socket.once('echo', (message) => {
      // Check that the message matches
      expect(message).to.equal('Hello World');
      done();
    });
  });
});
