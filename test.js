// import { expect } from 'chai';
// import BetterWebStorage from './src';

let store = {};
const { expect } = chai;

const clearStores = () => {

    window.localStorage.clear()
    window.sessionStorage.clear()
}

describe('BetterWebStorage', () => {

    before(clearStores)
    after(clearStores)

    it('Only allows localStorage or sessionStorage', () => {

        [
            {},
            { local: true, session: true },
            { local: false, session: false }
        ].forEach((opts) => {

            try {
                const x = new BetterWebStorage(opts);
                expect(x).to.not.exist();
            }
            catch (e) {
                expect(e).to.be.an('error');
            }
        });
    });

    it('References localStorage or sessionStorage', () => {

        const ls = new BetterWebStorage({ local: true });
        const ss = new BetterWebStorage({ session: true });

        expect(ls._storage).to.equal(window.localStorage);
        expect(ss._storage).to.equal(window.sessionStorage);
    });

    // Test both local storage and session storage
    [
        // name          config           storage reference
        ['LocalStorage', { local: true }, window.localStorage],
        ['SessionStorage', { session: true }, window.sessionStorage]
    ]
    .forEach(([name, config, storage]) => {

        it(`${name}: Sets json stringified keys`, () => {

            store = new BetterWebStorage(config);

            const val = [1,2,3,4];
            store.set('test', val);

            expect(storage.test).to.equal(JSON.stringify(val));
        });

        it(`${name}: Sets an entire object as keys`, () => {

            const val = {
                one: 'two',
                buckle: 'myshow'
            };

            store.set(val);

            expect(storage.one).to.equal(JSON.stringify(val.one));
            expect(storage.buckle).to.equal(JSON.stringify(val.buckle));
        });

        it(`${name}: Gets and parses a single key`, () => {

            expect(store.get('test')).to.include.members([1,2,3,4])
        });

        it(`${name}: Gets and returns an object of key values when passed multiple values`, () => {

            const vals = store.get('one', 'buckle');
            expect(vals).to.include({
                one: 'two',
                buckle: 'myshow'
            });
        });

        it(`${name}: Checks to see if has keys`, () => {

            expect(store.has('test')).to.equal(true);
            expect(store.has('test', 'one', 'buckle')).to.equal(true);
            expect(store.has('test', 'one', 'buckle', 'three')).to.equal(false);
        });

        // it(`${name}: Checks to see if has keys`, () => {

        //     expect(store.has('test')).to.equal(true);
        // });

        it(`${name}: Removes item from store`, () => {

            store.rmv('test');
            expect(store.get('test')).to.not.exist;
        });

        it(`${name}: Retrieves storage length`, () => {

            store.set('test1', true);
            store.set('test2', true);
            store.set('test3', true);
            expect(store.length).to.equal(5);
        });

        it(`${name}: Retrieves a copy of entire store`, () => {

            expect(store.all).to.include({ one: 'two',
                buckle: 'myshow',
                test1: true,
                test2: true,
                test3: true
            });
        });

        it(`${name}: Clears storage`, () => {

            store.clear();
            expect(store.length).to.equal(0);
        })

        it(`${name}: Sets keys using a prefix`, () => {

            store = new BetterWebStorage(Object.assign(config, { prefix: 'test' }));
            const store2 = new BetterWebStorage(Object.assign(config, { prefix: 'test2' }));

            store.set('test', true);
            store2.set('test', false);

            expect(storage.test).to.not.exist;
            expect(storage.test_test).to.exist;
            expect(storage.test2_test).to.exist;
            expect(storage.test_test).to.equal('true');
            expect(storage.test2_test).to.equal('false');
        });

        it(`${name}: Retrieves prefixed storage length accurately`, () => {

            store.set('test1', true);
            store.set('test2', true);
            store.set('test3', true);
            expect(store._storage.length).to.equal(5);
            expect(store.length).to.equal(4);
        });

        it(`${name}: Retrieves all prefixed items`, () => {

            expect(store.all).to.include({
                test: true,
                test1: true,
                test2: true,
                test3: true
            });
        })

        it(`${name}: Clears all prefixed items`, () => {

            store.clear();
            expect(store.length).to.equal(0);
            expect(store._storage.length).to.equal(1);
        });

        it(`${name}: Object assigns to a current object in store`, () => {

            const cur = { a: true };
            const assign = { b: false };
            store.set('cur', cur);

            expect(store.get('cur')).to.not.include(assign);

            store.assign('cur', assign);

            expect(store.get('cur')).to.include(cur);
            expect(store.get('cur')).to.include(assign);
        });

        it(`${name}: Does not allow assigns if value not an object`, () => {

            const cur = { a: true };
            const assign = 'wat';
            store.set('cur', cur);

            try {

                store.assign('cur', assign);
                expect(store.get('cur')).to.not.include(assign);
            }
            catch (e) {

                expect(e).to.be.an('error');
            }
        });

        it(`${name}: Does not allow assigns if item not an object`, () => {

            const cur = 'wat';
            const assign = { a: true };
            store.set('cur', cur);

            try {

                store.assign('cur', assign);
                expect(store.get('cur')).to.not.include(assign);
            }
            catch (e) {

                expect(e).to.be.an('error');
            }
        });

        it(`${name}: Iterates through each item in store`, () => {

            store.clear();

            const str = {
                a: true,
                b: false,
                c: 'd'
            };

            store.set(str);

            let ran = 0;

            const keys = [];
            const vals = [];

            store.each((key, val) => {

                ran++;
                keys.push(key);
                vals.push(val);
            });

            expect(keys).to.have.members(Object.keys(str));
            expect(vals).to.have.members(Object.values(str));
            expect(ran).to.equal(3);
        });

        it(`${name}: Does not iterate through each if not a function`, () => {

            try {

                store.each('lalalala');
            }
            catch (e) {

                expect(e).to.be.an('error');
            }
        });

        it(`${name}: Maps through items in store`, () => {

            store.clear();

            const str = {
                a: true,
                b: false,
                c: 'd'
            };

            store.set(str);

            const map = store
                .map((key, val) => {

                    return [key, val];
                })
                .sort(function(a, b){
                    if(a[0] < b[0]) { return -1; }
                    if(a[0] > b[0]) { return 1; }
                    return 0;
                })
                .map(([key, val]) => {

                    return { [key]: val };
                });

            expect(map[0]).to.include({ a: str.a });
            expect(map[1]).to.include({ b: str.b });
            expect(map[2]).to.include({ c: str.c });
        });

        it(`${name}: Does not map if not a function`, () => {

            try {

                store.map('lalalala');
            }
            catch (e) {

                expect(e).to.be.an('error');
            }
        });
    });

});
