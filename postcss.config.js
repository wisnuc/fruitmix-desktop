module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-cssnext': {
      features: {
        customProperties: {
          preserve: true
        }
      }
    },
  }
}

