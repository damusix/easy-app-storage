import { AppStorage, StorageImplementation } from '../build';
import { expect } from 'chai';
import { assert, createSandbox } from 'sinon';

const sandbox = createSandbox();

const clearStores = () => {

    window.localStorage.clear()
    window.sessionStorage.clear()
}

const defineProps = (obj: any, props: Record<string, any>) => {

    const entries = Object.entries(props);

    Object.defineProperties(obj, entries.reduce((o, [key, val]) => {

        return {
            ...o,
            [key]: {
                configurable: false,
                enumerable: false,
                value: val,

            }
        };
    }, {}));
}

const fakeStorage = {
    clear() {

        for (const key of Object.keys(asyncStorage)) {

            delete asyncStorage[key];
        }

        return Promise.resolve();
    },
    getItem(key: string) {

        return Promise.resolve(asyncStorage[key])
    },
    removeItem(key: string) {

        delete asyncStorage[key];

        return Promise.resolve();
    },
    setItem: (key: string, value: string) => {

        asyncStorage[key] = value;

        return Promise.resolve();
    },
    multiGet: (keys: string[]) => {

        return Object.entries(asyncStorage).filter(
            ([key]) => keys.includes(key)
        );
    },
    getAllKeys: () => {

        return Promise.resolve(

            Object.keys(asyncStorage)
        );
    }
};

const asyncStorage = {} as StorageImplementation & Record<string, string>;

defineProps(asyncStorage, fakeStorage)


