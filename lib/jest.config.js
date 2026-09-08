module.exports = {
  preset: 'ts-jest/presets/default-esm',
  // proto/index.js cannot be transformed by ts-jest, so we introduce babel-jest.
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
    '^.+\\.js$': 'babel-jest',
  },
};
