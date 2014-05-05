var app = angular.module('notes', ['ngSanitize']);

app.directive('focusMe', function($timeout) {
    var linkFunction = function($scope, el, attr) {
        $scope.$watch(attr.focusMe, function(val) {
            if(val) {
                $scope.enteredText = $scope.item.text;
                $timeout(function(){
                    $(el).focus();
                    $(el).select();
                });
            }
        });

        el.bind("keydown keypress", function(e) {
            if(e.which === 13) {
                if($.trim($scope.enteredText)) {
                    $scope.item.text = $scope.enteredText;
                    $scope.$apply();
                    $scope.updateStorage();
                }
                $(el).blur();
                e.preventDefault();
            }
            if(e.which === 27) {
                $(el).blur();
            }
        })
    };
    return {
        restrict: 'A',
        link: linkFunction
    }
});

app.filter('reverse', function() {
    return function(items) {
        if(typeof items !== 'undefined') {
            return items.slice().reverse();
        }
    }
});

app.controller('mainCtrl', function($scope, $timeout) {
    $scope.visibility = true;
    $scope.searchVisibility = false;
    $scope.percentOfPlace = 0;


    chrome.storage.sync.get('items', function(obj) {
        if(typeof obj.items === 'undefined') {
            $scope.$apply(function() {
                $scope.items = [];
            });
            chrome.storage.sync.set({items: []});
            $scope.percentOfPlace = 0;
        } else {
            $scope.$apply(function() {
                $scope.items = obj.items;
            });
            $scope.getPercentOfPlace();
        }

    });

    //$scope.items = [{id: 1, text: 'qwe'}, {id:2, text: '<a href="http://vk.com">vk.com</a>'}, {id:3, text: 'zxc'}]

    $scope.searchToggle = function(checker) {
        if(checker !== $scope.searchVisibility ) {
            $scope.searchNote = '';
            $scope.searchVisibility=!$scope.searchVisibility;
            if ($scope.searchVisibility === true) {
                $timeout(function(){
                    $('#search-note').focus();
                });
            } else {
                $timeout(function(){
                    $('#add-note').focus();
                });
            }
        }

    }


    $scope.getPercentOfPlace= function() {
        chrome.storage.sync.getBytesInUse('items', function(sum){
            $scope.$apply(function() {
                $scope.percentOfPlace = ((sum*100)/102400).toFixed(2);
            })
        });
    };

    $scope.updateStorage = function() {
        chrome.storage.sync.set({items: $scope.items});
        $scope.getPercentOfPlace();
    };


    $scope.addNote = function() {
        if($.trim($scope.addNoteText)) {
            $scope.items.push({id: new Date().getTime(), text: $scope.addNoteText.replace(/(https?:\/\/[.\S]+)/g, '<a href="$1">$1</a>')});
            $scope.updateStorage();

        }
        $scope.addNoteText = '';
    };

    $scope.deleteItem = function(id) {
        $scope.items.forEach(function(item, i, arr){
            if(item.id == id) {
                $scope.items.splice(i,1);
                $scope.updateStorage();
            }
        });
    };

    $scope.clearList = function() {
        $scope.items = [];
        $scope.updateStorage();
    };


    $('body').on('click', '.text a', function(e) {
        e.preventDefault();
        chrome.tabs.create({'url': $(this).attr('href')});
    })
});