/**
 * Module dependencies.
 */

import mongoose from 'mongoose';
import chaiHttp from 'chai-http';
import chai from 'chai';

import app from '../../server';

chai.use(chaiHttp);
const { expect } = chai;

    describe('Method Save', function() {
      it('should be able to save whithout problems', function(done) {
         user.save(function(err) {
          should.not.exist(err);
          done();
        });
      });

      it('should be able to show an error when try to save witout name', function(done) {
        user.name = '';
        user.save(function(err) {
          should.exist(err);
          done();
        });
      });
    });

    after(function(done) {
      done();
    });

  });
});
