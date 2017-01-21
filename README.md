# angular-hk-pager

> A simple lightweight pagination module for angular js

[![Build Status](https://travis-ci.org/hackash/angular-hk-pager.svg?branch=master)](https://travis-ci.org/hackash/angular-hk-pager)

## Installation

Add angular-hk-pager to your project:

```
bower install --save angular-hk-pager
```

Add it to your HTML file

```html
<script src="bower_components/angular-hk-pager/dist/angular-hk-pager.min.js"></script>
```

Reference it as a dependency for your app module:

```js
angular.module('myApp', ['hk.pager']);
```

### Requirements

This module requires:

* Angular.JS only

## Usage (default) static data

Create an instance of Pagination constructor function

```
var pagerParams = {
       perPage: 10,
       total: $scope.posts.length, // entire data length 
       page: 1
    };
```

```
$scope.pagination = new Pagination(pagerParams).init();
```


Use the `hk-pager` directive to show a pagination controls:

```html
<div hk-pager="pagination"></div>
```

## Usage (async) dynamic data

Create an instance of Pagination constructor function, by passing mode flag with the value of `async`

```
var pagerParams = {
       perPage: 10, 
       page: 1
    };
```

```
$scope.pagination = new Pagination(pagerParams, 'async').init();
```

Create a wrapper function, which gets data by requesting to server

```
 $scope.getData = function (params, done) {
    done = angular.isFunction(done) ? done : angular.noop;
    Data.getData(params).then(function (data) {
        $scope.posts = data.posts;
        if (!$scope.pagination.initialized) {
           $scope.pagination.total = data.total;
           $scope.pagination.init();
        }
        done();
    });
 }
```


Set async handler (function that will be invoked by Pagination function)

```
$scope.pagination.setAsyncHandler($scope.getData);
```

Now every time when you click on next, prev or page buttons, 
`$scope.getData` function will be invoked with the following arguments

### params (object)
```
   {
     offset: $scope.pagination.offset,
     perPage: $scope.pagination.perPage
   } 
```

### done (function)
must be called after resolving the promise


Use the `hk-pager` directive to show a pagination controls:

```html
<div hk-pager="pagination"></div>
```

## methods

`pagination.next(page)`
 * navigates to next page if page param was not passed in and if has next
 * navigates to specified page if page number is in range
 
`pagination.previous()`
  * navigates to previous page if has previous
  
`pagination.init()`
  * initializes pagination object
  
`pagination.hasNext()`
  * returns `true` whether pagination has next page, otherwise `false`
  
`pagination.hasPrevious()`
  * returns `true` whether pagination has previous page,  otherwise `false`
  
`pagination.setAsyncHandler()`
  * sets async handler (available only when `pagination.mode` is set to `async`)
  

### examples

* [async](example/async-paging.html)
* [default](example/default-paging.html)
  
  

### License
```
Copyright (C) 2015-2016 by Ashot Harutyunyan <ashot.todo@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

```