module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended'
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    'react',
    'react-hooks',
    'react-refresh'
  ],
  rules: {
    // React specific rules
    'react/jsx-no-target-blank': 'off',
    'react/prop-types': 'warn', // Warn for missing prop types
    'react/display-name': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react/jsx-key': 'error',
    'react/no-array-index-key': 'warn',
    'react/jsx-no-useless-fragment': 'warn',
    
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // React Refresh
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    
    // JavaScript best practices
    'no-unused-vars': ['warn', { 
      varsIgnorePattern: '^_',
      argsIgnorePattern: '^_' 
    }],
    'no-console': ['warn', { 
      allow: ['warn', 'error'] 
    }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'warn',
    'prefer-arrow-callback': 'warn',
    'prefer-template': 'warn',
    'template-curly-spacing': 'error',
    'arrow-spacing': 'error',
    'comma-dangle': ['warn', 'never'],
    'quotes': ['warn', 'single', { 
      avoidEscape: true,
      allowTemplateLiterals: true 
    }],
    'semi': ['error', 'never'],
    'indent': ['warn', 2, { SwitchCase: 1 }],
    'object-curly-spacing': ['warn', 'always'],
    'array-bracket-spacing': ['warn', 'never'],
    'key-spacing': 'warn',
    'comma-spacing': 'warn',
    'no-trailing-spaces': 'warn',
    'eol-last': 'warn',
    
    // Performance and quality
    'no-debugger': 'warn',
    'no-alert': 'warn',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-script-url': 'error',
    'consistent-return': 'warn',
    'default-case': 'warn',
    'dot-notation': 'warn',
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'no-empty-function': 'warn',
    'no-magic-numbers': ['warn', { 
      ignore: [-1, 0, 1, 2, 100],
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true 
    }],
    'no-multi-spaces': 'warn',
    'no-useless-return': 'warn',
    'radix': 'error',
    'yoda': 'warn',
    
    // Accessibility
    'jsx-a11y/alt-text': 'off', // Would need jsx-a11y plugin
    
    // Import organization
    'sort-imports': ['warn', {
      ignoreCase: true,
      ignoreDeclarationSort: true
    }]
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '*.min.js',
    'public/**/*'
  ]
}