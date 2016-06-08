'use strict';

var _ = require('lodash');
var assert = require('chai').assert;
var del = require('del');
var fs = require('fs-extra');
var os = require('os');
var path = require('path');
var sinon = require('sinon');

var osTempDir = os.tmpdir();

module.exports.assertBoundFunction = function(prototype, methodName, stub) {
	prototype[methodName] = sinon.spy();

	return function(fn) {
		fn('argument');

		assert(prototype[methodName].calledOnce);
		assert(prototype[methodName].calledWith('argument'));
	};
};

var PrototypeMethodSpy = function() {
	this.methods = [];
};

PrototypeMethodSpy.prototype.add = function(parent, methodName, stub) {
	if (!parent[methodName]) {
		throw new Error(methodName + ' is not a method of ' + parent.name);
	}

	this.methods.push({
		method: parent[methodName],
		methodName: methodName,
		parent: parent
	});

	if (stub) {
		parent[methodName] = sinon.stub();
	}
	else {
		parent[methodName] = sinon.spy();
	}

	return parent[methodName];
};

PrototypeMethodSpy.prototype.flush = function() {
	_.forEach(this.methods, function(item, index) {
		item.parent[item.methodName] = item.method;
	});

	this.methods = [];
};

module.exports.PrototypeMethodSpy = PrototypeMethodSpy;

function copyTempTheme(themeName, version, component, cb) {
	var tempPath = path.join(osTempDir, 'liferay-theme-tasks', component, version, themeName);

	fs.copy(path.join(__dirname, './fixtures/themes', version, themeName), tempPath, function(err) {
		if (err) throw err;

		process.chdir(tempPath);

		cb(tempPath);
	});
}

function cleanTempTheme(themeName, version, component) {
	var tempPath = path.join(osTempDir, 'liferay-theme-tasks', component, version, themeName);

	del.sync(path.join(tempPath, '**'), {
		force: true
	});
}

module.exports.cleanTempTheme = cleanTempTheme;
module.exports.copyTempTheme = copyTempTheme;

function deleteDirJsFromCache(relativePath) {
	var files = fs.readdirSync(path.join(__dirname, relativePath));

	_.forEach(files, function(item, index) {
		if (_.endsWith(item, '.js')) {
			deleteJsFileFromCache(path.join(__dirname, relativePath, item))
		}
	});
}

function deleteJsFileFromCache(filePath) {
	var registerTasksPath = require.resolve(filePath);

	delete require.cache[registerTasksPath];
}

function deleteJsFromCache() {
	deleteDirJsFromCache('../lib');
	deleteDirJsFromCache('../lib/prompts');
	deleteDirJsFromCache('../lib/upgrade/6.2');
	deleteDirJsFromCache('../tasks');

	deleteJsFileFromCache('../index.js');
}

module.exports.deleteJsFromCache = deleteJsFromCache;

function stripNewlines(string) {
	return string.replace(/\r?\n|\r/g, '');
}

module.exports.stripNewlines = stripNewlines;
