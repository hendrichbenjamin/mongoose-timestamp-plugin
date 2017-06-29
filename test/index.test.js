import test from 'ava';
import timestamp from '../index';

test('index exports the timestamp plugin', t => {
	t.true(typeof timestamp === 'function');
});
