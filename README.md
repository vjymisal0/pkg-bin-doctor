# pkg-bin-doctor

Check `package.json` `bin` entries before publishing a Node CLI package.

It catches the boring mistakes that make installed CLIs fail:

- missing `bin` field
- `bin` path points to a missing file
- bin file has no shebang (`#!/usr/bin/env node`)
- bin file is not executable on Unix-like systems

No dependencies.

## Usage

```sh
npx pkg-bin-doctor
```

Check another package directory:

```sh
npx pkg-bin-doctor ./path/to/package
```

## Local install

```sh
npm install --save-dev pkg-bin-doctor
npx pkg-bin-doctor
```

## Why

Small CLI packages often publish successfully but fail after install because the `bin` target is wrong or lacks a shebang. `pkg-bin-doctor` is a tiny pre-publish check for that exact problem.

## License

MIT
