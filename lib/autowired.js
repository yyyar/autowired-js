/**
 * autowired.js
 *
 * @author Yaroslav Pogrebnyak <yyyaroslav@gmail.com>
 */

'use strict';

var _ = require('lodash'),
    fs = require('fs'),
    async = require('async'),
    recursive = require('recursive-readdir');


/**
 * Autowired Context
 */
module.exports = class Autowired {


    /**
     * Creates new instance of Autowired
     */
    constructor(name, config) {

        /**
         * Application Context name
         */
        this.name = name || 'Application';

        /**
         * Bean scanners
         */
        this.scanners = {
            'annotated': require('./scanner')
        };

        /**
         * Configuration
         */
        this.config = _.merge({
            'scan' : {
                'path': null,
                'type': 'annotated',
                'include': [/.+\.js$/],
                'exclude' : ['node_modules']
            }
        }, config);

        /**
         * Registered beans
         */
        this.beans = {
            '$context': this
        };

        /**
         * Descriptors
         */
        this.descriptors = {};

        /**
         * Unresolved beans dependencies
         */
        this.unresolvedDeps = {};
    }


    /**
     * Register beans from descriptors file
     */
    load(path, callback) {

        var self = this;

        var descriptors = require(path);
        _.each(descriptors, (descriptor) => {
            self.register(descriptor);
        });

        return self.validate(callback);
    }


    /**
     * Shutdown context destroying all beans
     */
    shutdown(callback) {

        var self = this;

        async.each(_.keys(self.beans), (name, callback) => {
            var bean = self.beans[name];
            if (bean == self) {
                return callback();
            }
            var destroyName = self.descriptors[name].destroy;
            if (destroyName) {
                bean[destroyName](callback);
            } else {
                callback();
            }
        }, callback);
    }

    /**
     * Scan and register beans
     */
    scan(path, callback) {

        var self = this;

        if (!callback) {
            callback = path;
            path = self.config.scan.path;
        }

        if (!path) {
            callback(new Error('You should provide path as an argument or in config.scan.path variable'));
        }

        recursive(path, self.config.scan.exclude, (err, files) => {
            var i = 0;

            var processFile = (file) => {

                if (!file) {
                    return self.validate(callback);
                }

                // Skip if don't want to scan such file
                for (let re in self.config.scan.include) {
                    re = self.config.scan.include[re];
                    if (! re.exec(file)) {
                        return processFile(files[i++]);
                    }
                } 

                try {
                    self.scanners[self.config.scan.type](file, (err, val) => {

                        if (err) {
                            throw err;
                        }

                        if (val) {
                            return self.register(val, () => {
                                processFile(files[i++]);
                            });
                        }

                        // continue
                        processFile(files[i++]);
                    });
                }
                catch(err) {
                    // Shutdown not fully initialized context
                    self.shutdown(() => {
                          return callback(err);
                    });
                }
            };

            processFile(files[i++]);

        });
    };

    /**
     * Try to inject (resolve) bean obj with name
     * to already registered beans
     */
    resolveDependers(childName, childBean) {

        var self = this;

        _.each(self.unresolvedDeps, (ownerDeps, ownerName) => {

            var owner = self.beans[ownerName];

            var dep = _.remove(ownerDeps, (d) => { return d.val === childName; })[0];
            if (dep) {
                Object.defineProperty(owner, dep.var, {
                    value: childBean,
                    writable: false
                });
            }

            // Remove key if no unresolved dependencies left
            if (_.isEmpty(ownerDeps)) {
                delete self.unresolvedDeps[ownerName];

                if (owner[self.descriptors[ownerName].afterPropertiesSet]) {
                    _.bind(owner[self.descriptors[ownerName].afterPropertiesSet], owner)();
                }
            }
        });
    }

    /**
     * Register bean
     * Descriptor: {
     *   name - bean name,
     *   class - constructor,
     *   initialize - init function name,
     *   autowired: [ {
     *      var - bean variable inject to
     *      val - name of bean to inject
     *   }, ...]
     * }
     */
    register(descriptor, callback) {

        var self = this;

        var beanClass = descriptor.class,
            beanName = descriptor.name;

        self.descriptors[beanName] = descriptor;

        if (!beanClass) {
            beanClass = beanName;
            beanName = beanClass.$bean;
        }

        if (!beanName) {
            callback(new Error('No name provided for bean ' + beanClass));
        }

        if (self.beans[beanName]) {
            callback(new Error(beanName + ' already in context'));
        }

        var bean = self.beans[beanName] = new beanClass();
        bean.$context = self;

        var initialize = descriptor.initialize ?
                            _.bind(bean[descriptor.initialize], bean) :
                            _.bind((c) => { c() }, bean);

        initialize(() => {

            self.resolveDependers(beanName, bean);

            if (descriptor.autowired) {
                _.each(descriptor.autowired, (dep) => {
                    var depName = dep.val;
                    if (self.beans[depName]) {

                          Object.defineProperty(bean, dep.var, {
                              value: self.beans[depName],
                              writable: false
                            });

                    } else {
                        self.unresolvedDeps[beanName] = self.unresolvedDeps[beanName] || [];
                        self.unresolvedDeps[beanName].push(dep);
                    }
                });
            }

            if (_.isEmpty(self.unresolvedDeps[beanName]) && descriptor.afterPropertiesSet && bean[descriptor.afterPropertiesSet]) {
                _.bind(bean[descriptor.afterPropertiesSet], bean)();
            }

            callback();
        });
    }

    /**
     * Get registered bean intance
     */
    getBean(beanName) {
        return this.beans[beanName];
    }

    /**
     * Validate context
     */
    validate(callback) {

         var errs = this.unresolvedDeps;

         if (_.isEmpty(errs)) {
            return callback(null, this);
         }

         var msg = 'Cant resolve few dependencies: ';
         _.each(errs, (deps, name) => {
            msg += name + '(';
            _.each(deps, (dep) => {
                msg += '.' + dep.var + '->' + dep.val;
            });
            msg += '), ';
        });

        this.shutdown(() => {
            callback(new Error(msg));
        });

    }

}

