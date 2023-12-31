const Category = require('../models/category');
const Product = require('../models/product');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
var numeral = require('numeral');

async function countItems() {
  return {
    products: await Product.find().countDocuments({}),
    categories: await Category.find().countDocuments({}),
  };
}

exports.index = asyncHandler(async (req, res, next) => {
  // res.send('NOT IMPLEMENTED: Site Home Page');

  // async function countItems(db) {
  //   const count = await db.find().countDocuments({});
  //   return count;
  // }

  res.render('index', {
    count: await countItems(),
  });
});

// Display list of all books.
exports.product_list = asyncHandler(async (req, res, next) => {
  const allProducts = await Product.find({}, 'product_name price')
    .sort({ product_name: 1 })
    .exec();
  res.render('product_list', {
    title: 'Product List',
    product_list: allProducts,
    numeral: numeral,
    count: await countItems(),
  });
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
    numeral: numeral,
    count: await countItems(),
  });

  // res.send(`NOT IMPLEMENTED: Product detail: ${req.params.id}`);
});

// Display book create form on GET.
exports.product_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().exec();
  // console.log(allCategories);
  res.render('product_form', {
    title: 'Create Product',
    product: { category: { _id: '' } },
    categories: allCategories,
    count: await countItems(),
  });

  // res.send('NOT IMPLEMENTED: Product create GET');
});

// Handle book create on POST.
exports.product_create_post = [
  // (req, res, next) => {
  //   if (!(req.body.category instanceof Array)) {
  //     if (typeof req.body.category === 'undefined') req.body.category = [];
  //     else req.body.category = new Array(req.body.category);
  //   }
  //   next();
  // },

  body('product_name', 'Product name must not be empty.')
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body('description', 'Description must not be empty.')
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body('price', 'Price must not be empty and must be greater than 0.')
    .isNumeric()
    .escape(),
  body('stock_quantity', 'Quantity must not be empty and must be greater or equal to 0.')
    .notEmpty()
    .isInt({ min: 0, max: 2000 })
    .escape(),
  body('category').escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const product = new Product({
      product_name: req.body.product_name,
      description: req.body.description,
      price: req.body.price,
      stock_quantity: req.body.stock_quantity,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      const allCategories = await Category.find().exec();

      // Mark our selected genres as checked.
      for (const category of allCategories) {
        if (product.category.indexOf(category._id) > -1) {
          category.checked = 'true';
        }
      }
      console.log(errors);
      res.render('product_form', {
        title: 'Create Product',
        categories: allCategories,
        product: product,
        errors: errors.array(),
        count: await countItems(),
      });
    } else {
      // Data from form is valid. Save book.
      await product.save();
      res.redirect(product.url);
    }
  }),
];

// Display book delete form on GET.
exports.product_delete_get = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).exec();
  if (product === null) {
    res.redirect('/catalog/products');
  }
  res.render('product_delete', {
    title: 'Product Delete',
    product: product,
    count: await countItems(),
    numeral: numeral,
  });
  // res.send('NOT IMPLEMENTED: Product delete GET');
});

// Handle book delete on POST.
exports.product_delete_post = asyncHandler(async (req, res, next) => {
  await Product.findByIdAndRemove(req.body.productid);
  res.redirect('/catalog/products');
  // res.send('NOT IMPLEMENTED: Product delete POST');
});

// Display book update form on GET.
exports.product_update_get = asyncHandler(async (req, res, next) => {
  const [product, allCategories] = await Promise.all([
    Product.findById(req.params.id).populate('category').exec(),
    Category.find().exec(),
  ]);

  if (product === null) {
    const err = new Error('Product not found');
    err.status = 404;
    return next(err);
  }
  for (const category of allCategories) {
    if (category._id.toString() === product.category._id.toString()) {
      category.checked = 'true';
    }
  }
  // console.log(product.category._id.toString());
  // console.log(allCategories[0]._id.toString());
  res.render('product_form', {
    title: 'Update Product',
    product: product,
    categories: allCategories,
    count: await countItems(),
  });
  // res.send('NOT IMPLEMENTED: Product update GET');
});

// Handle book update on POST.
exports.product_update_post = [
  body('product_name', 'Product name must not be empty.')
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body('description', 'Description must not be empty.')
    .trim()
    .isLength({ min: 2 })
    .escape(),
  body('price', 'Price must not be empty and must be greater than 0.')
    .isNumeric()
    .escape(),
  body('stock_quantity', 'Quantity must not be empty and must be greater or equal to 0.')
    .notEmpty()
    .isInt({ min: 0, max: 2000 })
    .escape(),
  body('category').escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const product = new Product({
      product_name: req.body.product_name,
      description: req.body.description,
      price: req.body.price,
      stock_quantity: req.body.stock_quantity,
      category: req.body.category,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      const allCategories = await Category.find().exec();

      // Mark our selected genres as checked.
      for (const category of allCategories) {
        if (product.category.indexOf(category._id) > -1) {
          category.checked = 'true';
        }
      }
      console.log(errors);
      res.render('product_form', {
        title: 'Create Product',
        categories: allCategories,
        product: product,
        errors: errors.array(),
        count: await countItems(),
      });
    } else {
      // Data from form is valid. Save book.
      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, product, {});
      res.redirect(updatedProduct.url);
    }
  }),
];
