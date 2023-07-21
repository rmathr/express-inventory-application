const Product = require('../models/product');
const asyncHandler = require('express-async-handler');

exports.index = asyncHandler(async (req, res, next) => {
  // res.send('NOT IMPLEMENTED: Site Home Page');
  res.render('index');
});

// Display list of all books.
exports.product_list = asyncHandler(async (req, res, next) => {
  const allProducts = await Product.find({}, 'product_name price')
    .sort({ product_name: 1 })
    .exec();
  res.render('product_list', { title: 'Product List', product_list: allProducts });
  // res.send('NOT IMPLEMENTED: Product list');
});

// Display detail page for a specific book.
exports.product_detail = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('category').exec();
  if (product === null) {
    const err = new Error('Product not found');
    err.status = 404;
    return next(err);
  }
  res.render('product_detail', {
    title: 'Product Detail',
    product: product,
  });

  // res.send(`NOT IMPLEMENTED: Product detail: ${req.params.id}`);
});

// Display book create form on GET.
exports.product_create_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Product create GET');
});

// Handle book create on POST.
exports.product_create_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Product create POST');
});

// Display book delete form on GET.
exports.product_delete_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Product delete GET');
});

// Handle book delete on POST.
exports.product_delete_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Product delete POST');
});

// Display book update form on GET.
exports.product_update_get = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Product update GET');
});

// Handle book update on POST.
exports.product_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: Product update POST');
});
