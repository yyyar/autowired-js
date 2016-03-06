/**
 * rest.js
 *
 * @author Yaroslav Pogrebnyak <yyyaroslav@gmail.com>
 */

'use strict';

const _ = require('lodash'),
      Autowired = require('../lib/autowired');

module.exports = {

    simple: (test) => {

        console.log('-- Start scanning');

        new Autowired('App', {
            modules: {
                'rest': {
                    'lib': 'express' //require('express'),
                }
            }
        }).scan(__dirname + '/beans-rest', (err, context) => {

            console.log('Application initialized');

             if (err) {
                 return console.log(err);
             }

        });
    }
}
