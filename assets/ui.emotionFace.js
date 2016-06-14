/**
 * 说明：该插件是表情包，使用的图片在文件夹 img 中，
 * 
 * 浏览器兼容: IE8+，现代浏览器
 * 
 * 引入：直接引入即可，不依赖第三方插件
 * 
 *  当前是 sea.js加载方式。 如是其它方式，请自行改造。
 *   
 *   example:
 *   var ui_emotionFace = require("ui_emotionFace");
 *   var  emotionFaceOne =  new ui_emotionFace({
 *       clickDom : $('.emotion').get(0),
 *       id: 'facebox',
 *       assign: 'myContent',
 *       path: seajs.resolve('ui_emotionFace').match(/[\:\/\w\.]+\//) + 'img/',	//表情存放的路径 兼容IE需要配置此路径
 *       pos: {top: '-217px', left: '508px'}
 *   }); 
 * 
 * 作者：白云飘飘
 * 时间：2016-6-6
 * 
 */
define(function(require,exports,module){
    
    'use strict';
    
    require('./ui.emotionFace.css');
    
    var helper = {
        extend : function(target, source) {
            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    target[p] = source[p];
                }
            }
            return target;
        },
        //dom元素添加事件
        addHandler: function(element, type, handler) {
            if(element.addEventListener) {
                element.addEventListener(type, handler, false);
            } else if(element.attachEvent) {
                element.attachEvent("on"+type, handler);
            } else {
                element["on" + type] = handler;
            }
        },
        //dom元素移除事件
        removeHandler: function(element, type, handler) {
            if(element.removeEventListener) {
                element.removeEventListener(type, handler, false);
            } else if(element.detachEvent) {
                element.detachEvent('on' + type, handler);
            } else {
                element["on" + type] = null;
            }
        }
    };
    
    //默认配置
    var defaults = {
        clickDom : '', //点击展开表情包的元素
        id: '', //创建的表情包容器元素ID
        path: '', //表情包图片地址
        assign: 'content', //选中某表情后，填充到某元素中，保存用户的选择, 元素的id
        tip : 'em_', //某个表情对应码前缀 如： em_1、em_2
        pos: {top: 0, left:0}
    };
    //命名空间
    var emotionFace = function(options) {
        this.options = helper.extend(defaults, options);
        this._init();
    };
    //原型扩展
    helper.extend(emotionFace.prototype, {
        /**
         * 初始化方法，当实例化时调用该方法
         */
        _init: function() {
            this._events();
            return this;
        },
        /**
         * 事件注册
         * 1. 点击按钮展开表情库
         * 2. 点击其他部分隐藏表情库
         * 3. 点击某个表情图片获取标记 如 em_11
         */
        _events: function() {
            var that = this;
            //点击按钮展开表情库
            helper.addHandler(that.options.clickDom, 'click', function(e) {
                that._createFace();
                //阻止事件冒泡
                if(e.stopPropagation) {
                    e.stopPropagation();
                } else {
                    e.cancelBubble = true;
                }
            });
            //点击其他部分隐藏表情库
            helper.addHandler(document, 'click', function(e) {
                var target = e.target || e.srcElement;
                var facebox = document.querySelector('#'+that.options.id);
                if(facebox && facebox.style) {
                    //判断点击的节点是不是 facebox 的后代，如果不是它的后代，就隐藏表情框
                    //  || !(facebox === target)
                    if(!facebox.contains(target)) { 
                        facebox.style.display = 'none';
                    }
                }
            });
            //点击某个表情图片获取标记 如 em_11
            helper.addHandler(that.options.clickDom.parentNode, 'click', function(e) {
                var target = e.target || e.srcElement;
               // that._setCaret();
                if(target.getAttribute('data-labFace')) {
                    that._insertCaret(target.getAttribute('data-labFace'));
                }
            });
            //点击表情框中的删除图标
            helper.addHandler(that.options.clickDom.parentNode, 'click', function(e) {
                var target = e.target || e.srcElement;
                var facebox = document.querySelector('#'+that.options.id);;
                if(target.className === 'face-deleteBtn') {
                    //facebox.style.display = 'none';
                    that._deleteInput();
                }
            });
            //点击表情框中的切换表情库按钮
            helper.addHandler(that.options.clickDom.parentNode, 'click', function(e) {
                 var target = e.target || e.srcElement;
                 var facebox = document.querySelector('#'+that.options.id);
                 var parentNode; //按钮父容器
                 var facePages; //表情包容器元素集合
                 var pageNum = 0; //当前页，默认为第一页
                 var widthNum;
                 if(facebox && facebox.style) {
                    if(~target.className.indexOf('faceBtn')) { 
                         parentNode = target.parentNode;
                         facePages = facebox.querySelectorAll('.facePage');
                         widthNum = facePages[0].offsetWidth;
                         //该元素添加classname = active ，其它同级元素移除 active
                         for(var i=0; i< parentNode.children.length; i++) {
                             parentNode.children[i].className = 'faceBtn';
                             if(parentNode.children[i] === target) {
                                 pageNum = i;
                             }
                             facePages[i].style.marginLeft = 0;
                         }
                         target.className = 'faceBtn active';
                         
                         //切换表情包页
                         facePages[pageNum].style.marginLeft = '-' +widthNum * pageNum + 'px';
                    }
                 }
            });
            return that;
        },
        /**
         * 检测
         * 1. 配置中传入的 assign 元素是否存在，不存在抛出异常提示
         * 2. 配置的表情包容器元素是否存在
         * @{return} obj
         * @{return} obj.assignBool
         * @{return} obj.idBool
         * 
         */
        _check: function() {
            var assignBool = false;
            var idBool = false;
            if(!(document.querySelectorAll('#'+this.options.assign).length <= 0)) {
                assignBool = true;
            } else {
                throw '缺少表情赋值对象。';
            }
            if(document.querySelectorAll('#'+this.options.id).length > 0) {
                idBool = true;
            }
            return {
                assignBool: assignBool,
                idBool : idBool
            };
        },
        /**
         * 动画效果
         * 左右切换
         * page : 7 * 4 -1
         */
        _effect: function() {
            var facebox = document.querySelector('#'+this.options.id);
            var faceImgArray = facebox.querySelectorAll('.faceImg');
            var collects = []; // faceImg 分页， 依据 一行显示7个，一列显示 4个，减去最后一个 7 * 4 -1 = 27
            var pageNum = 27;
            var markI = -1; //分页标记
            var ul;
            var scrollDom = document.createElement('div');
            var changeFaceBox = facebox.querySelector('.changeFaceBox'); //表情包切换按钮容器
            var txtNode = document.createDocumentFragment(); //表情包按钮相关变量
            var changeFaceStr = '';//表情包按钮相关变量
            var active;//表情包按钮相关变量
            var deleteElement; //删除元素dom
            txtNode.appendChild(document.createElement("div"));
            for(var k = 0; k < faceImgArray.length; k++) {
                if( k % pageNum === 0) {
                    markI ++;
                    collects.push([faceImgArray[k]]);
                } else {
                    collects[markI].push(faceImgArray[k]);
                }
            }
            for(var i = 0; i< collects.length; i++) {
                ul = document.createElement("ul");
                ul.className = 'facePage clearfix';
                for(var j=0; j< collects[i].length; j++) {
                    ul.appendChild( collects[i][j] );
                }
                //添加删除元素dom
                deleteElement = document.createElement('li'); 
                deleteElement.className= "face-deleteBtn";
                ul.appendChild( deleteElement );
                scrollDom.appendChild(ul);
                //设置表情包切换按钮元素
                active = i===0 ? 'active' : '';
                changeFaceStr += '<span class="faceBtn '+active+'"></span>';
            }
            txtNode.firstChild.innerHTML = changeFaceStr;
            changeFaceBox.innerHTML = txtNode.firstChild.innerHTML;
            scrollDom.className = 'faceScrollBox';
            facebox.appendChild(scrollDom);
        },
        /**
         * 生成表情包内部dom
         * @{param} {Object} faceArray 表情包图片序列号
         * 例如： faceArrayObj = {'one': [1,20],'two': [101,152],'three': [201,313]};
         */
        _createFaceInnerString: function(faceArrayObj) {
            var innerString = '<ul class="clearfix hide">';
            var arrays = []; //保存序列号, [ [ left,right ],[left, right],[left, right] ]
            for(var item in faceArrayObj) {
                if(faceArrayObj.hasOwnProperty(item)) {
                    arrays.push(faceArrayObj[item]);
                }
            }
            for(var i=0; i<arrays.length; i++) {
                for(var k = arrays[i][0]; k <= arrays[i][1]; k++ ) {
                    if(navigator.userAgent.indexOf("MSIE")>0) { //如果是IE
                       innerString += '<li class="faceImg" data-labFace="['+this.options.tip+k+']"><img src="'+this.options.path+k+'.png" data-labFace = "['+this.options.tip+k+']" /></li>';  
                    } else {
                       innerString += '<li class="faceImg em_'+k+'" data-labFace="['+this.options.tip+k+']"></li>'; 
                    }
                }
            }
            return innerString +'</ul>';
        },
        /**
         * 创建表情包dom
         * 
         * 
         */
        _createFace: function() {
            var check = this._check();
            var strFace;
            var labFace; //表情包代号
            var txtNode;
            var faceArrayObj = { //表情包图片序列号
                'one': [101,152],
                'two': [201,207],
                'three': [231,237],
                'four': [251,271],
                'five': [301,313],
                'six': [1, 20]
            };
            var innerString; //表情包内容 
            //当表情包元素没有被创建时执行创建
            if(!check.idBool) {
                innerString = this._createFaceInnerString(faceArrayObj);
				strFace = '<div id="'+this.options.id+'" class="emotionFaceBox">' +
                         '<span class="changeFaceBox clearfix"></span>'+ //表情页切换按钮容器 
				         innerString;			  
				strFace += '</div>';
                txtNode = document.createDocumentFragment();
                txtNode.appendChild(document.createElement("div"));
                txtNode.firstChild.innerHTML = strFace;
                this.options.clickDom.parentNode.appendChild(txtNode.firstChild.firstChild);
                //动画处理
                this._effect();
            }
            //表情包显示定位
            var top = this.options.clickDom.offsetTop + this.options.clickDom.offsetHeight;
            var facebox = document.querySelector('#'+this.options.id);
            //样式调整
			facebox.style.top = this.options.pos.top || top;
            facebox.style.left = this.options.pos.left;
            facebox.style.display = 'block';
            
            return this; 
        },
        /**
         * 为了兼容IE,设置光标位置，还原上一次的位置，
         * 
         */
        _setCaret: function() {
            if(navigator.userAgent.indexOf("MSIE")>0) { //IE
                var assignDom = document.querySelector('#'+this.options.assign);
                assignDom.caretPos = document.selection.createRange().duplicate(); //获取选中的文案，并保存副本 
            }
        },
        /**
         * 将用户选择的表情插入到输入框中的指定位置中
         * 
         * 
         */
        _insertCaret: function(textFeildValue) {
            var assignDom = document.querySelector('#'+this.options.assign);
            if(assignDom.setSelectionRange) { //现代浏览器
                var rangeStart = assignDom.selectionStart; //分割，前半部分
                var rangeEnd = assignDom.selectionEnd; //分割，后半部分
                var tempStrBefore = assignDom.value.substring(0, rangeStart);
                var tempStrAfter = assignDom.value.substring(rangeEnd);
                assignDom.value = tempStrBefore + textFeildValue + tempStrAfter;
                //设置焦点
                assignDom.focus();
                //设置光标位置，还原上一次的位置
                var len = textFeildValue.length || 0;
                assignDom.setSelectionRange(rangeStart+len,rangeStart+len);
                //触发 oninput 事件
                var event = document.createEvent('HTMLEvents');
                event.initEvent("input", true, true);
                assignDom.dispatchEvent(event);
            } else if(document.all && assignDom.createTextRange && assignDom.caretPos) { // 兼容IE
                var caretPos = document.selection.createRange().duplicate(); //获取选中的文案
                caretPos.text += caretPos.text.charAt(caretPos.text.length-1) == '' ?  textFeildValue+'' : textFeildValue; 
            } else { //都不支持，直接插入最后面
                assignDom.value += textFeildValue;
            }
            return this;
        },
        /**
         * 点击删除按钮
         * 删除 input 输入框中的值
         * 删除当前输入的表情，以及该表情之前的字符，每触发一次删除一个
         */
        _deleteInput: function() {
            var assignDom = document.querySelector('#'+this.options.assign);
            if(assignDom.setSelectionRange) { //现代浏览器
                var rangeStart = assignDom.selectionStart; //分割，前半部分
                var rangeEnd = assignDom.selectionEnd; //分割，后半部分
                var tempStrBefore = assignDom.value.substring(0, rangeStart);
                var tempStrAfter = assignDom.value.substring(rangeEnd);
                var mustDelete; //前半部分，要删除的字符串,如果最后一个是表情包，则删除该表情包，否则只删除一个字符
                //设置光标位置，还原上一次的位置
                var len = 0;
                if(tempStrBefore[tempStrBefore.length-1] === ']' && (
                    tempStrBefore[tempStrBefore.length-8] === '[' ||
                    tempStrBefore[tempStrBefore.length-7] === '[' ||
                    tempStrBefore[tempStrBefore.length-6] === '['
                )) {
                    if(tempStrBefore[tempStrBefore.length-8] === '[') {
                        tempStrBefore = tempStrBefore.substring(0, tempStrBefore.length-8);
                        len = 8;
                    }
                    if(tempStrBefore[tempStrBefore.length-7] === '[') {
                        tempStrBefore = tempStrBefore.substring(0, tempStrBefore.length-7);
                        len = 7;
                    }
                    if(tempStrBefore[tempStrBefore.length-6] === '[') {
                        tempStrBefore = tempStrBefore.substring(0, tempStrBefore.length-6);
                        len = 6;
                    }
                } else {
                    tempStrBefore = tempStrBefore.substring(0, tempStrBefore.length-1);
                    len = 1;
                }
                assignDom.value = tempStrBefore  + tempStrAfter;
                //设置焦点
                assignDom.focus();
                assignDom.setSelectionRange(rangeStart-len,rangeStart-len);
                //触发 oninput 事件
                var event = document.createEvent('HTMLEvents');
                event.initEvent("input", true, true);
                assignDom.dispatchEvent(event);
            } else  { //其它非现代浏览器
                assignDom.value = assignDom.value.substring(0, assignDom.value.length-1);
            }
        }
    });
    
    module.exports = emotionFace;
});