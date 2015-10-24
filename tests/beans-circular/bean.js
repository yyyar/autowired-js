'use strict';

/**
 * @Bean("Bean")
 */
module.exports = class Abc {

    /**
     * @Autowired("Another")
     */
    get another() {}

    /**
     * @Initialize
     */
    initialize(callback) {
        console.log('Bean.initialize()');
        callback();
    }

    /**
     * @AfterPropertiesSet
     */
    ready() {
        console.log('Bean.ready()');
    }

    /**
     * @Destroy
     */
    shutdown(callback) {
        console.log('Bean.shutdown()');
        callback();
    }

    doWork() {
        console.log('Bean.doWork()');
        this.another.say();
    }

}


