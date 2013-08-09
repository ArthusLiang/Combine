/*
 * @namespace   Combine
 * @Author:     yulianghuang
 * @CreateDate  2013/8/6
 */
(function(window){
    var _combine={
        HEAD:document.getElementsByTagName("HEAD")[0]
    };
    /*
     * cookie opreate
     */
    _combine.Cookie= new function(){
        var _obj = {};
        /*
         * transform the cookie string to the javascript object
         * @return {object} cookie object
         */
        this.getCookieObj = function () {
            var cookies = document.cookie.split("; "),
                _temp;
            _obj={};
            for (var i = cookies.length - 1; i !== -1; i--) {
                _temp = cookies[i].split("=");
                if (_temp.length > 1) {
                    var _key=_temp[0];
                    _temp.shift();
                    _obj[_key] = _temp.join("=");
                }
            }
            return _obj;
        };
        /*
         * get the cookie value by key
         * @param   {string}        key
         * @return  {string|null}   value
         */
        this.get = function (key) {
            this.getCookieObj();
            return _obj[key];
        };
        /*
         * set the cookie value (temp use)
         */
        this.set=function(key,value){
            document.cookie = key+"="+value;
        };
    };
    /*
     * convert the string to object
     * @param {string} json string
     * @return {object} the javascript object
     */
    _combine.fromJson=function(pData){
        var variable;
        try {
            variable=eval("("+pData+")");
        } catch(e){};
        return variable;
    };
    /*
     * dynamic script load
     * @param {string} src
     * @param {function} the callback method
     * @param {string} charset
     * @param {bool} whether to use releaseNo to clear the cache
     */
    _combine.addJs=function(pSrc, pCallback,pCharset,pIsUseReleaseNo){
        var _js = document.createElement("SCRIPT"),
            _arguments=Array.prototype.slice.call(arguments,4),
            _debugInfo=_combine.Cookie.get("DEBUGJS"),
            _src=pIsUseReleaseNo ? [pSrc,'?ReleaseNo=',_combine.ReleaseNo].join("") :pSrc;
        if(_debugInfo){
            var _debugObj = _combine.fromJson(_debugInfo);
            for(var name in _debugObj){
                _src=_src.replace(name,_debugObj[name]);
            }
        }
        _js.src=_src;
        _js.charset=pCharset|| 'UTF-8';
        _js.type='text/javascript';
        _js.onload=_js.onreadystatechange=function(){
            if(!this.readyState ||this.readyState ==="loaded" || this.readyState==='complete'){
                if(pCallback !=null){
                    pCallback.apply(this,_arguments);
                }
                _js.onload=_js.onreadystatechange=null;
            }
        };
        _combine.HEAD.appendChild(_js);
    };
    /*
     * jsonp data
     * @param {string} the data's url
     * @param {function} the callback method
     * @param {string} charset
     * @param {bool} whether to use releaseNo to clear the cache
     * @the response should follow the format
     *   window.Shift.JsonPDic[pJsonKey]=....
     */
    _combine.jsonp=function(pSrc,pCallback,pCharset,pJsonKey,pIsUseReleaseNo){
        var _src= pIsUseReleaseNo?[pSrc,"?Key=",pJsonKey,'&ReleaseNo=',_combine.ReleaseNo].join(""):[pSrc,"?Key=",pJsonKey].join("");
        _combine.addJs(_src,function(){
            pCallback(_combine.JsonPDic[pJsonKey]);
        },pCharset,false);
    };
    /*
     * convert the object to the url query string
     * @param {object} the javascript object
     * @return {string} url query string
     */
    _combine.joinParam=function(pParam){
        var _arr=[];
        for(var name in pParam){
            _arr.push(name);
            _arr.push("=");
            _arr.push(pParam[name]);
        }
        return _arr.join("&");
    };
    /*
     * make ajax request
     * @param {string} url
     * @param {string} request arguments
     * @param {function|null} the callback method
     */
    _combine.ajax=function(pUrl, pContent, pCallback){
        var xmlVer=["Microsoft.XMLHTTP","MSXML2.XMLHTTP"],xmlObj;
        try{
            xmlObj = new XMLHttpRequest();
        }catch(e){
            for(var i=xmlVer.length-1;i!==-1;i--){
                try{
                    xmlObj=new ActiveXObject(xmlVer[i]);
                    break;
                }catch(e){}
            }
        }
        if(!xmlObj) return;
        xmlObj.open(pContent? "POST":"GET",pUrl || location.href,!!pCallback);
        xmlObj.setRequestHeader("Content-Type","application\/x-www-form-urlencoded");
        xmlObj.setRequestHeader("If-Modified-Since",new Date(0));
        function getReturnValue() {
            return (xmlObj.status == 200 ? (/xml/i.test(xmlObj.getResponseHeader("content-type")) ? xmlObj.responseXML : xmlObj.responseText) : null);
        }
        if(pCallback){
            xmlObj.onreadystatechange=function(){
                if(xmlObj.readyState ==4){
                    var _txt =getReturnValue();
                    if(pCallback(_txt) === true){
                        setTimeout(function(){
                            _combine.ajax(pUrl, pContent, pCallback);
                        },1000);
                    }
                }
            };
        }
        //send param
        xmlObj.send(pContent,"");
        return pCallback ? xmlObj:getReturnValue();
    };
    /*
     * require load method
     * @param {array} sourcefile
     * [
     *     {src:'js/a.js',charset:'gb3212',noReleaseNo:false},//default false
     *     {src:'js/ab.js',charset:'utf-8'},
     *     [
     *         {src:'js/a.js',charset:'gb3212',noReleaseNo:false},//default false
     *         {src:'js/ab.js',charset:'utf-8'}
     *     ]
     * ]
     * @param {function} the callback function
     */
    _combine.require=function(pSources,pCallback){
        var _callback=pCallback,
            _length=pSources.length;
        (function(pSource,pIndex){
            if(pIndex<_length){
                var _obj=pSource[pIndex],
                    me=this,
                    _self=arguments.callee;
                if (Object.prototype.toString.call(_obj) === '[object Array]') {
                    var _l=_obj.length,
                        _toDo=_l;
                    for (var i = 0; i < _l; i++) {
                        _combine.addJs.call(me,_obj[i].src,function(){
                            _toDo--;
                            if(_toDo===0){
                                _self.call(me,pSource, pIndex + 1);
                            }
                        },_obj[i].charset,!_obj[i].noReleaseNo);
                    }
                } else  {
                    _combine.addJs.call(me,_obj.src, function () {
                        _self.call(me, pSource, pIndex + 1);
                    },_obj.charset,!_obj.noReleaseNo);
                }
            }else{
                _callback();
            }
        })(pSources,0);
    };
    /*
     * the scripts which needs to be loaded
     * @param {array} sourcefile
     * [
     *     {src:'js/a.js',charset:'gb3212'},
     *     {src:'js/ab.js',charset:'utf-8'}
     * ]
     * @param {string} new file source
     * @param {function} the callback method
     */
    _combine.combine=function(pSources,pNewSource,pCallback){
        if(pNewSource){
            _combine.addJs(pNewSource,pCallback);
        }else{
            _combine.require(pSources,pCallback);
        }
    };
    /*
     * add event
     * @param {dom} the dom which you bind event to
     * @param {string} the tpye name of the function
     * @param {function} the function
     */
    _combine.addEvent=function(obj,type,fn){
        if(obj.addEventListener) obj.addEventListener(type,fn,false);
        else if(obj.attachEvent){
            obj["e"+type+fn]=fn;
            obj[type+fn]=function(){obj["e"+type+fn](window.event);}
            obj.attachEvent("on"+type,obj[type+fn]);
        }
    };
    /*
     * remove event
     * @param {dom} the dom which you bind event to
     * @param {string} the tpye name of the function
     * @param {function} the function
     */
    _combine.removeEvent=function(obj,type,fn){
        if(obj.removeEventListener) obj.removeEventListener(type,fn,false);
        else if(obj.detachEvent){
            obj.detachEvent("on"+type,obj[type+fn]);
            obj[type+fn]=null;
            obj["e"+type+fn]=null;
        }
    };
    /*
     * add an iframe to the html document
     * @param {string} the src of the iframe
     * @param {function|null} the callback function
     * @param {string|null} the charset of the iframe
     * @param {function|null} the method will be called before loading iframe
     * @param {dom|null} the dom which the iframe will be added to
     * @return {dom} the new iframe
     */
    _combine.addIFrame=function(pSrc,pCallback,pCharset,pBeforeAdd,pParentNode){
        var _iframe=document.createElement("IFRAME"),
            _parent=pParentNode||document.getElementsByTagName("BODY")[0];
        _iframe.src=pSrc;
        _iframe.charset = pCharset || "UTF-8";
        pBeforeAdd && pBeforeAdd(_iframe);
        pCallback && _combine.addEvent(_iframe,"load",function(){
            pCallback(_iframe);
        });
        _parent.appendChild(_iframe);
        return _iframe;
    };
    window.Combine=window.$c=_combine;
})(window);