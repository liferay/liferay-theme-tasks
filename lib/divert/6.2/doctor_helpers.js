function checkMissingDeps(dependencies, missingDeps, rubySass, logMissingDeps) {
	missingDeps = logMissingDeps(
		dependencies,
		'liferay-theme-deps-6.2',
		missingDeps
	);

	if (!rubySass) {
		missingDeps = logMissingDeps(dependencies, 'gulp-sass', missingDeps);
	}

	return missingDeps;
}

module.exports = {checkMissingDeps};
