module.exports = {
    coverageProvider: 'v8',
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '.d.ts', '.js'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: ['**/?(*.)+(spec|test).ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverage: true,
    collectCoverageFrom: [
        'src/controller/**/*.ts',
        'src/services/**/*.ts',
    ],
};
