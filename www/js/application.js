/*HTMLElement.prototype.originalRemoveEventListener
 = HTMLElement.prototype.removeEventListener;

 HTMLElement.prototype.removeEventListener = function(type, listener, useCapture)
 {
 console.log('remove: ' + type);
 this.originalRemoveEventListener(type, listener, useCapture);
 };
 */

var maxSearchLength = 50;

var weeklyPointsAllowed = 49;

var foodSearchResults = undefined;

var runningCordova = false;
var foodDb = undefined;
var database;
var viewAssembler = new ViewAssembler();
var backButtonLabel = " ";

$(document).ready(function () {
    loadTemplates(setupDefaultView);
});

function setupDefaultView() {
    var bodyView = viewAssembler.defaultView();

    //Setup the default view
    var defaultView = { title: "Welcome!",
        view: bodyView
    };

    //Setup the ViewNavigator
    window.viewNavigator = new ViewNavigator('body');
    window.viewNavigator.pushView(defaultView);

    backButtonLabel = (isTablet() ? "Back" : " ");
    database = window.localStorage;

    $.ajaxSetup({
        cache: true
    });
}

function onNearbyListItemClick(event) {
    $("li").removeClass("listSelected");
    var target = $(event.target)
    if (target.get(0).nodeName.toUpperCase() != "LI") {
        target = target.parent();
    }

    target.addClass("listSelected");
    var index = target.attr("index");
    index = parseInt(index);

    database.setItem("amount", foodSearchResults[index].points);

    showPointsPage(true);
}

function pushPointsPage() {
    showPointsPage(true);
}

function showPointsPage(push) {
    var view = { title: "My Points",
        backLabel: backButtonLabel,
        view: viewAssembler.pointsView()
    };
    if(push == undefined || !push)
        window.viewNavigator.replaceView(view);
    else
        window.viewNavigator.pushView(view);
}

function prepareSearch() {
    if(foodDb == undefined){
        //if(window.sqlitePlugin == undefined)
        //if(!runningCordova)
            foodDb = new ArrayDatabase();
        //else
        //    foodDb = new SQLDatabase();
    }
}

