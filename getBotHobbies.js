const fs = require('fs');

const data = fs.readFileSync('./resources/botHobbies.txt', 'utf-8');

const botHobbies = data.split('\n').map(line => line.replace('\r', ''));

// console.log(botHobbies);

export { botHobbies };