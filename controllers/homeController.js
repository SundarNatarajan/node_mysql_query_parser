const node_config = {}
node_config.params_pattern = /\$.*?\}/gi

myApp.controller('homeController', ['$scope', '$http', '$filter', function ($scope, $http, $filter) {
    //npm dependencies
    const _ = require('lodash');
    const fs = require('fs');
    const path = require('path')
    const about = require(path.join(__dirname, 'node', 'about.js'))

    $scope.models = {
        isClicked: false,
        isQuerySaveAction: false,
        query: `Select * from Table  $P{Sundar} $P{mandatory} $P{filter}`,
        returnedParams: null,
        combinationPath: (path.join(__dirname, 'combinations.json'))
    }

    $scope.gridOptions = {
        enableColumnMenus: false,
        paginationPageSizes: [25, 50, 75],
        paginationPageSize: 10,
        columnDefs: [{ field: "column", cellClass: 'red', width: '20%', name: 'Column', enableCellEdit: false },
        {
            field: "type", width: '20%', name: 'Type', enableCellEdit: true,
            editableCellTemplate: 'ui-grid/dropdownEditor',
            cellFilter: 'mapDataTypes', editDropdownValueLabel: 'dataTypes', editDropdownOptionsArray: [
                { id: 1, dataTypes: 'string' },
                { id: 2, dataTypes: 'number' },
                { id: 3, dataTypes: 'null' }
            ]
        }, {
            field: "value", width: '20%', name: 'Value', enableCellEdit: true
        }, {
            field: "filterType", width: '20%', name: 'FilterType', enableCellEdit: true,
            editableCellTemplate: 'ui-grid/dropdownEditor',
            cellFilter: 'mapType', editDropdownValueLabel: 'selection', editDropdownOptionsArray: [
                { id: 1, selection: 'filter' },
                { id: 2, selection: 'mandatory' }
            ]
        }]
    };

    $scope.parseParams = function () {
        $scope.models.isClicked = true;
        if ($scope.models.query) {
            const query = $scope.models.query;

            const uniqueregex = _.uniq(query.match(node_config.params_pattern))
            $scope.gridOptions.data = arrayToObj(uniqueregex);
        }
        // $scope.gridOptions.data = $scope.parser($scope.models.query);
    }

    function arrayToObj(keys) {
        console.log(keys[0]);
        const formedObject = [];
        var keyVal = _.reduce(keys, function (formed, item) {
            //formed[item] = null
            formedObject.push({ column: item, value: null, type: 3, filterType: 1 })
            //return formed
        }, {});
        return formedObject;
    }

    function reform(keys) {
        const keyVal = _.reduce(keys, function (formed, item) {

            if (item.type == 2) //number
                formed[item.column] = item.value
            else if (item.type == 1) //string
                formed[item.column] = `'${item.value}'`
            else {
                formed[item.column] = null;
            }
            return formed
        }, {});
        return keyVal
    }

    function replacer(tpl, data) {
        var re = node_config.params_pattern, match;
        while (match = re.exec(tpl)) {
            tpl = tpl.replace(match[0], data[match[0]])
            re.lastIndex = 0;
        }
        return tpl;
    }

    $scope.getCombinations = function () {
        //const filteredData = $filter($scope.gridOptions.data)(filterType,'filter')
        const filteredData = $filter('filter')($scope.gridOptions.data, { filterType: 1 })
        const defaultFilter = $filter('filter')($scope.gridOptions.data, { filterType: 2 })
        const combinatedFilters = about.getCombinations(filteredData)
        var res = [];
        combinatedFilters.forEach(function (it) {
            res.push(it.concat(defaultFilter))
        })
        $scope.models.combinations = JSON.stringify({
            filter: res,
            limit: {
                min: 100,
                max: 100,
                range: 10
            },
            title: '',
            query: $scope.models.query
        })
    }

    $scope.updateQuery = function () {
        $scope.models.updatedQuery = '';
        const params = $scope.gridOptions.data;
        var reformedParam = reform(params);
        $scope.models.updatedQuery = replacer($scope.models.query, reformedParam)
    }

    $scope.saveCombination = function () {
        if ($scope.models.combinations) {
            console.log($scope.models.combinationPath)
            fs.readFile($scope.models.combinationPath, function (err, fileContents) {
                let res =[]
                res = res.concat(fileContents)
                //const combinationsFormed = Array.isArray(fileContents) ? fileContents : [fileContents]
                
                res = res.concat([$scope.models.combinations])

                fs.writeFile($scope.models.combinationPath, res, function (er) {
                    if (err) {
                        $scope.models.error = err;
                    } else {
                        $scope.models.success = 'Combination File Saved Successfully';
                    }
                })
            })
        }
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
}]).filter('mapDataTypes', function () {
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
}).filter('mapType', function () {
    var dataTypesHash = {
        1: 'filter',
        2: 'mandatory'
    };

    return function (input) {
        if (!input) {
            return '';
        } else {
            return dataTypesHash[input];
        }
    };
})