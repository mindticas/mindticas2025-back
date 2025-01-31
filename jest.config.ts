export default {
    roots: ['<rootDir>/src'],
    testMatch: ['<rootDir>/tests/**/*.spec.ts'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
};
  