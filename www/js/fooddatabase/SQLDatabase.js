function SQLDatabase() {
    this.type = 'sql';
    //this.db = open(bla);
    //this.db = window.sqlitePlugin.openDatabase("Database", "1.0", "Demo", -1);
    this.db = window.sqlitePlugin.openDatabase({name: "values"});
}

SQLDatabase.prototype.searchFood = function(searchPhrase) {
    alert('type: '+this.type+' searchPhrase: '+searchPhrase);
    //return this.color + ' ' + this.type + ' apple';
};