import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppStorage, StoredAppValues } from '../src';

const local = new AppStorage(global.window.localStorage, 'hey');
const session = new AppStorage(global.window.sessionStorage, 'ho');
const asyncStorage = new AppStorage(AsyncStorage, 'lets-go');

const local2 = new AppStorage(global.window.localStorage, {
    onBeforeSet: (key: string | object, val?: any) => {

    }
});


declare module '../src' {

    export interface StoredAppValues {
        a: string,
        b: { sub: true },
        m: {
            andshe: string,
            be: string
        },
        x: boolean,
        xylophone: boolean,
    }
}

[local, session, asyncStorage].forEach(async storage => {

    // should enforce types
    storage.set('xylophone', true)
    storage.set('a', 'a');
    storage.set('b', { sub: true });

    // should allow anything
    storage.set('q', ['anything', { bool: true }]);

    // should enforce types and allow anything
    storage.set({
        a: 'true',
        b: { sub: true },
        c: 1,
        d: 2
    });

    // should enforce types
    storage.assign('b', {})
    storage.assign('m', {
        andshe: 'will',
        be: 'merged?'
    })

    // should allow anything
    storage.assign('pepe', { anything: true });


    const wholeThing = await storage.get();

    wholeThing.a;
    wholeThing.b.sub === true;
    wholeThing.m.andshe === 'text';
    wholeThing.xylophone === false;

    const one = await storage.get('a');

    const many = await storage.get(['a', 'b']);
    const manyMore = await storage.get(['a', 'b', 'm']);
    const evenManyMore = await storage.get(['a', 'b', 'm', 'x']);
    const evenTheUntyped = await storage.get(['q', 'z']);
    const evenTheTypedUntyped = await storage.get <{ q: boolean, z: string }>(['q', 'z']);

    many.a === wholeThing.a;
    many.b === wholeThing.b;

    many.a === one;

    manyMore.m === wholeThing.m;
    evenManyMore.x === wholeThing.x;

    evenTheUntyped.anything;
    evenTheTypedUntyped.q === evenManyMore.b.sub;
    evenTheTypedUntyped.z === evenManyMore.a;

    await storage.rm('a');
    await storage.rm(['a', 'b']);

    await storage.rm('pep');
    await storage.rm(['pep', 'pap']);

    await storage.clear();

    const x = await storage.entries();
    const y = await storage.keys();
    const z = await storage.values();

    const had = await storage.has('a');
    const hasMany = await storage.has(['a', 'b']);
    const hasOneUntyped = await storage.has('q');
    const hasManyUntyped = await storage.has(['q', 'z']);

    had === hasOneUntyped;

    hasMany === [true, true];
    hasManyUntyped === [true, true];
})