#!/usr/bin/env node
import { getStdInSwipe } from '../src/index.mjs';
const swipe = await getStdInSwipe();
console.log(JSON.stringify(swipe, undefined, '    '));