const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadUtils() {
  const filePath = path.resolve(__dirname, '../js/utils.js');
  const code = fs.readFileSync(filePath, 'utf8');
  const context = {};
  vm.createContext(context);
  vm.runInContext(code, context);
  return context;
}

describe('splitJoke', () => {
  const { splitJoke } = loadUtils();

  test('joke with setup and punchline', () => {
    const result = splitJoke('Why did the chicken cross the road? To get to the other side!');
    expect(result).toEqual({
      setup: 'Why did the chicken cross the road?',
      punchline: 'To get to the other side!'
    });
  });

  test('joke with no punchline', () => {
    const result = splitJoke('I would tell you a UDP joke but you might not get it');
    expect(result).toEqual({
      setup: 'I would tell you a UDP joke but you might not get it',
      punchline: ''
    });
  });
});
