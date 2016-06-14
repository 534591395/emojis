var assert = chai.assert;

//
suite('AnimateNumberUI 命名空间', function() {
    setup(function() {
        window.AnimateNumberUI = function() {
            this.helper = {};
            this.helper.$ = $;
            this.Defaults = {};
        };
        AnimateNumberUI.prototype.init = function() {};
        
        window.animateUI = new AnimateNumberUI();
    });
    
    //对象创建
    suite('#AnimateNumberUI()', function() {
        test('定义对象',function() {
            assert.equal(typeof AnimateNumberUI, 'function');
        });
        test('实例化对象',function() {
            assert.equal(typeof new AnimateNumberUI(), 'object');
        });
    });
    
    //准备阶段
    suite('#helper', function() {
        test('类型为Object', function() {
            assert.equal(typeof animateUI.helper, 'object');
        });
        suite('#$()', function() {
            test('实现类jQuery方法，', function() {
                assert.equal(typeof animateUI.helper.$ , 'function');
            });
            test('此测试只检测AnimateNumberUI.helper.$是否拥有 css 方法，具体可直接引入jQuery 或 zepto的方法', function() {
               assert.equal(typeof animateUI.helper.$.css, 'function'); 
            });
        }); 
    });
    
    //实现阶段
    
    //初始配置
    suite('#Defaults', function() {
        test('默认配置项，检测定义该对象成功', function() {
            assert(animateUI.Defaults, 'object');
        });
        test('默认配置项，检测定义了需要的属性名', function() {
            var source = {
                maxValue: 0, //定义滚动的最大值
                minValue: 0, //定义滚动的最小值
                direction: 'min-max', //滚动方向，min-max ;max-min
                totalSteps: 10, //滚动动画频率
                animate: 'animate-EaseInOut', //滚动动画效果
                $Dom: '', //生成的 类 jQuery Dom对象
                $parent: $('body'), //外部父容器
                onComplete: function() {}, //动画执行完后的自定义回调
                onProgress: function() {}  //动画执行过程中的自定义回调
            };
            assert.deepEqual(animateUI.Defaults, source);
        });
        //各个属性值的类型检测
    });
    // 初始化方法
    suite('#init()', function() {
        test('组件初始化方法，检测定义类型是否正确', function() {
            assert.equal(typeof animateUI.prototype.init, 'function');
        });
    });
    
    suite('#Promise', function() {
        test('异步', function(done) {
            //这里运行异步方法，例如：
            setTimeout(done, 300);
        });
    });

    
    teardown(function() {
        animateUI = null;
        window.AnimateNumberUI = null;
    });
});

