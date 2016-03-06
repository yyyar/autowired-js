'use strict';

/**
 * @Bean
 * @Controller('/hello')
 */
module.exports = class HelloController {

    /**
     * @Initialize
     */
    initialize(callback) {
        console.log("Initializing HelloController");
        callback();
    }

    /**
     * @Route('get', '/a')
     * @Filters('authRequired', 'schemaRequired');
     */
    hello(req, res) {
        res.end('/hello/a');
    }

    /**
     * @Route('get', '/')
     */
    index(req, res) {
        res.end('/hello');
    }

}


