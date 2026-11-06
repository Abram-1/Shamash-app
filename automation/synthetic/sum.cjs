function syntheticSum(a, b) {
  if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b)) {
    throw new RangeError('Inputs must be safe integers');
  }
  const sum = a + b;
  if (!Number.isSafeInteger(sum)) {
    throw new RangeError('Sum must be a safe integer');
  }
  return sum;
}
module.exports={syntheticSum};
