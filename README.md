# Lesion

> An instrument of unrelenting harm.

Another file-based store client.

## Install

```bash
npm install lesion --save
```

## Usage

```javascript
const fs = require('fs');
const lesion = require('lesion');

// The options passed to the store client
const options = {
  resolvers: [
    {
      test: file => /\.txt$/i.test(file),
      visit: file => fs.readFileSync(file, 'utf8'),
    },
  ],
};

// Create a new store client
lesion('path/to/store', options).then((store) => {
  // Fetch the store value
  store.fetch().then((value) => {
    console.log(value);
  });

  // Function called after each change
  const onChange = (value) => {
    console.log(value);
  };

  // Watch for store changes
  store.watch(onChange, (watcher) => {
    watcher.dispose();
  });
});
```
