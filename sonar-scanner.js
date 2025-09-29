const scanner = require('sonarqube-scanner');

scanner(
  {
    serverUrl: 'http://localhost:9000',
    token: process.env.SONAR_TOKEN || 'sqa_20d3fc168af577456247aa56373cce5b8c22ef44',
    options: {
      'sonar.projectKey': 'flowmatic-frontend',
      'sonar.projectName': 'Flowmatic Frontend',
      'sonar.sources': 'src',
      'sonar.exclusions': 'src/**/*.test.ts,src/**/*.test.tsx,src/**/*.spec.ts,src/**/*.spec.tsx,src/test/**,coverage/**,node_modules/**,.next/**,dist/**,build/**',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.typescript.tsconfigPath': 'tsconfig.json',
      'sonar.eslint.reportPaths': 'eslint-report.json',
      'sonar.sourceEncoding': 'UTF-8'
    }
  },
  () => process.exit()
);
