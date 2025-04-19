// Default and Personal information

const TelegramBot = require('node-telegram-bot-api');

// my personal token
const token = '7681893707:AAGEZq3Fp25jYpRYb3DBzOmtxT3pp1wryno';

// Создаем бота
const bot = new TelegramBot(token, { polling: true });

// Хранение языка пользователей по chatId
const userLanguage = {};

// Хранение текущего состояния пользователя (какую функцию он выбрал)
const userState = {};

// Сообщения для каждого языка
const messages = {
  en: {
    welcome: 'Welcome! 🤖',
    functionList: 'Choose one of the available functions:\n/factorization — Prime factorization\n/gcd — Greatest Common Divisor (GCD)',
    askNumber: 'Please send me a number greater than 1.',
    result: (n, res) => `Prime factors of ${n}: ${res}`,
    gcdResult: (a, b, res) => `The GCD of ${a} and ${b} is: ${res}`,
    invalid: '❗ Please enter a valid number greater than 1.',
    gcdInstruction: 'Please enter two numbers separated by a space or comma, and I will calculate their GCD.',
    factorInstruction: 'Please enter a number greater than 1, and I will perform prime factorization.',
  },
  ru: {
    welcome: 'Привет! 🤖',
    functionList: 'Выберите одну из доступных функций:\n/factorization — Разложение на простые множители\n/gcd — НОД (наибольший общий делитель)',
    askNumber: 'Пожалуйста, отправь число больше 1.',
    result: (n, res) => `Простые множители числа ${n}: ${res}`,
    gcdResult: (a, b, res) => `НОД чисел ${a} и ${b}: ${res}`,
    invalid: '❗ Пожалуйста, введите корректное число больше 1.',
    gcdInstruction: 'Введите два числа через пробел или запятую, и я найду их НОД.',
    factorInstruction: 'Введите одно число больше 1, и я разложу его на простые множители.',
  },
  uk: {
    welcome: 'Привіт! 🤖',
    functionList: 'Виберіть одну з доступних функцій:\n/factorization — Розкладання на прості множники\n/gcd — НОД (найбільший спільний дільник)',
    askNumber: 'Будь ласка, надішліть число більше 1.',
    result: (n, res) => `Прості множники числа ${n}: ${res}`,
    gcdResult: (a, b, res) => `НОД чисел ${a} і ${b}: ${res}`,
    invalid: '❗ Будь ласка, введіть коректне число більше 1.',
    gcdInstruction: 'Введіть два числа через пробіл або кому, і я знайду їх НСД.',
    factorInstruction: 'Введіть одне число більше 1, і я розкладу його на прості множники.',
  },
};

// Функция разложения числа на простые множители
function primeFactors(n) {
  const factors = [];
  let divisor = 2;
  while (n >= 2) {
    if (n % divisor === 0) {
      factors.push(divisor);
      n /= divisor;
    } else {
      divisor++;
    }
  }
  return factors;
}

// Функция нахождения НОД
function gcd(num1, num2) {
  let factors1 = primeFactors(num1);
  let factors2 = primeFactors(num2);
  let gcdArray = [];
  for (let i = 0; i < factors1.length; i++) {
    for (let j = 0; j < factors2.length; j++) {
      if (factors1[i] === factors2[j]) {
        gcdArray.push(factors1[i]);
        factors2.splice(j, 1);
        break;
      }
    }
  }

  if (gcdArray.length === 0) {
    return 1;
  }

  let result = 1;
  for (let n = 0; n < gcdArray.length; n++) {
    result *= gcdArray[n];
  }
  return result;
}

// Команда /start

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const langKeyboard = {
    reply_markup: {
      keyboard: [['English', 'Русский', 'Українська']],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };

  // Приветствие перед выбором языка
  bot.sendMessage(chatId, "Welcome to the Math Functions Bot! 🤖\nPlease choose your language:", langKeyboard);
});


// Обработка выбора языка
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim().toLowerCase();

  // Выбор языка
  if (text === 'english') {
    userLanguage[chatId] = 'en';
    bot.sendMessage(chatId, messages.en.welcome);
    bot.sendMessage(chatId, messages.en.functionList);
    return;
  }
  if (text === 'русский') {
    userLanguage[chatId] = 'ru';
    bot.sendMessage(chatId, messages.ru.welcome);
    bot.sendMessage(chatId, messages.ru.functionList);
    return;
  }
  if (text === 'українська') {
    userLanguage[chatId] = 'uk';
    bot.sendMessage(chatId, messages.uk.welcome);
    bot.sendMessage(chatId, messages.uk.functionList);
    return;
  }

  const lang = userLanguage[chatId] || 'en';

  // Команды выбора функции
  if (text === '/gcd') {
    userState[chatId] = 'gcd';
    bot.sendMessage(chatId, messages[lang].gcdInstruction);
    return;
  }

  if (text === '/factorization') {
    userState[chatId] = 'factorization';
    bot.sendMessage(chatId, messages[lang].factorInstruction);
    return;
  }

  // Обработка ввода чисел
  const numbers = text.split(/[\s,]+/).map(n => parseInt(n)).filter(n => !isNaN(n) && n > 1);

  if (userState[chatId] === 'factorization' && numbers.length === 1) {
    const factors = primeFactors(numbers[0]);
    const res = messages[lang].result(numbers[0], factors.join(' × '));
    bot.sendMessage(chatId, res);
    userState[chatId] = null;
    return;
  }

  if (userState[chatId] === 'gcd' && numbers.length === 2) {
    const res = gcd(numbers[0], numbers[1]);
    const msgText = messages[lang].gcdResult(numbers[0], numbers[1], res);
    bot.sendMessage(chatId, msgText);
    userState[chatId] = null;
    return;
  }

  // Если введено что-то неверное
  if (userState[chatId] && !text.startsWith('/')) {
    bot.sendMessage(chatId, messages[lang].invalid);
  }
});
