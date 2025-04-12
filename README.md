@environment-safe/card-swipe
============================
A buildless ESM utility for detecting CC track inputs from streaming character data and for extracting data from them, works in node.js and the browser and has utilities for working as a webcomponent or using `stdin`. Successor to [card-swipe](https://www.npmjs.com/package/card-swipe), and eventually will subsume it.

A credit card magstripe contains a string of data representing a composite of account details. A 'card present' transaction (which gives you a better retail percentage on your transaction fees) generally consists of setting a flag and passing along this data, which has strict regulations on them preventing them from ever being saved to disk. Normally a magstripe is just a keyboard as far as the OS knows, which often leads to tedious PC POS interfaces where you click into a field and then swipe the card, your other option is to build an input sniffer which allows you to scan time restricted character buffers for track data patterns, so you can react/generate events/whatever. So that's what this is, you plug keystroke input into it, it reacts whenever it sees a cardswipe. In addition it can use bin ranges on the account number to determine account type and issuer.

Usage
-----

### Code

```js
import { Scanner, CardSwipe } from '@environment-safe/credit-swipe';
let scanner = new Scanner();
new CardSwipe({
    scanner : scanner,
    onScan : (swipeData)=>{
        //do something with swipeData
    }
});

// somewhere else in the code, use scanner.input(value) to push char
// data into the scanner
```

### Command Line

This is a simple commandline utility to output the decode card information in JSON

```bash
card-swipe
```

### Command Line (Code)

An example of getting delivery and payment details using the `readline` node.js builtin: 

```js
import { getStdInSwipe } from '@environment-safe/card-swipe';
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin, output: process.stdout,
});

const question = (q)=>{
    return new Promise((resolve, reject)=>{
        try{
            rl.question(`What's your name?`, name => {
                resolve(name);
            });
        }catch(ex){ reject(ex); }
    });
};
const street = await question('Street Address:');
const city = await question('City:');
const state = await question('State:');
const zip = await question('Postal Code:');
const swipe = await getStdInSwipe();
```

### Web

```html
    <card-swipe></card-swipe>
    <script type="module">
        document.addEventListener('swipe', (e)=>{
            //e.detail contains the swipe metadata
        });
    </script>
```

To use it without a build process, you'll need something like this in your `<head>`:

```html
<script type="importmap"> { "imports": {
    "@environment-safe/character-scanner": "../node_modules/@environment-safe/character-scanner/./src/index.mjs",
    "@environment-safe/elements": "../node_modules/@environment-safe/elements/./src/index.mjs",
    "browser-or-node": "../node_modules/browser-or-node/src/index.js",
    "@environment-safe/event-emitter": "../node_modules/@environment-safe/event-emitter/./src/index.mjs",
    "sift": "../node_modules/sift/./es5m/index.js",
    "card-swipe": "../node_modules/@environment-safe/card-swipe/src/index.mjs",
    "card-swipe-element": "../node_modules/@environment-safe/card-swipe/src/web-component.mjs"
} }</script>
<script type="module">
    import 'card-swipe-element';
</script>
```

Testing
-------

### `.fake(scanner)`

pass in a scanner and get a random fake swipe

### `.generate(type)`

generate a coherent scan component all the way up to `track_data`

### Targets

Run the html demo
```bash
npm run local-server
```

Run the es module tests to test the root modules
```bash
npm run import-test
```
to run the same test inside the browser:

```bash
npm run browser-test
```
to run the same test headless in chrome, safari and firefox:
```bash
npm run headless-browser-test
```

to run the same test inside docker:
```bash
npm run container-test
```

Development
-----------
All work is done in the .mjs files and will be transpiled on commit to commonjs and tested.

If the above tests pass, then attempt a commit which will generate .d.ts files alongside the `src` files and commonjs classes in `dist`

