import test from 'node:test';
import assert from 'node:assert/strict';
import {refresh,ApiError} from '../scripts/github.mjs';
const issue='https://github.com/a/one/issues/1', pr='https://github.com/b/two/pull/2';
const now='2026-10-14T21:00:00Z', old='2026-10-13T21:00:00Z';
const item=(number,extras={})=>({number,title:'Work',state:'open',updated_at:now,assignees:[{login:'owner'}],...extras});
test('cross-repository refresh deduplicates links and distinguishes PR states',async()=>{
  for(const [extra,state] of [[{draft:true},'draft'],[{state:'closed'},'closed'],[{state:'closed',merged_at:now},'merged']]){
    const calls=[];
    const result=await refresh([issue,pr,issue],{},async path=>{
      calls.push(path);if(path.split('/').length===3)return {private:false};
      return path.endsWith('/1')?item(1):item(2,extra);
    },now);
    assert.equal(calls.length,4);assert.equal(result.items[pr].state,state);
    assert.deepEqual(result.items[issue].assignees,['owner']);assert.ok(result.complete);
  }
});
test('partial failure preserves the actual last-success timestamp',async()=>{
  const previous={items:{[issue]:{url:issue,title:'Old',fetched_at:old}}};
  const result=await refresh([issue,pr],previous,async path=>{
    if(path.split('/').length===3)return {private:false};
    if(path.endsWith('/1'))throw new ApiError(500);
    return item(2);
  },now);
  assert.equal(result.items[issue].fetched_at,old);assert.equal(result.items[issue].stale,true);
  assert.equal(result.items[pr].fetched_at,now);assert.ok(result.usable);assert.equal(result.complete,false);
});
test('private repositories and missing items never publish cached content',async()=>{
  for(const privateRepo of [true,false]){
    const result=await refresh([issue],{items:{[issue]:{title:'DO NOT PUBLISH',fetched_at:old}}},async path=>{
      if(path.split('/').length===3)return {private:privateRepo};
      throw new ApiError(404);
    },now);
    assert.equal(result.usable,false);assert.ok(!JSON.stringify(result).includes('DO NOT PUBLISH'));
  }
});
test('rate limiting stops subsequent API requests and marks unavailable items',async()=>{
  let calls=0;
  const result=await refresh([issue,pr],{},async()=>{calls++;throw new ApiError(429);},now);
  assert.equal(calls,1);assert.equal(result.usable,false);
  assert.ok(Object.values(result.items).every(i=>i.error && !i.fetched_at));
});
