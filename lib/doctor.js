'use strict';

const _ = require('lodash');
const gutil = require('gulp-util');

const divert = require('./divert');
const lfrThemeConfig = require('./liferay_theme_config');

const chalk = gutil.colors;

function doctor({themeConfig = null, haltOnMissingDeps = false} = {}) {
	themeConfig = themeConfig || lfrThemeConfig.getConfig(true);

	if (!themeConfig) {
		return;
	}

	let dependencies = themeConfig.dependencies || {};

	if (!_.isEmpty(themeConfig.devDependencies)) {
		dependencies = _.defaults(dependencies, themeConfig.devDependencies);
	}

	let rubySass = themeConfig.liferayTheme.rubySass;

	if (
		!_.isUndefined(themeConfig.liferayTheme.supportCompass) &&
		_.isUndefined(rubySass)
	) {
		rubySass = themeConfig.liferayTheme.supportCompass;

		lfrThemeConfig.setConfig({
			rubySass: rubySass,
		});

		lfrThemeConfig.removeConfig(['supportCompass']);
	}

	let missingDeps = 0;

	missingDeps = divert('doctor_helpers').checkMissingDeps(
		dependencies,
		missingDeps,
		rubySass,
		logMissingDeps
	);

	checkDependencySources(themeConfig.liferayTheme);

	if (haltOnMissingDeps) {
		haltTask(missingDeps);
	}
}

function checkDependencySources(liferayTheme) {
	let baseTheme = liferayTheme.baseTheme;
	let themeletDependencies = liferayTheme.themeletDependencies;

	let localDependencies = [];

	if (_.isObject(baseTheme) && baseTheme.path) {
		localDependencies.push(baseTheme);
	}

	if (themeletDependencies) {
		_.forEach(themeletDependencies, function(item) {
			if (item.path) {
				localDependencies.push(item);
			}
		});
	}

	if (localDependencies.length) {
		logLocalDependencies(localDependencies);
	}
}

function haltTask(missingDeps) {
	if (missingDeps > 0) {
		throw new Error('Missing ' + missingDeps + ' theme dependencies');
	}
}

function logLocalDependencies(localDependencies) {
	let dependenciesString = _.map(localDependencies, function(item) {
		return item.name;
	}).join(', ');

	gutil.log(
		chalk.yellow('Warning:'),
		'you have dependencies that are installed from local modules. These should only be used for development purposes. Do not publish this npm module with those dependencies!'
	);
	gutil.log(chalk.yellow('Local module dependencies:'), dependenciesString);
}

function logMissingDeps(dependencies, moduleName, missingDeps) {
	if (!dependencies[moduleName]) {
		gutil.log(
			chalk.red('Warning:'),
			'You must install the correct dependencies, please run',
			chalk.cyan('npm i --save-dev', moduleName),
			'from your theme directory.'
		);

		missingDeps++;
	}

	return missingDeps;
}

module.exports = {
	doctor,
};
