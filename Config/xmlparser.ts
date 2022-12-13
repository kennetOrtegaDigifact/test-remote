export const options = { // fetch options
  ignoreDeclaration: true,
  ignorePiTags: true,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  numberParseOptions: {
    leadingZeros: false,
    hex: true,
    skipLike: /\+[0-9]{10}/
  }
}

export const optionsWithAttr = { // convert options with attributes
  ignoreAttributes: false,
  ignoreDeclaration: true,
  ignorePiTags: true,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  allowBooleanAttributes: true,
  numberParseOptions: {
    leadingZeros: false,
    hex: true,
    skipLike: /\+[0-9]{10}/
  }
}
