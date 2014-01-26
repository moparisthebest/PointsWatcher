function ArrayDatabase() {
    this.type = 'array';
    //$.getScript("values.js", scriptSuccess);
    var thisClass = this;
    $.ajax({
        url: "values.js",
        dataType: "text",
        cache: true
    }).done(function (data) {
            thisClass.values = eval(data);
        });
}

ArrayDatabase.prototype.searchFood = function (searchPhrase) {
    //alert('type: ' + this.type + ' searchPhrase: ' + searchPhrase);
    //searchPhrase = 'banana bread';
    var result = [];
    //var startTime = new Date().getTime();
    var tokens = searchPhrase.toLowerCase().split(" ");
    var num_tokens = tokens.length;
    
    // partials
    var regexps = new Array(num_tokens);
    for (var x = 0; x < num_tokens; ++x)
        regexps[x] = new RegExp(tokens[x]);
    
    // whole words
    var whole_regexps = new Array(num_tokens);
    for (var x = 0; x < num_tokens; ++x)
        whole_regexps[x] = new RegExp('\\b'+tokens[x]+'\\b');

    var right_order = new RegExp(tokens.join('.*'));
    var exact_order = new RegExp(tokens.join('\\s*'));
    
    var numFound = -1;
    
    valueLoop:
    for (var y = 0; y < this.values.length; ++y) {
        var relevance = 0;
        for (var z = 0; z < num_tokens; ++z) {
            if (regexps[z].test(this.values[y][0]))
                ++relevance; // add a point for each word found
            else
                continue valueLoop; // for now, only display a result if all tokens were found
        }
        
        // now add a point for each WHOLE word that was found
        for (var z = 0; z < num_tokens; ++z)
            if (whole_regexps[z].test(this.values[y][0]))
                ++relevance;
            
        // add a point if it's in the right order
         if(right_order.test(this.values[y][0])){
             relevance *= 2;
             // and another if it's in the exact right order
             if(exact_order.test(this.values[y][0]))
                 relevance *= 2;
         }
            
        result.push({
            relevance: relevance,
            name: this.values[y][1],
            amount: this.values[y][2],
            points: this.values[y][3],
            //points: relevance,
            index: ++numFound
        });
    }
    // sort preferring a higher relevance and a shorter name
    result.sort(function(a, b) {
        var ret = b.relevance - a.relevance;
        if(ret == 0)
            ret = a.name.length - b.name.length;
        return ret;        
    });
    //console.log( new Date().getTime() - startTime );
    return result.slice(0,maxSearchLength);
};
