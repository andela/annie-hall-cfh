/**
 * Module dependencies.
 */

import mongoose from 'mongoose';
import chaiHttp from 'chai-http';
import chai from 'chai';

import app from '../../server';

chai.use(chaiHttp);
const { expect } = chai;

describe('Intentional test', () => {
  describe('intentional passing test', () => {
    expect(2 + 2).to.equal(4);
  });
});
