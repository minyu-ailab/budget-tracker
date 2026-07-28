export const validateTransaction = (transaction) => {
  const errors = {}

  if (!transaction.name || transaction.name.trim() === '') {
    errors.name = 'Transaction name is required'
  }

  if (transaction.amount === '' || transaction.amount === null) {
    errors.amount = 'Amount is required'
  } else if (transaction.amount <= 0) {
    errors.amount = 'Amount must be greater than 0'
  }

  if (!transaction.type) {
    errors.type = 'Transaction type is required'
  }

  if (!transaction.category) {
    errors.category = 'Category is required'
  }

  if (!transaction.date) {
    errors.date = 'Date is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateCategory = (category) => {
  const errors = {}

  if (!category.name || category.name.trim() === '') {
    errors.name = 'Category name is required'
  }

  if (!category.color) {
    errors.color = 'Color is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateBudgetLimit = (limit) => {
  if (limit === '' || limit === null) {
    return { isValid: true, errors: {} } // Optional field
  }

  if (limit <= 0) {
    return {
      isValid: false,
      errors: { limit: 'Budget limit must be greater than 0' },
    }
  }

  return { isValid: true, errors: {} }
}
