const { body, validationResult } = require('express-validator');
const Category = require('../models/category');
const Product = require('../models/product');
const asyncHandler = require('express-async-handler');

async function countItems() {
  return {
    products: await Product.find().countDocuments({}),
    categories: await Category.find().countDocuments({}),
  };
}

exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();

  async function countProducts(categoryId) {
    const count = await Product.find().countDocuments({
      category: categoryId,
    });
    return count;
  }
  const count = await Product.find().countDocuments({
    category: '64b9865eca84b4c6a0d29e04',
  });

  const categoriesCount = await Promise.all(
    allCategories.map((category) => countProducts(category._id))
  );

  const categoriesWithCount = [];
  for (let i = 0; i < allCategories.length; i++) {
    categoriesWithCount[i] = { ...allCategories[i], count: categoriesCount[i] };
  }
  //   console.log(categoriesWithCount);

  res.render('category_list', {
    title: 'Category List',
    category_list: categoriesWithCount,
    count: await countItems(),
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
    count: await countItems(),
  });
});

exports.category_create_get = async (req, res, next) => {
  res.render('category_form', { title: 'Create Category', count: await countItems() });
};

exports.category_create_post = [
  body('name', 'Category name must contain at least 2 characters.')
    .trim()
    .isLength({ min: 2 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const category = new Category({ name: req.body.name });
    if (!errors.isEmpty()) {
      //   console.log(errors);
      res.render('category_form', {
        title: 'Create Category',
        category: category,
        errors: errors.array(),
        count: await countItems(),
      });
      return;
    } else {
      const categoryExists = await Category.findOne({ name: req.body.name }).exec();
      if (categoryExists) {
        res.redirect(categoryExists.url);
      } else {
        await category.save();
        res.redirect(category.url);
      }
    }
  }),
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, allProductsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Product.find({ category: req.params.id }, 'product_name price').exec(),
  ]);

  if (category === null) {
    res.redirect('/catalog/categories');
  }
  res.render('category_delete', {
    title: 'Category Delete',
    category: category,
    category_products: allProductsByCategory,
    count: await countItems(),
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, allProductsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Product.find({ category: req.params.id }, 'product_name price').exec(),
  ]);

  if (allProductsByCategory.length > 0) {
    res.render('category_delete', {
      title: 'Category Delete',
      category: category,
      category_products: allProductsByCategory,
      count: await countItems(),
    });
    return;
  } else {
    await Category.findByIdAndRemove(req.body.categoryid);
    res.redirect('/catalog/categories');
  }
});

exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    const err = new Error('Category not found');
    err.status = 404;
    return next(err);
  }
  // console.log(product.category._id.toString());
  // console.log(allCategories[0]._id.toString());
  res.render('category_form', {
    title: 'Update Category',
    category: category,
    count: await countItems(),
  });
  // res.send('NOT IMPLEMENTED: Product update GET');
});

exports.category_update_post = [
  body('name', 'Category name must contain at least 2 characters.')
    .trim()
    .isLength({ min: 2 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const category = new Category({ name: req.body.name, _id: req.params.id });
    if (!errors.isEmpty()) {
      //   console.log(errors);
      res.render('category_form', {
        title: 'Update Category',
        category: category,
        errors: errors.array(),
        count: await countItems(),
      });
      return;
    } else {
      const categoryExists = await Category.findOne({ name: req.body.name }).exec();
      if (categoryExists) {
        res.redirect(categoryExists.url);
      } else {
        const updatedCategory = await Category.findByIdAndUpdate(
          req.params.id,
          category,
          {}
        );
        res.redirect(updatedCategory.url);
      }
    }
  }),
];
