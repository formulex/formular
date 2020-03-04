console.log('src');
const { a, ...rest } = { a: 1, b: 2 };

export default {
  ...rest,
  A: a,
  B: rest?.b
};
