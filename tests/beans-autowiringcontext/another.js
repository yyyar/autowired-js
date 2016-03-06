'use strict';

/**
 * @Bean
 */
module.exports = class Another {

    /**
     * @Autowired('$context')
     */
    get context() {};

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
    ready() {
        console.log('Another.ready()');
        this.context.getBean('Bean').say();
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


