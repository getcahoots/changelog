/*
 * cahoots-changelog
 *
 * Copyright Cahoots.pw
 * MIT Licensed
 *
 */

/**
 * @author André König <andre@cahoots.ninja>
 *
 */

'use strict';

var marked = require('marked');
var xhr = require('xhr');

var Component = Object.create(HTMLElement.prototype);

module.exports = function instantiate () {
    document.registerElement('cahoots-changelog', {
        prototype: Component
    });
};

Component.createdCallback = function createdCallback () {
    var self = this;
    var uri = 'https://rawgit.com/wiki/getcahoots/changelog/Home.md';

    function onResponse (err, resp, body) {
        if (err) {
            console.log(err);
            return console.error('failed to fetch the changelog: ' + err.toString());
        }

        self.innerHTML = marked(body);
    }

    xhr({
        uri: uri
    }, onResponse);
};
