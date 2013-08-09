Combine
=======

Combine.js is a light javascsript frame. You can use it to loading javascript document. It won't Block the browser. Excitingly, combine.js can even merge server javascript documents into one document any little server.  Many web sites do the same thing to reduce the number of http request.
  
Set Up
=======

*Just use it*

    <script src="combine.js" type="text/javascript"><script>

Quick Start
=======




## addJs ##

###Explanation####

>load a javascript document

###Arguments###

>@param {string} src

>@param {function} the callback method

>@param {string} charset

>@param {bool} whether to use releaseNo to clear the cache

###eg:###

*load one javascript document*

    <script type="text/javascript">
      $c.addJs("../Dom.js",function(){
			alert("The Dom.js has been loaded!")
		},'utf-8','82032123');
    </script>

## require ##

###Explanation###

>load a list of javascript documents

###Arguments###

>@param {array} srcs

>@param {function} the callback method

###eg:###

*load a javascript list in order*

    <script type="text/javascript">
    	$c.require([{src:"/a.js","utf-8"},
					{src:"/b.js","utf-8"},
					{src:"/c.js","utf-8"}],function(){
						alert("The list has been loaded!");
					});
    </script>

*load a javascript list Simultaneously*

    <script type="text/javascript">
    	$c.require([[{src:"/a.js","utf-8"},
					{src:"/b.js","utf-8"},
					{src:"/c.js","utf-8"}]],function(){
						alert("The list has been loaded!");
					});
    </script>

*load a javascript list Synthetically*

    <script type="text/javascript">
    	$c.require([[{src:"/a.js","utf-8"},
					{src:"/b.js","utf-8"}],
					{src:"/c.js","utf-8"}],function(){
						alert("The list has been loaded!");
					});
    </script>

## combine ##

###Explanation###

>load a list of javascript documents or load one merged document instead

###Arguments###

>@param {array} srcs

>@param {string} src(merge)

>@param {function} the callback method

###eg:###

*load a javascript list or a merged ducoment*

    <script>
	    $c.combine(["a.js","b.js"],"ab.js",function(){
	    	alert("ab.js will be loaded!");
	    });
    </script>


License
=======


Contributing
=======

