(function (angular) {
    'use strict';

    angular.module('hk.pager', []).factory('Pagination', [function () {

        var Pagination = function (params) {
            this.page = params.page || 1;
            this.perPage = params.perPage || 10;
            this.pages = [];
            this.prevBtn = false;
            this.nextBtn = false;
            this.range = params.range || 10;
            this.total = params.total;
        };

        Pagination.prototype.init = function () {
            this.total = Math.ceil(this.total / this.perPage);
            if (this.page > this.total) {
                this.page = this.total;
            }
            this.active = this.page;
            this.generateRange(this.page);
            this.toggleButtons();
            return this;
        };

        Pagination.prototype.next = function (page) {
            if (page && page <= this.total) {
                this.active = page;
            } else {
                if (this.hasNext()) {
                    this.active += 1;
                }
            }
            if (this.active > this.last) {
                this.generateRange(this.active, true);
            }
            this.toggleButtons();
        };

        Pagination.prototype.previous = function () {
            if (this.hasPrevious()) {
                this.active -= 1;
                if (this.active < this.first) {
                    this.generateRange(this.active);
                }
                this.toggleButtons();
            }
        };

        Pagination.prototype.generateSummary = function () {
            var start = Math.max(0, ((this.perPage * this.page) - this.perPage));
            var end = start + this.range;
            this.summary = start + ' - ' + end;
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

        return Pagination;
    }]).directive('hkPager', ['Pagination', function (Pagination) {
        return {
            restrict: 'EA',
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
                var params = scope.$eval(attrs.hkPager);
                scope.pagination = new Pagination(params).init();
                console.log('scope.pagination', scope.pagination);
            }
        };
    }]);

}(angular, undefined));