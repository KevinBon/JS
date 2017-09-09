

function generatorIsFun({from = 0, to = 100, step = 1, yields = {}}) {    
  
  function getCompiledYields(yieldsSrc) {
    return Object.keys(yieldsSrc)
      .map(key => { return { comparator: key, output: yieldsSrc[key] }; })
      .sort(el => el.comparator)
    ;
  }

  let compiledYields = getCompiledYields(yields);

  function* result(value) {
    for (let compiledYield of compiledYields) {
        if (value % compiledYield.comparator === 0) {
            yield compiledYield.output;
            return;
        };
    }
    yield value;
  }
  
  return function* () {
    for (let i = from; i <= to; i += step) {
      yield* result(i);
    }
  }();
};

var simpleGenerator = new generatorIsFun({ from: 0, to: 5});
var oddEven = new generatorIsFun({ yields: { 1: 'odd', 2: 'even'}});
var fizzBuzz = new generatorIsFun({
  from: 1, 
  to: 100,
  yields: {
    15: 'FizzBuzz',
    3: 'Fizz',
    5: 'Buzz'
  }
});

for (let iterResult of simpleGenerator) {
 console.log(iterResult);
}
// 0
// 1
// 2
// 3
// 4
// 5

