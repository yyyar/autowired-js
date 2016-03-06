'use strict';

/**
 * @Bean("Bean")
 */
module.exports = class Abc {

    /**
     * @Autowired("$context")
     */
    get context() {}

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
        this.context.getBean('Another').say();
    }

    /**
     * @Destroy
     */
    shutdown(callback) {
        console.log('Bean.shutdown()');
        callback();
    }

    say() {
        console.log('Bean.say()');
    }

}


