module.exports = {
  extends: ["expo", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "warn",
    "no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "off",
  },
};
