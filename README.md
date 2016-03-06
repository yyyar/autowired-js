### autowired-js

[![Build Status](https://travis-ci.org/yyyar/autowired-js.svg?branch=master)](https://travis-ci.org/yyyar/autowired-js) [![NPM version](https://badge.fury.io/js/autowired-js.svg)](http://badge.fury.io/js/autowired-js)

**autowired-js** IoC library for Node.js ES2015 classes inspired by Spring Framework IoC

#### Installation
```bash
$ npm install autowired-js
```

#### Simple Example
Create some beans

**myBean1.js**
```javascript
/**
 * @Bean('myBean1')
 */
module.exports = class MyBean1 {

    print() {
        console.log('hello world');
    }

};
```

**myBean2.js**
```javascript
/**
 * @Bean('myBean2')
 */
module.exports = class MyBean2 {

    /**
     * @Autowired
     */
    get myBean1() {};

    doWork: function() {
        this.myBean1.print();
    }

};
```

Initialize Context, scan for beans and use it.

**app.js**
```javascript
var Autowired = require('autowired-js');

new Autowired('app', {
    /* optional config */
   'scan' : {
        'include': [/.+\.js$/], // array of regexps of files to parse
        'exclude' : ['node_modules']  // array of strings dirs to exclude
    }
}).scan(__dirname, (err, context) => {

    if (err) {
        return console.log(err);
    }

    app.getBean('myBean2').doWork();  // or use shortcut - app.get('myBean2')

    context.shutdown(() => {
        console.log('Context shutdown completed');
    });

});
```

### Annotations
This section describe currently implemented annotations

#### `@Bean('name')`
This annotation marks your class as a "bean", it will be
automatically scanner and put into context. Please note that
you should keep only one bean per file and `module.exports` should
export your class.

'name' parameter to @Bean is optional. If you do not provide it, bean
name would be equal to you class name;

```javascript
/**
 * @Bean
 */
module.exports = class MyBean {

    // implementation
};
```

#### `@Initialize`
If you mark any your method definition with this annotation,
method would be invoked right after creating new instance of your bean
and putting it in the context, but *before* any autowired injections.
It would be done in async way, your method will be passed with a callback,
and you need to invoke it after you complete initialization.

```javascript
/**
 * @Bean
 */
module.exports = class MyBean {

    /**
     * @Initialize
     */
    doInit(callback) {

        // emulating long initialization...
        setTimeout(() => {
            callback();
        }, 1000);
    }
}
```

#### `@Destroy`
If you mark any your method definition with this annotation,
method would be invoked on context shutdown, i.e. when calling `context.shutdown()`.
Please note that beans in context would be destored in random order in parallel, so not make any assumptions on it.

```javascript
/**
 * @Bean
 */
module.exports = class MyBean {

    /**
     * @Destroy
     */
    destroy(callback) {

        // emulating long destroying
        setTimeout(() => {
            callback();
        }, 1000);
    }

};
```

#### `@Autowired`
If you mark your property with this annotation, the dependency 
will be automatically injected in this property. Injected bean name should be
the same as your property name, othwerise you can set injected bean name by
providing parameter to annotation, for example: @Autowired('myRealBeanName').

```javascript
/**
 * @Bean
 */
module.exports = class MyBean {

    /**
     * @Autowired('anotherBean')
     */
    get anotherBean() {}

    doWork() {
        this.anotherBean.doWork();
    }

};
```

#### `@AfterPropertiesSet`
If you mark any your method definition with this annotation,
method would be invoked right after resolving all autowired dependencies.

```javascript
/**
 * @Bean
 */
module.exports = class MyBean {

    /**
     * @Autowired
     */
    get anotherBean() {},

    /**
     * @AfterPropertiesSet
     */
    ready() {

        // can access another bean now
        this.anotherBean.doWork();
    }

};
```

#### Tests
```bash
$ sudo npm install nodeunit -g
$ npm test
```

#### Author
* [Yaroslav Pogrebnyak](https://github.com/yyyar/)

#### License
MIT
