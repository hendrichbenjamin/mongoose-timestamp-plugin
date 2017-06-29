import test from 'ava';
import mongoose from 'mongoose';
import timestamp from '../lib/timestamp';

let modelCounter = 0;

function defineModel(t, options) {
	const definition = {
		someField: {type: String},
		anEmailField: {type: String},
		someOtherField: {type: Boolean}
	};
	const schema = new mongoose.Schema(definition);
	schema.plugin(timestamp, options);

	t.context.model = mongoose.model('dummyModel' + modelCounter, schema);
	modelCounter += 1;
	return t.context.model;
}

test.cb.before('connect mongoose', t => {
	mongoose.connection.openUri('mongodb://localhost/mongoose-timestamp-plugin');
	mongoose.connection.once('open', t.end);
});

test.cb.after.always('disconnect mongoose', t => {
	mongoose.connection.close(t.end);
});

test.beforeEach('define dummy', t => {
	t.context.document = {
		someField: 'should not care',
		anEmailField: 'some@address.com',
		someOtherField: true
	};
});

test.cb.afterEach.always('cleanup', t => {
	t.context.model.remove({}, err => {
		delete mongoose.connection.models[t.context.model.modelName];
		t.end(err);
	});
});

test.cb('offer the abilitiy to change the field names', t => {
	const options = {createdName: 'created_at', updatedName: 'updated_at'};

	defineModel(t, options).create(t.context.document, (err, doc) => {
		if (err) {
			return t.end(err);
		}

		t.truthy(doc[options.createdName]);
		t.truthy(doc[options.updatedName]);
		t.end();
	});
});

test.cb('offer the ability to disable the createdAt field', t => {
	const options = {createdName: 'created', updatedName: 'updated', disableCreated: true};

	defineModel(t, options).create(t.context.document, (err, doc) => {
		if (err) {
			return t.end(err);
		}

		t.falsy(doc[options.createdName]);
		t.truthy(doc[options.updatedName]);
		t.end();
	});
});

test.cb('offer the ability to disable the updatedAt field', t => {
	const options = {createdName: 'creat0red', updatedName: 'updat0red', disableUpdated: true};

	defineModel(t, options).create(t.context.document, (err, doc) => {
		if (err) {
			return t.end(err);
		}

		t.truthy(doc[options.createdName]);
		t.falsy(doc[options.updatedName]);
		t.end();
	});
});

test.cb('should save the creation date', t => {
	const dateBefore = new Date();
	defineModel(t).create(t.context.document, (err, doc) => {
		if (err) {
			return t.end(err);
		}

		const dateAfter = new Date();
		t.true(dateBefore < doc.createdAt, 'created should after dateBefore');
		t.true(doc.createdAt < dateAfter, 'created should be before dateAfter');
		t.end();
	});
});

test.cb('should save the modification date', t => {
	const beforeSave = new Date();
	defineModel(t);

	t.context.model.create(t.context.document, (err, doc) => {
		if (err) {
			return t.end(err);
		}
		const afterSave = new Date();

		doc.someField = 'nothing to see here';

		const beforeUpdate = new Date();
		doc.save(err => {
			if (err) {
				return t.end(err);
			}
			const afterUpdate = new Date();

			t.context.model.findById(doc._id, (err, updatedDoc) => {
				if (err) {
					return t.end(err);
				}
				t.true(beforeSave < updatedDoc.createdAt, 'createdAt should after beforeSave');
				t.true(updatedDoc.createdAt < afterSave, 'createdAt should be before afterSave');
				t.true(beforeUpdate < updatedDoc.updatedAt, 'updatedAt should after beforeUpdate');
				t.true(updatedDoc.updatedAt < afterUpdate, 'updatedAt should be before afterUpdate');
				t.end();
			});
		});
	});
});

test.cb('should not throw if no options are defined', t => {
	defineModel(t, null).create(t.context.document, err => {
		t.falsy(err);
		t.end();
	});
});
