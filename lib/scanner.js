/**
 * scanner.js - es2015 scanner
 *
 * @author Yaroslav Pogrebnyak <yyyaroslav@gmail.com>
 */

'use strict';

var _ = require('lodash'),
    fs = require('fs'),
    esprima = require('esprima'), 
    estraverse = require('estraverse');

/**
 * Find annotations in the comments AST
 */
var findAnnotations = (comments) => {
    var ants = {};

    _.each(comments, (c) => {

        var annotations = c.value.match(/@((\w+)(\(.*?\))?)/g);

        _.each(annotations, (a) => {
            var r = a.match(/@((\w+)(\((.*)?\))?)/);
            var args = _.map(esprima.parse(r[1]).body[0].expression.arguments, (a) => 
                a.value || {[a.properties[0].key.name]: a.properties[0].value.value});
            _.merge(ants, {
                [r[2]] : args
            });
        });
    });

    return ants;
};

/**
 * Process JS ast tree and return
 * parts of code with bound annotations
 */
var processAst = (ast) => {

    var result = {};

    _.each(ast.body, (o) => {

        // Discard not module.exported classes
        if ( !(
            o.type == 'ExpressionStatement' &&
            o.expression.operator === '='  &&
            o.expression.left.object.name == 'module' &&
            o.expression.left.property.name == 'exports' &&
            o.expression.right.type == 'ClassExpression')) {
                return;
        }

        var ants = findAnnotations(o.leadingComments);

        if (!ants) {
            return;
        }

        var bodyAnts = {};

        _.each(o.expression.right.body.body, (o) => {

            if (!_.contains(['get', 'method'], o.kind)) {
                return;
            }

            bodyAnts[o.kind] = bodyAnts[o.kind] || {};
            _.merge(bodyAnts[o.kind], {
                [o.key.name] : findAnnotations(o.leadingComments)
            });

        });

        result = _.merge({
            bean: ants,
            className: o.expression.right.id.name
        }, bodyAnts);

        return;
    });


    return result;
};


/**
 * Process file and find annotations
 */
module.exports = (path, callback) => {

    var code = fs.readFileSync(path).toString(),
        ast = null,
        ants = null;

    try {
        ast = esprima.parse(code, {
            comment: true,
            range: true,
            tokens: true
        });

        ast = estraverse.attachComments(ast, ast.comments, ast.tokens);
        ants = processAst(ast);

    } catch(e) {
        e.fileName = path;
        return callback(e);
    }

    if (!ants || !ants.bean || !ants.bean.Bean) {
        return callback();
    }

    /* transform found ants to a descriptor */
    var descriptor = {
        name: ants.bean.Bean[0] || ants.className,
        class: require(path),
        autowired: [],
        initialize: null,
        afterPropertiesSet: null,
        destroy: null,
    };


    /* find annotated methods */
    _.each(ants.method, function(v,k) {

          if (!_.isUndefined(v.Initialize)) {
                descriptor.initialize = k;
                return;
          }

          if (!_.isUndefined(v.AfterPropertiesSet)) {
              descriptor.afterPropertiesSet = k;
              return;
          }

          if (!_.isUndefined(v.Destroy)) {
              descriptor.destroy = k;
              return;
          }
    });


    /* find autowires */
    _.each(ants.get, function(v, k) {

         if (_.isUndefined(v.Autowired)) {
             return;
         }

        descriptor.autowired.push({
            'var': k,
            'val': v.Autowired[0] || k
        });

    });

    if (!descriptor.name) {
        return callback(null, {});
    }

    return callback(null, descriptor);
}


