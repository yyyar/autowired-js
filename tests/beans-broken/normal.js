'use strict';

/**
 * @Bean
 */
module.exports = class Normal {

    /**
     * @Initialize
     */
    initialize(callback) {
        console.log('Normal.initialize()');
        callback();
    }

    /**
     * @Destroy
     */
    shutdown(callback) {
        console.log('Normal.shutdown()');
        callback();
    }

}


