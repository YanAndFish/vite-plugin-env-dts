# vite-plugin-env-dts

Auto generate env file declare for typescript of Vite plugins.

# Usage
1. Install `npm i @yafh/vite-plugin-env-dts`
2. Add it into vite config file
``` typescript
// vite.config.ts
import envDts from '@yafh/vite-plugin-env-dts'

export default defineConfig({
  plugins: [envDts()],
})
```
3. Create your env file,and start `vite`.

# How it works
1. When the `vite` service starts, the plug-in checks the [envdir](https://vitejs.dev/config/#envdir) in the vite configuration and loads all env files.
2. Parse all env files, extract key value pairs that conform to [envprefix](https://vitejs.dev/config/#envprefix) in the vite configuration, and generate typescript declaration files.
3. The generated declaration file is located in `node_modules/@types/env-dts/index.d.ts`.

For example:

.env
```env
VITE_FOO=foo
another=hello
```

.env.dev
```env
VITE_FOO=foo
VITE_BAR=bar

# multiline comment 1
# multiline comment 2
# multiline comment 3
VITE_COMMENT=comment

VITE_COMMENT_END_OF_LINE=commentEndOfLine #end-of-line comment

```

.env.dev.local
```env
VITE_FOO=foo.local
VITE_LOCAL=local
```

.env.prod
```env
VITE_FOO=foo.prod
```

declare file
``` typescript
/// <reference types="vite/client" />
  
// Auto-generated by vite-plugin-env
interface ImportMetaEnv {
  /**
   * 
   * - `default` foo
   * - `dev` foo.local
   * - `prod` foo.prod
   */
  readonly VITE_FOO: string
  /**
   * 
   * - `dev` bar
   */
  readonly VITE_BAR?: string
  /**
   * # multiline comment 1
   * # multiline comment 2
   * # multiline comment 3
   * - `dev` comment
   */
  readonly VITE_COMMENT?: string
  /**
   * #end-of-line comment
   * - `dev` commentEndOfLine
   */
  readonly VITE_COMMENT_END_OF_LINE?: string
}
```



# Options

## convertValue

- type : boolean
- default : true

Try convert env value to boolean or number.

1. enable convert value

env file :
```env
# .env

VITE_FOO=bar
VITE_BOOLEAN=true
VITE_NUMBER=10
```
```env
# .env.dev

VITE_FOO=2022
VITE_BOOLEAN=true
VITE_NUMBER=10
```

env object:
```typescript
// import.meta.env
{
  VITE_FOO: 'bar', // or 2022
  VITE_BOOLEAN: true,
  VITE_NUMBER: 10,
}
```

declare file:
```typescript
// @types/env-dts/index.d.ts

interface ImportMetaEnv {
  VITE_FOO: string | number;
  VITE_BOOLEAN: boolean;
  VITE_NUMBER: number;
}
```


2. disable convert value

env file :
```env
VITE_FOO=bar
VITE_BOOLEAN=true
VITE_NUMBER=10
```

env object:
```typescript
// import.meta.env
{
  VITE_FOO: 'bar',
  VITE_BOOLEAN: 'true',
  VITE_NUMBER: '10',
}
```

declare file:
```typescript
// @types/env-dts/index.d.ts

interface ImportMetaEnv {
  VITE_FOO: string;
  VITE_BOOLEAN: string;
  VITE_NUMBER: string;
}
```

## encoding

- type : string
- default : 'utf8'

env file encoding

## dts (0.2.2+)

- type : string

generate declare file in custom path. (eg: `typing/env.d.ts`)