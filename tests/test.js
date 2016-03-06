/**
 * test.js
 *
 * @author Yaroslav Pogrebnyak <yyyaroslav@gmail.com>
 */

'use strict';

const _ = require('lodash'),
      Autowired = require('../lib/autowired');

module.exports = {

    simple: (test) => {

        console.log('-- Start scanning');

        new Autowired('App').scan(__dirname + '/beans', (err, context) => {

             if (err) {
                 return console.log(err);
             }

             console.log('-- Context initialize done');

             context.getBean('Bean').doWork();

             console.log('-- Shutting down');

             context.shutdown(function() {
                console.log('-- Shutdown done');
                test.done();
             });
        });
    },

    circular: (test) => {

        console.log('-- Start scanning');

        new Autowired('App').scan(__dirname + '/beans-circular', (err, context) => {

             if (err) {
                 return console.log(err);
             }

             console.log('-- Context initialize done');

             context.getBean('Bean').doWork();
             context.getBean('Another').doWork();

             console.log('-- Shutting down');

             context.shutdown(function() {
                console.log('-- Shutdown done');
                test.done();
             });
        });
    },

    brokenBean: (test) => {

        console.log('-- Start scanning');

        new Autowired('App').scan(__dirname + '/beans-broken', (err, context) => {

            test.ok(err, 'Have error ' + err);
            test.done();

        });
    },

    brokenBean2: (test) => {

        console.log('-- Start scanning');

        new Autowired('App').scan(__dirname + '/beans-broken2', (err, context) => {

            test.ok(err, 'Have error ' + err);
            test.done();

        });
    },

    unresolvedBean: (test) => {

        console.log('-- Start scanning');

        new Autowired('App').scan(__dirname + '/beans-unresolved', (err, context) => {

            test.ok(err, 'Have error ' + err);
            test.done();

        });
    },


    badfilesBean: (test) => {

        console.log('-- Start scanning');

        new Autowired('App').scan(__dirname + '/beans-badfiles', (err, context) => {

            test.ok(_.isNull(err) , 'No errors');
            test.done();

        });
    },

    /**
     * When bean wants $context and then use
     * it to get another still not initialized bean with $context.getBean,
     * it should not fail. So when bean depends on $context, it should
     * wait until all other beans gets initialized and then call afterPropertiesSet method
     */
    autowiringContext: (test) => {

        console.log('-- Start scanning');

        new Autowired('App').scan(__dirname + '/beans-autowiringcontext', (err, context) => {

            test.ok(_.isNull(err) , 'No errors');
            test.done();

        });
    },
};
