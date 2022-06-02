const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
  const { search } = req.query

  const products = await Product.find({ price: { $gt: 30 } })
    .sort('name')
    .select('name price')

  res.status(200).json({ products, nbHits: products.length })
}

const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query
  const queryObject = {}
  // This is to enable featured product filter
  if (featured) {
    queryObject.featured = featured === 'true' ? true : false
  }

  // This is to filter product by company
  if (company) {
    queryObject.company = company
  }

  // This is to enable name search with case insesitive
  if (name) {
    queryObject.name = { $regex: name, $options: 'i' }
  }

  // Setting up numeric filters for the API to enable users filter using numbers

  if (numericFilters) {
    const operatorMap = {
      '>': '$gt',
      '>=': '$gte',
      '=': '$eq',
      '<': '$lt',
      '<=': '$lte',
    }
    const regEx = /\b(<|>|>=|=|<|<=)\b/g
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    )
    const options = ['price', 'rating']
    filters = filters.split(',').forEach((item) => {
      const [field, operator, value] = item.split('-')
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) }
      }
    })
  }

  console.log(queryObject)

  // For sorting of products
  let result = Product.find(queryObject)
  // sort
  if (sort) {
    const sortList = sort.split(',').join('')
    result = result.sort(sortList)
    console.log(sort)
  } else {
    result.sort('createdAt')
  }

  // Select field
  if (fields) {
    const fieldsList = fields.split(',').join('')
    result = result.select(fieldsList)
  }

  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  result = result.skip(skip).limit(limit)

  const products = await result
  res.status(200).json({ products, nbHits: products.length })
}

module.exports = {
  getAllProducts,
  getAllProductsStatic,
}
