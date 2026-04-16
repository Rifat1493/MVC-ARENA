module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\.vue$': ['@vue/vue3-jest', { compilerOptions: { compatConfig: { MODE: 3 } } }],
    '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './babel.config.js' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: ['/node_modules/(?!(uuid)/)'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,vue}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/docs/**',
    '!**/coverage/**',
    '!**/router/**',
    '!**/*.config.*',
    '!**/main.js'],
  coverageReporters: ['html', 'text-summary', 'lcov']
}
