'use strict';

/**
 * @Bean
 */
module.exports = class Another {

    /**
     * @Initialize
     */
    initialize(callback) {
        console.log('Another.initialize()');
        callback();
    }

    /**
     * @AfterPropertiesSet
     */
        console.log('Another.ready()');
    }

    /**
     * @Destroy
     */
    shutdown(callback) {
        console.log('Another.shutdown()');
        callback();
    }

    say() {
        console.log('Another.say()');
    }

}


