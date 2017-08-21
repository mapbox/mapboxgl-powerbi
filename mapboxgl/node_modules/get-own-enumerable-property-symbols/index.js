module.exports = object => {
  return Object.getOwnPropertySymbols(object)
    .filter(keySymbol => object.propertyIsEnumerable(keySymbol))
}
