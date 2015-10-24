'use strict';

/**
 * @Bean
 */
module.exports = class Another {

    /**
     * @Autowired("Bean")
     */
    get bean() {}

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

    doWork() {
        console.log('Another.doWork()');
        this.bean.doWork();
    }

}


