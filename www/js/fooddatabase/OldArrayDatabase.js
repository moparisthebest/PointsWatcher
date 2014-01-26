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
    var result = [];
    //var startTime = new Date().getTime();
    var tokens = searchPhrase.toLowerCase().split(" ");
    var regexps = new Array(tokens.length);
    for (var x = 0; x < regexps.length; ++x)
        regexps[x] = new RegExp(tokens[x]);
    var numFound = 0;
    for (var y = 0; y < this.values.length; ++y) {
        var found = true;
        for (var z = 0; z < regexps.length; ++z) {
            if (!regexps[z].test(this.values[y][0])) {
                found = false;
                break;
            }
        }
        if (found) {
            result.push({
                name: this.values[y][1],
                amount: this.values[y][2],
                points: this.values[y][3],
                index: numFound
            });
            if (++numFound == maxSearchLength)
                break;
        }
    }
    //console.log( new Date().getTime() - startTime );
    return result;
};
