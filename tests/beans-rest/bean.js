'use strict';


var _ =require('lodash'),
    express = require('express');

/**
 * @Bean
 * @RestApplication("app")
 */
module.exports = class App {

    /**
     * @Autowired('$context')
     */
    get context() {}

    /**
     * @Initialize
     */
    initialize(callback) {
        this.app = express();
        this.app.listen(3000);
        callback();
    }


}


