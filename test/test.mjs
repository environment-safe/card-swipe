/* global describe:false */
import { chai } from '@environment-safe/chai';
import { it } from '@open-automaton/moka';
import { Scanner, CardSwipe, fake } from '../src/index.mjs';
const should = chai.should();

describe('CardSwipe', ()=>{
    describe('performs a simple test suite', ()=>{
        it('can detect a card swipe', function(done){
            should.exist(Scanner);
            should.exist(CardSwipe);
            var scanner = new Scanner();
            new CardSwipe({
                scanner : scanner,
                onScan : function(swipeData){
                    swipeData.should.have.property('account');
                    swipeData.should.have.property('name');
                    swipeData.should.have.property('exp_year');
                    swipeData.should.have.property('exp_month');
                    swipeData.should.have.property('expiration');
                    swipeData.should.have.property('track_one');
                    //swipeData.should.have.property('track_two');
                    swipeData.should.have.property('type');
                    done();
                }
            });
            fake(scanner);
        });
    });
});

