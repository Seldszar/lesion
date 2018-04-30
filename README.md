# Lesion

[![Greenkeeper badge](https://badges.greenkeeper.io/Seldszar/lesion.svg)](https://greenkeeper.io/)

> An instrument of unrelenting harm.

Lesion allows building custom file-based store clients by using resolvers.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Author](#author)
- [License](#license)

## Installation

```bash
npm install lesion --save
```

## Usage

```javascript
const lesion = require('lesion');

const rootPath = '/path/to/store';
const resolvers = [
  {
    extensions: ['json', 'json5'],
    deserialize: contents => JSON.parse(contents.toString('utf8')),
  },
  {
    extensions: ['log', 'txt'],
    deserialize: contents => contents.toString('utf8'),
  },
  {
    extensions: ['gif', 'jpeg', 'jpg', 'png'],
    deserialize: contents => contents,
  },
];

lesion(rootPath, { resolvers })
  .then((store) => {
    // Fetch the store value
    console.log(store.value);

    // Attach a callback called after each store change
    const disposer = store.onChange(({ newFragment, oldFragment }) => {
      console.log({ newFragment, oldFragment });
    });
  });
```

## Author

Alexandre Breteau - [@0xSeldszar](https://twitter.com/0xSeldszar)

## License

MIT © [Alexandre Breteau](https://seldszar.fr)
