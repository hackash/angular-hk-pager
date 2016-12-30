(function (angular) {
    'use strict';

    // private functions

    function _callAsync(page, active, fn) {
        fn = angular.isFunction(fn) ? fn.bind(this) : angular.noop;
        if (angular.isFunction(this.asyncPager)) {
            this.asyncPager({
                offset: _getFutureOffset.call(this, page),
                perPage: this.perPage
            }, function () {
                fn(active);
            }.bind(this));
        }
    }

    function _handleNextMetaDataChange(active) {
        this.active = active;
        this.page = active;
        if (this.active > this.last) {
            _generateRange.call(this, this.active, true);
        }
        _initLimitAndOffset.call(this);
        _toggleButtons.call(this);
    }

    function _handlePreviousMetaDataChange(active) {
        this.active = active;
        if (this.active < this.first) {
            _generateRange.call(this, this.active);
        }
        _initLimitAndOffset.call(this);
        _toggleButtons.call(this);
    }

    function _generateSummary() {
        var start = Math.max(0, ((this.perPage * this.active) - this.perPage));
        var end = start + this.range;
        if (end > this.items) {
            end = this.items;
        }
        this.summary = start + ' - ' + end;
    }

    function _generateRange(start, isNext) {
        var i = 1;
        var end = this.total;
        if (start > this.perPage) {
            if (isNext) {
                i = start;
                end = i + (this.perPage - 1);
                if (end > this.total) {
                    end = this.total;
                }
            } else {
                end = start;
                i = end - this.perPage;
            }
        } else {
            if (this.total > this.perPage) {
                end = this.perPage;
            }
        }
        this.first = i;
        this.last = end;
        this.pages = [];
        for (; i <= end; i++) {
            this.pages.push(i);
        }
        _generateSummary.call(this);
    }

    function _toggleButtons() {
        this.prevBtn = this.hasPrevious();
        this.nextBtn = this.hasNext();
    }

    function _getFutureOffset(active) {
        active = active || 0;
        return active === 1 ? 0 : ((this.perPage * active) - this.perPage);
    }

    function _initLimitAndOffset() {
        this.offset = this.active === 1 ? 0 : ((this.perPage * this.active) - this.perPage);
        _generateSummary.call(this);
    }

    angular.module('hk.pager', []).factory('Pagination', [function () {

        // pagination constructor function
        var Pagination = function (params, mode) {
            this.page = params.page || 1;
            this.modes = Object.freeze({
                ASYNC: 'async',
                DEFAULT: 'default'
            });
            this.perPage = params.perPage || 10;
            this.pages = [];
            this.prevBtn = false;
            this.nextBtn = false;
            this.range = params.range || 10;
            this.total = params.total;
            this.mode = (mode && angular.isString(mode) && this.modes[mode.toUpperCase()]) ? mode : this.modes.DEFAULT;
            this.initialized = false;
            this.asyncPager = angular.noop;
        };

        // public functions
        Pagination.prototype.init = function () {
            if (!this.initialized) {
                this.items = this.total;
                this.total = Math.ceil(this.total / this.perPage);
                if (this.page > this.total) {
                    this.page = this.total;
                }
                this.active = this.page;
                _generateRange.call(this, this.page);
                _toggleButtons.call(this);
                _initLimitAndOffset.call(this);
                this.initialized = true;
            }
            return this;
        };

        Pagination.prototype.next = function (page) {
            if (page && page <= this.total) {
                if (this.mode === this.modes.ASYNC) {
                    _callAsync.call(this, page, page, _handleNextMetaDataChange.bind(this));
                } else {
                    _handleNextMetaDataChange.call(this, page);
                }
            } else {
                if (this.hasNext()) {
                    if (this.mode === this.modes.ASYNC) {
                        _callAsync.call(this, ++this.page, ++this.active, _handleNextMetaDataChange.bind(this));
                    } else {
                        _handleNextMetaDataChange.call(this, ++this.active);
                    }
                }
            }
        };

        Pagination.prototype.previous = function () {
            if (this.hasPrevious()) {
                if (this.mode === this.modes.ASYNC) {
                    _callAsync.call(this, --this.page, --this.active, _handlePreviousMetaDataChange.bind(this));
                } else {
                    _handlePreviousMetaDataChange.call(this, --this.active);
                }
            }
        };

        Pagination.prototype.hasNext = function () {
            return this.active !== this.total;
        };

        Pagination.prototype.hasPrevious = function () {
            return this.active !== 1;
        };

        Pagination.prototype.setAsyncHandler = function (fn) {
            if (this.mode === this.modes.ASYNC && angular.isFunction(fn)) {
                this.asyncPager = fn;
            }
        };

        return Pagination;
    }]).directive('hkPager', ['Pagination', function (Pagination) {
        return {
            restrict: 'EA',
            scope: {
                hkPager: '='
            },
            template: '<nav>' +
            '<style> .pagination>li>a.active {background-color: #428bca;border-color: #428bca; color: #fff;}</style>' +
            '<ul class="pagination">' +
            '<li>' +
            '<a href="" aria-label="Previous" ng-click="pagination.previous()" ng-if="pagination.prevBtn"> ' +
            '<span aria-hidden="true">&laquo;</span>' +
            '</a>' +
            '</li> ' +
            '<li ng-repeat="page in pagination.pages track by $index"><a href=""  ng-class="{\'active\' : page === pagination.active}"  ng-click="pagination.next(page)">{{page}}</a></li> ' +
            '<li>' +
            '<a href="" aria-label="Next" ng-click="pagination.next()" ng-if="pagination.nextBtn"> ' +
            '<span aria-hidden="true">&raquo;</span>' +
            '</a>' +
            '</li> ' +
            '</ul>' +
            '</nav>',
            link: function (scope, elem, attrs) {
                if (scope.hkPager instanceof Pagination) {
                    scope.pagination = scope.hkPager;
                } else {
                    throw TypeError('Pagination object instance must be passed in.')
                }
            }
        };
    }]).filter('offset', function () {
        return function (input, idx) {
            var i = idx, len = input.length, result = [];
            for (; i < len; i++)
                result.push(input[i]);
            return result;
        };
    });

}(angular));