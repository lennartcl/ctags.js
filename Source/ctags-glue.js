var CTagsJSGlue = {

    $ctagsJS__postset: 'Module["CTags_parseFile"] = ctagsJS.parseSourceFile;',

    $ctagsJS: {
        regex: {},

        parseSourceFile : function(url) {
            var path = url.substr(0, url.lastIndexOf("/"));
            Module["FS_createPath"]("/", path, true, true);

            var urlPtr = allocate(intArrayFromString(url), 'i8', ALLOC_STACK);
            Module['_parseURL'](urlPtr);
        },
    },

    regcomp : function(preg, patternPtr, cflags) {
        var flags = '';
        if (cflags & 2) flags += 'i';

        // Read the pattern. We can't use `Pointer_stringify` because we might match ASCII characters greater 127
        var pattern = '';
        var i = 0;
        var charCode;
        while (charCode = {{{ makeGetValue('patternPtr', 'i', 'i8', 0, 1) }}}) {
            pattern += String.fromCharCode(charCode);
            i++;
        }
        ctagsJS.regex[preg] = new RegExp(pattern, flags);
        
        return 0;
    },
    
    regexec : function(preg, stringPtr, nmatch, pmatch, eflags) {

        var string = Pointer_stringify(stringPtr);
        var regex = ctagsJS.regex[preg];

        var results = regex.exec(string);

        for (var i = 0; i < nmatch; i++) {

            var rm_so = -1;
            var rm_eo = -1;
            
            if (results && i < results.length) {
                rm_so = string.indexOf(results[i]);
                rm_eo = rm_so + results[i].length;
            }

            {{{ makeSetValue('pmatch', '8*i', 'rm_so', 'i32') }}};
            {{{ makeSetValue('pmatch', '8*i+4', 'rm_eo', 'i32') }}};
        };

        return (results ? 0 : 1); //REG_NOMATCH
    },

    openTagFile : function() {
        console.log('openTagFile');
    },

    closeTagFile : function(resize) {
        console.log('closeTagFile');
    }

};

autoAddDeps(CTagsJSGlue, '$ctagsJS');
mergeInto(LibraryManager.library, CTagsJSGlue);