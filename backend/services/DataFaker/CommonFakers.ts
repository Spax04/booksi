export function generateRandomInteger(digitsLength: number = 1): number {
  if (digitsLength < 1) return 0;
  let integerString = '';
  for (let i = 0; i < digitsLength; i++) {
    const randomNumber = Math.floor(Math.random() * 9) + 1;
    integerString += randomNumber;
  }
  return parseInt(integerString);
}

export function generateRandomDecimal(integerLength: number = 1, fractionLength: number = 2): number {
  if (integerLength < 1 || fractionLength < 1) return 0;
  let decimalString = '';
  let left = '', right = '';
  for (let i = 0; i < integerLength; i++) {
    const randomNumber = Math.floor(Math.random() * 9) + 1;
    left += randomNumber;
  }
  for (let i = 0; i < integerLength; i++) {
    const randomNumber = Math.floor(Math.random() * 9) + 1;
    right += randomNumber;
  }
  decimalString = left + '.' + right;
  return parseFloat(decimalString);
}

export function randomValueFromArray(values: any[]): any {
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
};
