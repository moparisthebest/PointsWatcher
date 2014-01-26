
var templates = {
    pointsViewTemplate:"views/pointsViewTemplate.html",
    aboutViewTemplate:"views/aboutViewTemplate.html",
    defaultViewTemplate:"views/defaultViewTemplate.html",
    searchResultsViewTemplate:"views/searchResultsViewTemplate.html",
    searchViewTemplate:"views/searchViewTemplate.html",
    calcPointsViewTemplate:"views/calcPointsViewTemplate.html",
    calcAllowanceViewTemplate:"views/calcAllowanceViewTemplate.html",
    loaded: 0,
    requested: 0
};

var ___templatesLoadedCallback;

function loadTemplates(callback) {
    ___templatesLoadedCallback = callback;
    
    //load Mousetache HTML templates
    for (var key in templates) {
        (function() {
             var _key = key.toString();
             if ( _key != "loaded" && _key != "requested" ){
                 templates.requested ++;
                 
                 var templateLoaded = function( template ){
                    onTemplateLoaded( template, _key );
                 }
                 
                 $.get( templates[ _key ], templateLoaded, "html" );
             }
         })();
    }
}


function onTemplateLoaded(template, key) {
    
    //alert( key + ": " + template);
    templates[ key ] = template;
    templates.loaded ++;
    
    if ( templates.loaded == templates.requested ) {
        ___templatesLoadedCallback();
    }
}



function isTablet() {
    var _w = $(window).width();
    var _h = $(window).height();
    return (Math.min(_w,_h) >= 600);
}

function onViewClick(event, title, viewTxt) {
    var view = { title: title,
        backLabel: backButtonLabel,
        view: viewAssembler[viewTxt.toString()]()
    };
    window.viewNavigator.pushView(view);
    event.stopPropagation();
    return false;
}

function registerViewClick(that, el, id, title, func){
    //alert(el.find(id).toString());
    el.find(id).on( that.CLICK_EVENT, function(evt){onViewClick(evt, title, func);} );
}

function ViewAssembler() {
    this.touchSupported = 'ontouchstart' in window;
    //this.CLICK_EVENT = this.touchSupported ? 'touchend' : 'click';
    this.CLICK_EVENT = 'click';
    return this;
}

ViewAssembler.prototype.defaultView = function() {
    var el = $( templates.defaultViewTemplate );
    registerViewClick(this, el, "#points", "My Points", "pointsView");
    registerViewClick(this, el, "#search", "Food Search", "searchView");
    registerViewClick(this, el, "#calculate", "Calculate Points", "calcPointsView");
    registerViewClick(this, el, "#calculateAllowance", "Calculate Allowance", "calcAllowanceView");
    registerViewClick(this, el, "#about", "About", "aboutView");
    return el;
}

ViewAssembler.prototype.pointsView = function () {
    var viewModel = {};
    viewModel.allowance = dbGet("allowance", 0);
    viewModel.dailyPoints = dbGet("dailyPoints", viewModel.allowance);
    viewModel.dailyUsed = roundPoints(viewModel.allowance - viewModel.dailyPoints);
    viewModel.weeklyPointsAllowed = weeklyPointsAllowed;
    viewModel.weeklyPoints = dbGet("weeklyPointsAllowed", viewModel.weeklyPointsAllowed);
    viewModel.weeklyUsed = roundPoints(viewModel.weeklyPointsAllowed - viewModel.weeklyPoints);
    viewModel.amount = dbGetNum("amount");
    var el = $( Mustache.to_html(templates.pointsViewTemplate, viewModel) );

    el.find( "#subtractButton" ).on( this.CLICK_EVENT, onSubtractPointsButtonClick );

    el.find( "#resetDayButton" ).on( this.CLICK_EVENT, function(evt){onResetPointsButtonClick(true);} );
    el.find( "#resetWeekButton" ).on( this.CLICK_EVENT, function(evt){onResetPointsButtonClick(false);} );
    return el;
}

ViewAssembler.prototype.aboutView = function() {
    var el = $( templates.aboutViewTemplate );
    return el;
}

ViewAssembler.prototype.calcPointsView = function () {
    var viewModel = {};
    viewModel.amount = dbGetNum("calcPointsAmount");
    viewModel.protein = dbGetNum("protein");
    viewModel.carbs = dbGetNum("carbs");
    viewModel.fat = dbGetNum("fat");
    viewModel.fiber = dbGetNum("fiber");
    var el = $( Mustache.to_html(templates.calcPointsViewTemplate, viewModel) );

    el.find( "#calcButton" ).on( this.CLICK_EVENT, onCalcPointsButtonClick );
    el.find("#calcSubtractButton").on( this.CLICK_EVENT, pushPointsPage );
    return el;
}

ViewAssembler.prototype.calcAllowanceView = function () {
    var viewModel = {};
    viewModel.allowance = dbGetNum("allowance");
    viewModel.weight = dbGetNum("weight");
    viewModel.height = dbGetNum("height");
    viewModel.age = dbGetNum("age");
    var maleNotFemale = dbGet("maleNotFemale", "false") == "true";
    if(maleNotFemale){
        viewModel.gender = "male";
        viewModel.otherGender = "female";
    }else{
        viewModel.gender = "female";
        viewModel.otherGender = "male";
    }
    var el = $( Mustache.to_html(templates.calcAllowanceViewTemplate, viewModel) );

    el.find( "#calcButton" ).on( this.CLICK_EVENT, onCalcAllowanceButtonClick );
    return el;
}

ViewAssembler.prototype.searchView = function () {

    prepareSearch();

    var el = $( templates.searchViewTemplate );

    el.find( "#searchButton" ).on( this.CLICK_EVENT, onSearchButtonClick );
    return el;
}

ViewAssembler.prototype.searchResultsView = function( foodSearchResults, searchPhrase ) {
    var viewModel = {};
    viewModel.values = foodSearchResults;
    /*
    viewModel.values.sort( function(a, b){
        if ( a.foodName < b.foodName ) { return -1; }
        else if (a.foodName > b.foodName ) { return 1; }
        else return 0;
    });
    */
    if(viewModel.values.length >= maxSearchLength)
        viewModel.maxSearchLength = maxSearchLength;
    
    viewModel.criteria = searchPhrase;
    
    var template = templates.searchResultsViewTemplate;
                  
    var el = $( Mustache.to_html(template, viewModel) );
    el.find( "li" ).on( this.CLICK_EVENT, onNearbyListItemClick );

    return el;
}
