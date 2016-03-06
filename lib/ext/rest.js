'use strict';
var _ = require('lodash');

/**
 * REST Module enables using
 * Controller annotation to define controllers
 */
module.exports = class RestModule {

    /**
     * Creates new instance of RestModule
     */
    constructor(lib) {
        this.lib = lib;
    }

    process(context, callback) {

        var self = this;

        var app = _.filter(context.descriptors, (b) => {
            return _.contains(_.keys(b.classAnnotations), 'RestApplication');
        })[0];

        if (!app) {
            return callback();
        }

        var appField = app.classAnnotations.RestApplication;

        if (!appField) {
            return callback();
        }

        var controllers = _.filter(context.descriptors, (b) => {
            return _.contains(_.keys(b.classAnnotations), 'Controller');
        });

        _.each(controllers, (c) => {
            var basePath = c.classAnnotations.Controller[0] || '/';
            var router = require(self.lib).Router();
            context.beans[app.name][appField].use(basePath, router);

           _.each(c.methodAnnotations, (v, k) => {
               if (_.contains(_.keys(v), 'Route')) {
                   router[v.Route[0]](v.Route[1], context.beans[c.name][k]);

                   if (_.contains(_.keys(v), 'Filters')) {
                       console.log(v.Filters);
                   }
               }
           });
        });

        callback();
    }
}
