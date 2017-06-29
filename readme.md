# mongoose-timestamp-plugin
A simple, yet configurable plugin to add timestamps for creations and modifications of mongoose documents.

## Installation
```bash
$ npm install mongoose-timestamp-plugin
```

## Usage
```js
const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp-plugin');

const schema = new mongoose.Schema({
	forename: String,
	surname: String,
	note: String
});

schema.plugin(timestamp, {
	createdName: 'created_at', // default: 'createdAt'
	updatedName: 'updated_at', // default: 'updatedAt'
	disableCreated: false, // Disables the logging of the creation date
	disableUpdated: false // Disabled the loggin of the modification date
});

const model = mongoose.model('Person', schema);
```

