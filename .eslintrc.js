module.exports = {
  "parser": '@typescript-eslint/parser',
  "plugins": ["@typescript-eslint", "react", "prettier"],
  "extends": [
      "airbnb",
      "prettier",
      "prettier/react",
      "prettier/@typescript-eslint",
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/typescript"
  ],
  "env": {
      "es6": true,
      "browser": true,
      "jest": true
  },
  "settings": {
      "react": {
          "version": "16.8.6"
      }
  },
  "rules": {
      "no-bitwise": "off",
      "no-param-reassign": "off",
      "guard-for-in": "off",
      "prettier/prettier": "error",
      "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx", ".ts", "tsx"] }],
      "react/jsx-props-no-spreading": "off",
      "react/static-property-placement": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/indent": ["error", 2],
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/indent": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "class-methods-use-this": "off",
      "import/prefer-default-export": "off"
  },
  "overrides": []
}