import { AppStorage } from '../src';


const local = new AppStorage(global.window.localStorage, 'hey');
const session = new AppStorage(global.window.sessionStorage, 'ho');

[local, session].forEach(async storage => {


    storage.set('a', 'a');
    storage.set('a', true);
    storage.set('a', null);
    storage.set('a', 0);
    storage.set('a', { a: true });
    storage.set('a', [{ a: true }]);

    storage.set({
        a: true,
        b: false,
        c: 1,
        d: 2
    });

    storage.assign('a', {})
    storage.assign('a', [])

    const wholeThing = await storage.get <{ a: true, b: string }>();

    wholeThing.a;
    wholeThing.b;

    const one = await storage.get <string>('x');

    const many = await storage.get <{ a: string, b: string }>(['a', 'b']);

    many.a;
    many.b;

    many.a === one;

    await storage.rm('a');
    await storage.rm(['a', 'b']);

    await storage.clear();

    const x = await storage.entries();
    const y = storage.keys();
    const z = await storage.values();

    const had = await storage.has('a');
    const hasMany = await storage.has(['a', 'b']);

    had === true;

    hasMany === [true, true];
})