describe('AppStorage', () => {

    before(clearStores)
    after(clearStores)

    it('References localStorage or sessionStorage', () => {

        const ls = new AppStorage(window.localStorage);
        const ss = new AppStorage(window.sessionStorage);

        expect(ls.storage).to.equal(window.localStorage);
        expect(ss.storage).to.equal(window.sessionStorage);
    });

    // Test both local storage and session storage
    const testSuites: [string, StorageImplementation & Record<string, string>][] = [
        // name          storage reference
        ['LocalStorage', window.localStorage],
        ['SessionStorage', window.sessionStorage],
        ['AsyncStorage', asyncStorage]
    ];

    testSuites.forEach(([name, storage]) => {

        const store: {
            store: AppStorage;
            prefixed?: AppStorage;
        } = {
            store: new AppStorage(storage)
        };

        it(`${name}: Sets json stringified keys`, async () => {


            const val = [1,2,3,4];
            await store.store.set('test', val);

            expect(storage.test).to.equal(JSON.stringify(val));
        });

        it(`${name}: Sets an entire object as keys`, async () => {

            const val = {
                one: 'two',
                buckle: 'myshow'
            };

            await store.store.set(val);

            expect(storage.one).to.equal(JSON.stringify(val.one));
            expect(storage.buckle).to.equal(JSON.stringify(val.buckle));
        });

        it(`${name}: Gets and parses a single key`, async () => {

            expect(await store.store.get('test')).to.include.members([1,2,3,4])
        });

        it(`${name}: Gets and returns an object of key values when passed multiple values`, async () => {

            const vals = await store.store.get(['one', 'buckle']);
            expect(vals).to.include({
                one: 'two',
                buckle: 'myshow'
            });
        });

        it(`${name}: Checks to see if has keys`, async () => {

            expect(await store.store.has('test')).to.equal(true);
            expect(await store.store.has(['test', 'one', 'buckle'])).to.have.members([true, true, true]);
            expect(await store.store.has(['test', 'one', 'buckle', 'three'])).to.have.members([true, true, true, false]);
        });

        it(`${name}: Removes item from store`, async () => {

            await store.store.rm('test');
            expect(await store.store.get('test')).to.not.exist;
        });

        it(`${name}: Retrieves a copy of entire store`, async () => {

            await store.store.set('test1', true);
            await store.store.set('test2', true);
            await store.store.set('test3', true);

            expect(await store.store.get()).to.include({
                one: 'two',
                buckle: 'myshow',
                test1: true,
                test2: true,
                test3: true
            });
        });

        it(`${name}: Clears storage`, async () => {

            await store.store.clear();

            const ssKeys = await store.store.keys();
            const sKeys = await store.store.keys();
            expect(ssKeys.length).to.equal(0);
            expect(sKeys.length).to.equal(0);
        })

        it(`${name}: Sets keys using a prefix`, async () => {

            store.prefixed = new AppStorage(storage, 'test');
            const store2 = new AppStorage(storage, 'test2');

            await store.prefixed!.set('test', true);
            await store2.set('test', false);

            expect(storage.test).to.not.exist;
            expect(storage['test:test']).to.exist;
            expect(storage['test2:test']).to.exist;
            expect(storage['test:test']).to.equal('true');
            expect(storage['test2:test']).to.equal('false');
        });

        it(`${name}: Retrieves prefixed storage length accurately`, async () => {

            await store.prefixed!.set('test1', true);
            await store.prefixed!.set('test2', true);
            await store.prefixed!.set('test3', true);

            const pKeys = await store.prefixed!.keys();
            const sKeys = Object.keys(storage);

            expect(sKeys.length).to.equal(5);
            expect(pKeys.length).to.equal(4);
        });

        it(`${name}: Checks if it has prefixed items`, async () => {

            const t1 = await store.prefixed!.has('test1');
            const [t2, t3, t4] = await store.prefixed!.has(['test2', 'test3', 'qqq']);

            expect(t1).to.be.true;
            expect(t2).to.be.true;
            expect(t3).to.be.true;
            expect(t4).to.be.false;

            const pKeys = await store.prefixed!.keys();

            expect(pKeys.length).to.equal(4);
        });

        it(`${name}: Retrieves all prefixed items`, async () => {

            expect(await store.prefixed!.get()).to.include({
                test: true,
                test1: true,
                test2: true,
                test3: true
            });
        })

        it(`${name}: Clears all prefixed items`, async () => {

            await store.prefixed!.clear();

            const pKeys = await store.prefixed!.keys();
            const sKeys = Object.keys(storage);

            expect(pKeys.length).to.equal(0);
            expect(sKeys.length).to.equal(1);
        });

        it(`${name}: Object assigns to a current object in store`, async () => {

            const cur = { a: true };
            const assign = { b: false };
            await store.store.set('cur', cur);

            expect(await store.store.get('cur')).to.not.include(assign);

            await store.store.assign('cur', assign);

            expect(await store.store.get('cur')).to.include(cur);
            expect(await store.store.get('cur')).to.include(assign);
        });

        it(`${name}: Does not allow assigns if value not an object`, async () => {

            const cur = { a: true };
            const assign = 'wat';
            await store.store.set('cur', cur);

            try {

                await store.store.assign('cur', assign as any);
                expect(await store.store.get('cur')).to.not.include(assign);
            }
            catch (e) {

                expect(e).to.be.an('error');
            }
        });

        it(`${name}: Does not allow assigns if item not an object`, async () => {

            const cur = 'wat';
            const assign = { a: true };
            await store.store.set('cur', cur);

            try {

                await store.store.assign('cur', assign);
                expect(await store.store.get('cur')).to.not.include(assign);
            }
            catch (e) {

                expect(e).to.be.an('error');
            }
        });
    });

    it('handles lifecycle options', async () => {

        const onBeforeSet = sandbox.fake();
        const onAfterSet = sandbox.fake();
        const onBeforeRemove = sandbox.fake();
        const onAfterRemove = sandbox.fake();

        const storage = new AppStorage(window.localStorage, {
            prefix: 'hooks',
            onBeforeSet,
            onAfterSet,
            onBeforeRemove,
            onAfterRemove
        });

        await storage.set('test', true);

        assert.calledWith(onBeforeSet, 'test', true);
        assert.calledWith(onAfterSet, 'test', true);
        sandbox.resetHistory();

        const _with = {
            everybody: 'boogaloo'
        };

        await storage.set(_with);

        assert.calledWith(onBeforeSet, _with);
        assert.calledWith(onAfterSet, _with);
        sandbox.resetHistory();

        await storage.rm('test');

        assert.calledWith(onBeforeRemove, 'test');
        assert.calledWith(onAfterRemove, 'test');
        sandbox.resetHistory();

        await storage.set({
            a: '1',
            b: '2',
            c: '3'
        });

        const _rm = ['a', 'b', 'c']

        await storage.rm(_rm);

        assert.calledWith(onBeforeRemove, _rm);
        assert.calledWith(onAfterRemove, _rm);
        sandbox.resetHistory();

        const _set = {

            a: '1',
            b: '2',
            c: '3'
        }

        const _ass = { ign: 'true' };

        await storage.set('ass', _set);
        sandbox.resetHistory();

        await storage.assign('ass', _ass);

        assert.calledWith(onBeforeSet, 'ass', { ..._set, ..._ass });
        assert.calledWith(onAfterSet, 'ass', { ..._set, ..._ass });
    });
});
