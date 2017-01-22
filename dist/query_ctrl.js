'use strict';

System.register(['lodash', './dfunc', 'app/plugins/sdk', './func_editor', './add_datadog_func'], function (_export, _context) {
  "use strict";

  var _, dfunc, QueryCtrl, _createClass, DataDogQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_dfunc) {
      dfunc = _dfunc.default;
    }, function (_appPluginsSdk) {
      QueryCtrl = _appPluginsSdk.QueryCtrl;
    }, function (_func_editor) {}, function (_add_datadog_func) {}],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('DataDogQueryCtrl', DataDogQueryCtrl = function (_QueryCtrl) {
        _inherits(DataDogQueryCtrl, _QueryCtrl);

        function DataDogQueryCtrl($scope, $injector, $q, uiSegmentSrv) {
          _classCallCheck(this, DataDogQueryCtrl);

          var _this = _possibleConstructorReturn(this, (DataDogQueryCtrl.__proto__ || Object.getPrototypeOf(DataDogQueryCtrl)).call(this, $scope, $injector));

          _this.removeText = '-- remove tag --';
          _this.$q = $q;
          _this.uiSegmentSrv = uiSegmentSrv;
          if (_this.target.aggregation) {
            _this.aggregationSegment = new uiSegmentSrv.newSegment(_this.target.aggregation);
          } else {
            _this.aggregationSegment = new uiSegmentSrv.newSegment({
              value: 'Select Aggregation',
              fake: true,
              custom: false
            });
          }

          if (_this.target.metric) {
            _this.metricSegment = new uiSegmentSrv.newSegment(_this.target.metric);
          } else {
            _this.metricSegment = new uiSegmentSrv.newSegment({
              value: 'Select Metric',
              fake: true,
              custom: false
            });
          }

          _this.tagSegments = [];
          var self = _this;
          _this.target.tags = _this.target.tags || [];
          _.map(_this.target.tags, function (tag) {
            self.tagSegments.push(uiSegmentSrv.newSegment(tag));
          });

          _this.fixTagSegments();

          _this.functions = [];
          _this.target.functions = _this.target.functions || [];
          _.map(_this.target.functions, function (func) {
            var f = dfunc.createFuncInstance(func.funcDef, { withDefaultParams: false });
            f.params = func.params.slice();
            self.functions.push(f);
          });

          if (_this.target.as) {
            _this.asSegment = uiSegmentSrv.newSegment(_this.target.as);
          } else {
            _this.asSegment = uiSegmentSrv.newSegment({
              value: 'Select As',
              fake: true,
              custom: false
            });
          }

          return _this;
        }

        _createClass(DataDogQueryCtrl, [{
          key: 'toggleEditorMode',
          value: function toggleEditorMode() {
            this.target.rawQuery = !this.target.rawQuery;
          }
        }, {
          key: 'setQuery',
          value: function setQuery() {
            var _this2 = this;

            this.target.query = this.aggregationSegment.value;
            if (!this.metricSegment.fake) {
              this.target.query += ":" + this.metricSegment.value;
            }
            if (!this.target.tags || this.target.tags.length === 0) {
              this.target.query += '{*}';
            } else {
              this.target.query += '{' + this.target.tags.join(',') + '}';
            }

            if (this.target.as) {
              this.target.query += '.' + this.target.as + '()';
            }

            var groupedFuncs = _.groupBy(this.functions, function (func) {
              if (func.def.append) {
                return 'appends';
              } else {
                return 'wraps';
              }
            });

            _.each(groupedFuncs.appends, function (func) {
              _this2.target.query += '.' + func.render();
            });

            _.each(groupedFuncs.wraps, function (func) {
              _this2.target.query = func.render(_this2.target.query);
            });
          }
        }, {
          key: 'getMetrics',
          value: function getMetrics() {
            return this.datasource.metricFindQuery();
          }
        }, {
          key: 'getAggregations',
          value: function getAggregations() {
            return this.$q.when([{ text: 'avg by', value: 'avg' }, { text: 'max by', value: 'max' }, { text: 'min by', value: 'min' }, { text: 'sub by', value: 'sum' }]);
          }
        }, {
          key: 'getAs',
          value: function getAs() {
            return this.$q.when([{ text: 'None', value: 'None' }, { text: 'as_count', value: 'as_count' }, { text: 'as_rate', value: 'as_rate' }]);
          }
        }, {
          key: 'getTags',
          value: function getTags(segment) {
            var self = this;
            return this.datasource.metricFindTags().then(function (results) {
              var first = results && results[0];
              var resultsHaveRemoveText = first && first.text === self.removeText;
              var segmentIsPlusButton = segment.type === 'plus-button';
              // var removeResultsText = resultsHaveRemoveText && segmentIsPlusButton;
              if (resultsHaveRemoveText) {
                results.splice(0, 1);
              }

              if (!segmentIsPlusButton) {
                results.splice(0, 0, { text: self.removeText, value: self.removeText });
              }

              return results;
            });
          }
        }, {
          key: 'aggregationChanged',
          value: function aggregationChanged() {
            this.setQuery();
            this.target.aggregation = this.aggregationSegment.value;
            this.panelCtrl.refresh();
          }
        }, {
          key: 'metricChanged',
          value: function metricChanged() {
            this.target.metric = this.metricSegment.value;
            this.setQuery();
            this.panelCtrl.refresh();
          }
        }, {
          key: 'asChanged',
          value: function asChanged() {
            if (this.asSegment.value === 'None') {
              this.target.as = null;
            } else {
              this.target.as = this.asSegment.value;
            }
            this.setQuery();
            this.panelCtrl.refresh();
          }
        }, {
          key: 'fixTagSegments',
          value: function fixTagSegments() {
            var count = this.tagSegments.length;
            var lastSegment = this.tagSegments[Math.max(count - 1, 0)];

            if (!lastSegment || lastSegment.type !== 'plus-button') {
              this.tagSegments.push(this.uiSegmentSrv.newPlusButton());
            }
          }
        }, {
          key: 'targetChanged',
          value: function targetChanged() {
            if (this.error) {
              return;
            }

            this.setQuery();
            this.panelCtrl.refresh();
          }
        }, {
          key: 'persistFunctions',
          value: function persistFunctions() {
            this.target.functions = _.map(this.functions, function (func) {
              return {
                funcDef: func.def.name,
                params: func.params.slice()
              };
            });
          }
        }, {
          key: 'removeFunction',
          value: function removeFunction(func) {
            this.functions = _.without(this.functions, func);
            this.persistFunctions();
            this.targetChanged();
          }
        }, {
          key: 'addFunction',
          value: function addFunction(funcDef) {
            var func = dfunc.createFuncInstance(funcDef, { withDefaultParams: true });
            func.added = true;
            this.functions.push(func);
            this.persistFunctions();
            this.targetChanged();
          }
        }, {
          key: 'tagSegmentUpdated',
          value: function tagSegmentUpdated(segment, index) {
            if (segment.value === this.removeText) {
              this.tagSegments.splice(index, 1);
            }
            console.log("target segments", this.tagSegments);
            this.target.tags = _.filter(_.map(this.tagSegments, function (segment) {
              return segment.value;
            }));
            console.log("setting target tags", this.target.tags);
            this.setQuery();
            this.panelCtrl.refresh();

            var count = this.tagSegments.length;
            var lastSegment = this.tagSegments[Math.max(count - 1, 0)];

            if (!lastSegment || lastSegment.type !== 'plus-button') {
              this.tagSegments.push(this.uiSegmentSrv.newPlusButton());
            }
          }
        }, {
          key: 'getCollapsedText',
          value: function getCollapsedText() {
            return this.target.query;
          }
        }]);

        return DataDogQueryCtrl;
      }(QueryCtrl));

      _export('DataDogQueryCtrl', DataDogQueryCtrl);

      DataDogQueryCtrl.templateUrl = 'partials/query.editor.html';
    }
  };
});
//# sourceMappingURL=query_ctrl.js.map
