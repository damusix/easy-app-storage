rm -rf build;

yarn rollup -c;

yarn ts-node scripts/updatePackage.ts;

yarn tsc --emitDeclarationOnly

mv build/index.d.ts build/types.d.ts

cp readme.md build/readme.md