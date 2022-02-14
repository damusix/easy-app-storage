// import { expect } from 'chai';
// import AppStorage from './src';

const { expect } = chai;

const clearStores = () => {

    window.localStorage.clear()
    window.sessionStorage.clear()
}

const TheInstance = AppStorage.default;

describe('AppStorage', () => {

    before(clearStores)
    after(clearStores)

    it('References localStorage or sessionStorage', () => {

        const ls = new TheInstance(localStorage);
        const ss = new TheInstance(sessionStorage);

        expect(ls.storage).to.equal(window.localStorage);
        expect(ss.storage).to.equal(window.sessionStorage);
    });

    // Test both local storage and session storage
    [
        // name          storage reference
        ['LocalStorage', window.localStorage],
        ['SessionStorage', window.sessionStorage]
    ]
    .forEach(([name, storage]) => {

        const store = {
            instance: new TheInstance(storage)
        };

        it(`${name}: Sets json stringified keys`, async () => {


            const val = [1,2,3,4];
            await store.instance.set('test', val);

            expect(storage.test).to.equal(JSON.stringify(val));
        });

        it(`${name}: Sets an entire object as keys`, async () => {

            const val = {
                one: 'two',
                buckle: 'myshow'
            };

            await store.instance.set(val);

            expect(storage.one).to.equal(JSON.stringify(val.one));
            expect(storage.buckle).to.equal(JSON.stringify(val.buckle));
        });

        it(`${name}: Gets and parses a single key`, async () => {

            expect(await store.instance.get('test')).to.include.members([1,2,3,4])
        });

        it(`${name}: Gets and returns an object of key values when passed multiple values`, async () => {

            const vals = await store.instance.get(['one', 'buckle']);
            expect(vals).to.include({
                one: 'two',
                buckle: 'myshow'
            });
        });

        it(`${name}: Checks to see if has keys`, async () => {

            expect(await store.instance.has('test')).to.equal(true);
            expect(await store.instance.has(['test', 'one', 'buckle'])).to.have.members([true, true, true]);
            expect(await store.instance.has(['test', 'one', 'buckle', 'three'])).to.have.members([true, true, true, false]);
        });

        it(`${name}: Removes item from store`, async () => {

            await store.instance.rm('test');
            expect(await store.instance.get('test')).to.not.exist;
        });

        it(`${name}: Retrieves storage length`, async () => {

            await store.instance.set('test1', true);
            await store.instance.set('test2', true);
            await store.instance.set('test3', true);
            expect(store.instance.length).to.equal(5);
        });

        it(`${name}: Retrieves a copy of entire store`, async () => {

            expect(await store.instance.get()).to.include({
                one: 'two',
                buckle: 'myshow',
                test1: true,
                test2: true,
                test3: true
            });
        });

        it(`${name}: Clears storage`, async () => {

            await store.instance.clear();
            expect(store.instance.length).to.equal(0);
            expect(storage.length).to.equal(0);
        })

        it(`${name}: Sets keys using a prefix`, async () => {

            store.prefixed = new TheInstance(storage, 'test');
            const store2 = new TheInstance(storage, 'test2');
            console.log(storage)

            await store.prefixed.set('test', true);
            await store2.set('test', false);

            console.log(storage)

            expect(storage.test).to.not.exist;
            expect(storage['test:test']).to.exist;
            expect(storage['test2:test']).to.exist;
            expect(storage['test:test']).to.equal('true');
            expect(storage['test2:test']).to.equal('false');
        });

        it(`${name}: Retrieves prefixed storage length accurately`, async () => {

            await store.prefixed.set('test1', true);
            await store.prefixed.set('test2', true);
            await store.prefixed.set('test3', true);
            expect(await storage.length).to.equal(5);
            expect(await store.prefixed.length).to.equal(4);
        });

        it(`${name}: Retrieves all prefixed items`, async () => {

            expect(await store.prefixed.get()).to.include({
                test: true,
                test1: true,
                test2: true,
                test3: true
            });
        })

        it(`${name}: Clears all prefixed items`, async () => {

            await store.prefixed.clear();
            expect(store.prefixed.length).to.equal(0);
            expect(storage.length).to.equal(1);
        });

        it(`${name}: Object assigns to a current object in store`, async () => {

            const cur = { a: true };
            const assign = { b: false };
            await store.instance.set('cur', cur);

            expect(await store.instance.get('cur')).to.not.include(assign);

            await store.instance.assign('cur', assign);

            expect(await store.instance.get('cur')).to.include(cur);
            expect(await store.instance.get('cur')).to.include(assign);
        });

        it(`${name}: Does not allow assigns if value not an object`, async () => {

            const cur = { a: true };
            const assign = 'wat';
            await store.instance.set('cur', cur);

            try {

                await store.instance.assign('cur', assign);
                expect(await store.instance.get('cur')).to.not.include(assign);
            }
            catch (e) {

                expect(e).to.be.an('error');
            }
        });

        it(`${name}: Does not allow assigns if item not an object`, async () => {

            const cur = 'wat';
            const assign = { a: true };
            await store.instance.set('cur', cur);

            try {

                await store.instance.assign('cur', assign);
                expect(await store.instance.get('cur')).to.not.include(assign);
            }
            catch (e) {

                expect(e).to.be.an('error');
            }
        });
    });

});
