export const options = { // fetch options
  ignoreDeclaration: true,
  ignorePiTags: true,
  attributeNamePrefix: '@_',
  removeNSPrefix: true
}

export const optionsWithAttr = { // convert options with attributes
  ignoreAttributes: false,
  ignoreDeclaration: true,
  ignorePiTags: true,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  allowBooleanAttributes: true
}
