import {test} from 'node:test';
import assert from 'node:assert/strict';
import {togglePermission} from '../lib/permissions.ts';

test('edit access enables view and removing view removes edit',()=>{
  assert.deepEqual(togglePermission({view:false,edit:false},'edit'),{view:true,edit:true});
  assert.deepEqual(togglePermission({view:true,edit:true},'view'),{view:false,edit:false});
  assert.deepEqual(togglePermission({view:true,edit:true},'edit'),{view:true,edit:false});
});