function onSearchButtonClick(event) {
    var $input = $("#search_searchPhrase");
    var searchPhrase = $input.val();

    if (searchPhrase != undefined && searchPhrase.length > 0) {
        foodSearchResults = foodDb.searchFood(searchPhrase);
        var view = { title: "Search Results",
            backLabel: backButtonLabel,
            view: viewAssembler.searchResultsView(foodSearchResults, searchPhrase)
        };
        window.viewNavigator.pushView(view);
    }
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isPositiveNumber(n) {
    return isNumber(n) && n >= 0;
}

function roundPoints(points){
    return Math.round(points * 10) / 10;
}

function onCalcPointsButtonClick(event) {
    var protein = $("#calcProtein").val();
    var carbs = $("#calcCarbs").val();
    var fat = $("#calcFat").val();
    var fiber = $("#calcFiber").val();

    if (isPositiveNumber(protein) && isPositiveNumber(carbs) && isPositiveNumber(fat) && isPositiveNumber(fiber)) {
        var amount = calcPointsPlusFood(protein, carbs, fat, fiber);
        database.setItem("amount", amount);
        database.setItem("calcPointsAmount", amount);
        database.setItem("protein", protein);
        database.setItem("carbs", carbs);
        database.setItem("fat", fat);
        database.setItem("fiber", fiber);
        var view = { title: "Calculate Points",
            backLabel: backButtonLabel,
            view: viewAssembler.calcPointsView()
        };
        window.viewNavigator.replaceView(view);
    }
}

function calcPointsPlusFood(protein, carbs, fat, fiber) {
    var points = (protein / 10.9375) + (carbs / 9.2105) + (fat / 3.8889) - (fiber / 12.5);
    return roundPoints(points);
}

function onCalcAllowanceButtonClick(event) {
    var weight = $("#calcWeight").val();
    var height = $("#calcHeight").val();
    var age = $("#calcAge").val();
    var maleNotFemale = "male" == $("#calcGender").val();
    var poundsNotKg = "pounds" == $("#calcWeightType").val();
    var inchNotMeters = "inches" == $("#calcHeightType").val();

    if (isPositiveNumber(weight) && isPositiveNumber(height) && isPositiveNumber(age)) {
        var allowance = calcPointsPlusAllowance(weight, height, age, maleNotFemale, poundsNotKg, inchNotMeters);
        database.setItem("allowance", allowance);
        database.setItem("weight", weight);
        database.setItem("height", height);
        database.setItem("age", age);
        database.setItem("maleNotFemale", maleNotFemale);

        var view = { title: "Calculate Allowance",
            backLabel: backButtonLabel,
            view: viewAssembler.calcAllowanceView(allowance, weight, height, age, maleNotFemale, poundsNotKg, inchNotMeters)
        };
        window.viewNavigator.replaceView(view);
    }
}

function calcPointsPlusAllowance(weight, height, age, maleNotFemale, poundsNotKg, inchNotMeters) {
    var wmult = poundsNotKg ? .454 : 1;
    var hmult = inchNotMeters ? .0254 : 1;

    var base1, age1, activity, wgt1, ht1;
    if (maleNotFemale) {
        base1 = 864;
        age1 = 9.72;
        activity = 1.12;
        wgt1 = 14.2;
        ht1 = 503;
    } else {
        base1 = 387;
        age1 = 7.31;
        activity = 1.14;
        wgt1 = 10.9;
        ht1 = 660.7;
    }

    var totage = Math.round((age1 * age) * 100) / 100;
    var totwgt = Math.round(((wmult * weight) * wgt1) * 100) / 100;
    var totht = Math.round(((hmult * height) * ht1) * 100) / 100;
    var tee1 = Math.round((activity * (totwgt + totht)) * 100) / 100;
    var tee2 = Math.round((base1 - totage + tee1) * 100) / 100;
    var atee1 = tee2 - (tee2 * .10) + 200;
    var target1 = (atee1 - 1000) / 35;
    var modtar = Math.round(target1 - 11);

    if (modtar <= 26)
        modtar = 26;
    else if (modtar >= 71)
        modtar = 71;

    return modtar;
}

function onSubtractPointsButtonClick(event) {
    var amount = $("#pointSubtract").val();
    var dailyNotWeekly = "daily" == $("#pointType").val();

    if (isNumber(amount)) {
        var keyName = dailyNotWeekly ? "dailyPoints" : "weeklyPointsAllowed";
        var points = database.getItem(keyName);
        points -= amount;
        database.setItem(keyName, roundPoints(points));
        showPointsPage();
    }
}

function onResetPointsButtonClick(dailyNotWeekly) {
    var keyName = dailyNotWeekly ? "dailyPoints" : "weeklyPointsAllowed";
    var points = dailyNotWeekly ? dbGet("allowance", 0) : weeklyPointsAllowed;
    database.setItem(keyName, points);
    showPointsPage();
}

function openExternalURL(url) {
    var result = confirm("You will leave the Points Watcher App.  Continue?");
    if (result == true) {
        window.open(url, '_blank');
    }
}

function dbGetNum(key) {
    var ret = dbGet(key, -1);
    return ret < 0 ? undefined : ret;
}

function dbGet(key, defaultVal) {
    var ret = database.getItem(key);
    if (ret == undefined) {
        ret = defaultVal;
        database.setItem(key, ret);
    }
    return ret;
}

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    runningCordova = true;
    document.addEventListener("backbutton", onBackKey, false);
}

function onBackKey(event) {
    if (window.viewNavigator.history.length > 1) {
        event.preventDefault();
        window.viewNavigator.popView();
        return false;
    }
    navigator.app.exitApp();
    return true;
}

document.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, false);