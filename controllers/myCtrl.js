const config = {}
config.params_pattern = /\$.*?\}/gi

var app = angular.module('myApp', ['ui.grid', 'ui.grid.edit', 'ui.grid.pagination']);
app.controller('myCtrl', function ($scope) {

    //npm dependencies
    const _ = require('lodash');
    const fs = require('fs');

    $scope.models = {
        isClicked: false,
        isQuerySaveAction: false,
        query: `Select * from Table  $P{Sundar}`,
        returnedParams: null
    }

    $scope.gridOptions = {
        enableColumnMenus: false,
        paginationPageSizes: [25, 50, 75],
        paginationPageSize: 10,
        columnDefs: [{ field: "name", cellClass: 'red', width: '30%', name: 'Name', enableCellEdit: false },
        {
            field: "type", width: '30%', name: 'Type', enableCellEdit: true,
            editableCellTemplate: 'ui-grid/dropdownEditor',
            cellFilter: 'mapDataTypes', editDropdownValueLabel: 'dataTypes', editDropdownOptionsArray: [
                { id: 1, dataTypes: 'string' },
                { id: 2, dataTypes: 'number' },
                { id: 3, dataTypes: 'null' }
            ]
        }, {
            field: "value", width: '30%', name: 'Value', enableCellEdit: true
        }]
    };

    $scope.parseParams = function () {
        $scope.models.isClicked = true;
        if ($scope.models.query) {
            const query = $scope.models.query;

            const uniqueregex = _.uniq(query.match(config.params_pattern))
            $scope.gridOptions.data = arrayToObj(uniqueregex);
        }
        // $scope.gridOptions.data = $scope.parser($scope.models.query);
    }

    function arrayToObj(keys) {
        console.log(keys[0]);
        const formedObject = [];
        var keyVal = _.reduce(keys, function (formed, item) {
            //formed[item] = null
            formedObject.push({ name: item, value: null, type: 3 })
            //return formed
        }, {});
        return formedObject;
    }

    function reform(keys) {
        const keyVal = _.reduce(keys, function (formed, item) {

            if (item.type == 2) //number
                formed[item.name] = item.value
            else if (item.type == 1) //string
                formed[item.name] = `'${item.value}'`
            else {
                formed[item.name] = null;
            }
            return formed
        }, {});
        return keyVal
    }

    function replacer(tpl, data) {
        var re = config.params_pattern, match;
        while (match = re.exec(tpl)) {
            tpl = tpl.replace(match[0], data[match[0]])
            re.lastIndex = 0;
        }
        return tpl;
    }

    $scope.updateQuery = function () {
        $scope.models.updatedQuery = '';
        const params = $scope.gridOptions.data;
        var reformedParam = reform(params);
        $scope.models.updatedQuery = replacer($scope.models.query, reformedParam)
    }

    /*node functions*/


    $scope.parser = function (query) {
        return [{ name: "name1", value: 'null' }, { name: "name2", value: 'null' }];
    }

    $scope.saveQuery = function () {
        $scope.models.isQuerySaveAction = true;
        if ($scope.models.currentQueryPath && $scope.models.currentQueryFile && $scope.models.updatedQuery) {
            if (fs.existsSync($scope.models.currentQueryPath)) {
                fs.open(`${$scope.models.currentQueryPath}\\${$scope.models.currentQueryFile}.sql`, 'wx', (err, fd) => {
                    if (err) {
                        if (err.code === "EEXIST") {
                            $scope.models.error = `${$scope.models.currentQueryFile}.sql already exists`;
                            return;
                        } else {
                            $scope.models.error = err;
                        }
                    } else {
                        fs.writeFile(`${$scope.models.currentQueryPath}\\${$scope.models.currentQueryFile}.sql`, $scope.models.updatedQuery, function (er) {
                            if (err) {
                                $scope.models.error = err;
                            } else {
                                $scope.models.success = 'File Saved Successfully';
                            }
                        })
                    }


                });

            } else {
                $scope.models.error = `Check the path:${$scope.models.currentQueryPath} exists are not `
            }
        }
    }
    /*node functions*/

}).filter('mapDataTypes', function () {
    var dataTypesHash = {
        1: 'string',
        2: 'number',
        3: 'null'

    };

    return function (input) {
        if (!input) {
            return '';
        } else {
            return dataTypesHash[input];
        }
    };
})