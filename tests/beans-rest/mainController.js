'use strict';

/**
 * @Bean
 * @Controller
 */
module.exports = class MainController {

    /**
     * @Initialize
     */
    initialize(callback) {
        console.log("Initializing MainController");
        callback();
    }

    /**
     * @Route('get', '/a')
     */
    hello(req, res) {
        res.end('/a');
    }

    /**
     * @Route('get', '/')
     */
    index(req, res) {
        res.end('/');
    }

}


