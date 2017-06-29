/**
 * Module for handling saving of creation and modification dates
 * @module {function} timestamp
 */
'use strict';

module.exports = timestamp;

/**
 * Adds a field/path to the given schema
 * @param {Schema} schema mongoose-schema to add the fields to
 * @param {string} pathName name of the path to add
 * @param {object} fieldSpec specification of the field to add
 * @returns {*} The updated schema
 */
function addSchemaField(schema, pathName, fieldSpec) {
	const fieldSchema = {};
	fieldSchema[pathName] = fieldSpec;
	return schema.add(fieldSchema);
}

/**
 * Mongoose plugin function which adds fields to track creation and modification dates
 * @param {Schema} schema the mongoose schema
 * @param {object} [options] the options object
 * @this mongoose.Schema
 * @access public
 * @returns {undefined}
 */
function timestamp(schema, options) {
	options = options || {};
	// Set defaults
	options = Object.assign({
		createdName: 'createdAt',
		updatedName: 'updatedAt',
		disableCreated: false,
		disableUpdated: false
	}, options);

	// Add fields if not disabled
	if (!options.disableCreated) {
		addSchemaField(schema, options.createdName, {type: Date});
	}
	if (!options.disableUpdated) {
		addSchemaField(schema, options.updatedName, {type: Date});
	}

	// Add pre-save hook to save dates of creation and modification
	schema.pre('save', preSave);

	/**
	 * Callback for the schema pre save
	 *
	 * @this mongoose.Schema
	 * @param {Function} next The next pre save callback in chain
	 * @returns {undefined}
	 */
	function preSave(next) {
		const _ref = this.get(options.createdName);

		if (!options.disableUpdated) {
			this[options.updatedName] = new Date();
		}
		if (!options.disableCreated && (_ref === undefined || _ref === null)) {
			this[options.createdName] = new Date();
		}

		next();
	}
}
