import EventEmitter from 'event-emitter';
import { CHANGE_GLOBAL_ARGS, GLOBAL_ARGS_CHANGED } from '@storybook/core-events';

import { Module, API } from '../index';
import initGlobalArgs, { SubAPI, SubState } from '../modules/globalArgs';

function createMockStore() {
  let state = {};
  return {
    getState: jest.fn().mockImplementation(() => state),
    setState: jest.fn().mockImplementation(s => {
      state = { ...state, ...s };
    }),
  };
}

function createMockModule() {
  // This mock module doesn't have all the fields but we don't use them all in this sub-module
  return ({ store: createMockStore() } as unknown) as Module;
}

describe('stories API', () => {
  it('sets a sensible initialState', () => {
    const { state } = initGlobalArgs(createMockModule());

    expect(state).toEqual({
      globalArgs: {},
    });
  });

  it('updates the state when the preview emits GLOBAL_ARGS_CHANGED', () => {
    const mod = createMockModule();
    const { state, init } = initGlobalArgs(mod);
    mod.store.setState(state);

    const api = new EventEmitter() as API;
    init({ api });

    api.emit(GLOBAL_ARGS_CHANGED, { a: 'b' });
    expect(mod.store.getState()).toEqual({ globalArgs: { a: 'b' } });

    api.emit(GLOBAL_ARGS_CHANGED, { a: 'c' });
    expect(mod.store.getState()).toEqual({ globalArgs: { a: 'c' } });

    // SHOULD NOT merge global args
    api.emit(GLOBAL_ARGS_CHANGED, { d: 'e' });
    expect(mod.store.getState()).toEqual({ globalArgs: { d: 'e' } });
  });

  it('emits CHANGE_GLOBAL_ARGS when setGlobalArgs is called', () => {
    const { init, api } = initGlobalArgs({} as Module);

    const fullApi = ({ emit: jest.fn(), on: jest.fn() } as unknown) as API;
    init({ api: fullApi });

    api.setGlobalArgs({ a: 'b' });
    expect(fullApi.emit).toHaveBeenCalledWith(CHANGE_GLOBAL_ARGS, { a: 'b' });
  });
});