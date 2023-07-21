const Category = require('../models/category');
const Product = require('../models/product');

const asyncHandler = require('express-async-handler');

exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();
  res.render('category_list', {
    title: 'Category List',
    category_list: allCategories,
  });
  // res.send('NOT IMPLEMENTED: Genre list');
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  // Get details of genre and all associated books (in parallel)
  const [category, productsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Product.find({ category: req.params.id }, 'product_name price').exec(),
  ]);
  if (category === null) {
    // No results.
    const err = new Error('Category not found');
    err.status = 404;
    return next(err);
  }
  //   console.log(productsInCategory);
  res.render('category_detail', {
    title: 'Category Detail',
    category: category,
    category_products: productsInCategory,
  });
});
