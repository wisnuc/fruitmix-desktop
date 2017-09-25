const firstword = /^[-.]/
const isPassword = /[a-zA-Z0-9]+|[!()\-.?[\]_`~@#"']+/g
const isUsername = /[a-zA-Z0-9]+|[!()\-.?[\]_`~@#"']+|[\u4E00-\u9FFF\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/g
export const validateUsername = (value) => {
  return true
  /* alphabet + number + !()\-._`~@# + CJK */
  if (value.search(firstword) > -1) return false
  return !value.replace(isUsername, '').length
}

export const validatePassword = (value) => {
  /* alphabet + number + !()\-._`~@# */
  if (value.search(firstword) > -1) return false
  return !value.replace(isPassword, '').length
}
