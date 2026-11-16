# Lab 1 - Mocha, Chai

Course: Professionally-oriented practicum in a foreign language.

Task: tested the matrix library Mtrx (https://github.com/zhufuge/Mtrx) using Mocha and Chai.

## How to run

```
npm install
npm test
```

Should show 39 passing.

## What is tested

- creating matrices (zeros, ones, eye, diag, rand, from array)
- rows, cols, rank, det
- isMtrx, isDiag, isSingular, isSameShape, equalAll/equalAny
- add, mul (and errors when shapes don't match)
- get/set, T (transpose), clone, cof, inv, LUP
- mapMtrx, everyMtrx, someMtrx, reduceMtrx
- changeRows/changeCols, resetLike

One thing I noticed: the README of Mtrx shows callbacks like `(i, j, value) => ...` but in the
actual code they are called as `(value, i, j)`. I checked this in node and wrote the tests based
on the real order, not what the README says.

## Control questions

1. Types of testing - by level: unit, integration, system, acceptance. By how much you know about
   the code: black box (don't see the code), white box (see the code), grey box (a bit of both).
   Also manual vs automated, and functional vs non-functional (performance, security etc), plus
   regression testing.

2. Unit testing checks one small piece (a function or class) on its own, usually with mocked
   dependencies, fast and done by developers all the time. Acceptance testing checks the whole
   app from the user's side, to see if it actually does what was asked for in the requirements -
   it's slower and more high level, often written as Given/When/Then scenarios.

3. Mocha is the test runner - it gives describe/it to organize tests and before/after hooks, and
   runs the tests and shows results, but it has no assertions by itself. Chai is the assertion
   library that you use together with Mocha to actually check values, with the expect(...) syntax
   used in this repo.
