(function (angular) {
    'use strict';

    angular.module('hk.pager', []).factory('Pagination', [function () {

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

        Pagination.prototype.init = function () {
            this.items = this.total;
            this.total = Math.ceil(this.total / this.perPage);
            if (this.page > this.total) {
                this.page = this.total;
            }
            this.active = this.page;
            this.generateRange(this.page);
            this.toggleButtons();
            this.initLimitAndOffset();
            this.initialized = true;
            return this;
        };

        Pagination.prototype.next = function (page) {
            if (page && page <= this.total) {
                if (this.mode === this.modes.ASYNC) {
                    this.callAsync(page, page, this.handleNextMetaDataChange);
                } else {
                    this.handleNextMetaDataChange(page);
                }
            } else {
                if (this.hasNext()) {
                    if (this.mode === this.modes.ASYNC) {
                        this.callAsync(++this.page, ++this.active, this.handleNextMetaDataChange);
                    } else {
                        this.handleNextMetaDataChange(++this.active);
                    }
                }
            }
        };

        Pagination.prototype.previous = function () {
            if (this.hasPrevious()) {
                if (this.mode === this.modes.ASYNC) {
                    this.callAsync(--this.page, --this.active, this.handlePreviousMetaDataChange);
                } else {
                    this.handlePreviousMetaDataChange(--this.active);
                }
            }
        };

        Pagination.prototype.callAsync = function (page, active, fn) {
            fn = angular.isFunction(fn) ? fn.bind(this) : angular.noop;
            if (angular.isFunction(this.asyncPager)) {
                this.asyncPager({
                    offset: this.getFutureOffset(page),
                    perPage: this.perPage
                }, function () {
                    fn(active);
                }.bind(this));
            }
        };

        Pagination.prototype.handleNextMetaDataChange = function (active) {
            this.active = active;
            this.page = active;
            if (this.active > this.last) {
                this.generateRange(this.active, true);
            }
            this.initLimitAndOffset();
            this.toggleButtons();
        };

        Pagination.prototype.handlePreviousMetaDataChange = function (active) {
            this.active = active;
            if (this.active < this.first) {
                this.generateRange(this.active);
            }
            this.initLimitAndOffset();
            this.toggleButtons();
        };

        Pagination.prototype.generateSummary = function () {
            var start = Math.max(0, ((this.perPage * this.active) - this.perPage));
            var end = start + this.range;
            if (end > this.items) {
                end = this.items;
            }
            this.summary = start + ' - ' + end;
        };

        Pagination.prototype.getFutureOffset = function (active) {
            active = active || 0;
            return active === 1 ? 0 : ((this.perPage * active) - this.perPage);
        };

        Pagination.prototype.initLimitAndOffset = function () {
            this.offset = this.active === 1 ? 0 : ((this.perPage * this.active) - this.perPage);
            this.generateSummary();
        };

        Pagination.prototype.update = function (range, decreased) {
            if (this.range > 0) {
                this.range = range;
                this.total = Math.max(0, this.meta.total - decreased);
                this.generateSummary();
            }
        };

        Pagination.prototype.getNextPage = function () {
            return this.active < this.total ? ++this.active : --this.active;
        };

        Pagination.prototype.generateRange = function (start, isNext) {
            var i = 1;
            var end = this.total;
            if (start > this.perPage) {
                if (isNext) {
                    i = start;
                    end = i + (this.perPage - 1);
                    if (end > this.total) {
                        end = this.total;
                        i = i - this.perPage;
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
            this.generateSummary();
        };

        Pagination.prototype.hasNext = function () {
            return this.active !== this.total;
        };

        Pagination.prototype.hasPrevious = function () {
            return this.active !== 1;
        };

        Pagination.prototype.toggleButtons = function () {
            this.prevBtn = this.hasPrevious();
            this.nextBtn = this.hasNext();
        };

        Pagination.prototype.setAsyncHandler = function (fn) {
            if (angular.isFunction(fn)) {
                this.asyncPager = fn;
            }
        };

        return Pagination;
    }]).directive('hkPager', [function () {
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
                scope.pagination = scope.hkPager;
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

}(angular, undefined));