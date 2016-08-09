// This is main.js
//define('jquery', [], function() {
//    return jQuery;
//});
require.config({
    baseUrl: scriptRootURI.path,
    catchError: true,
    onError: function(err) {
		 alert("Error:" + err);
    }, 
    paths: {
        //domReady: 'require-plugins/domReady', 
        //text: 'require-plugins/text',

    		//toolkit: 'modules/toolkit',
    		//mustachio: 'modules/mustachio',
        //datatable: 'modules/datatable',
			  'kb.utils': 'src/kbaseUtils'
    },
   shim: { 
    
    }
});
