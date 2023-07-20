#! /usr/bin/env node

console.log(
  'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Product = require('./models/product');
const Category = require('./models/category');

const categories = [];
const products = [];

const mongoose = require('mongoose');
mongoose.set('strictQuery', false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log('Debug: About to connect');
  await mongoose.connect(mongoDB);
  console.log('Debug: Should be connected?');
  await createCategories();
  await createProducts();
  console.log('Debug: Closing mongoose');
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function categoryCreate(index, name) {
  const category = new Category({ name: name });
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function productCreate(
  index,
  product_name,
  description,
  price,
  stock_quantity,
  category
) {
  const productDetail = {
    product_name: product_name,
    description: description,
    price: price,
    stock_quantity: stock_quantity,
  };
  if (category != false) productDetail.category = category;

  const product = new Product(productDetail);
  await product.save();
  products[index] = product;
  console.log(`Added product: ${product_name}`);
}

async function createCategories() {
  console.log('Adding Categories');
  await Promise.all([
    categoryCreate(0, 'Food & Treats'),
    categoryCreate(1, 'Toys'),
    categoryCreate(2, 'Clothing'),
    categoryCreate(3, 'Beds & Furniture'),
  ]);
}

//   productCreate(index, product_name, description, price, stock_quantity, category)

async function createProducts() {
  console.log('Adding Products');
  await Promise.all([
    productCreate(
      0,
      'Purina ONE Plus',
      'Delight your dog with the wholesome goodness of Purina ONE +Plus Natural Large Breed Formula with Added Vitamins, Minerals, and Nutrients.',
      56.99,
      114,
      [categories[0]]
    ),
    productCreate(
      1,
      'Puppy Scoop Ice Cream',
      "We're Bananas for this flavor! It is a sweet, smooth, decadent and delicious treat your furry friend will find super a-peeling!",
      9.99,
      57,
      [categories[0]]
    ),
    productCreate(
      2,
      'Bark Super Chewer Pivot Dog Toy',
      "We've delivered 100 MILLION TOYS to dogs like yours, and this is our ultimate wobble toy. With its 100% natural rubber wheel design, Pivot is prepared to do just that on a dime, or better yet, a treat.",
      21.99,
      84,
      [categories[1]]
    ),
    productCreate(
      3,
      'Joyhound Crazy Comfy Squirrel Dog Toy',
      'Our Joyhound Fly Knit Squirrel Dog Toy is a plush toy that provides companionship and comfort for small, medium, and large dogs. The super cute toy design is stuffed with an internal squeaker to provide hours of interactivity to comfort and entertain.',
      5.97,
      27,
      [categories[1]]
    ),
    productCreate(
      4,
      'Pink Dog Hoodie',
      'This Pink Dog Hoodie offers a great look that you will love on your pup.',
      12.47,
      11,
      [categories[2]]
    ),
    productCreate(
      5,
      'High Visibility Life Jacket',
      'Water safety is paramount for your dog, and the High Visibility Life Jacket makes certain that your dog can experience the water on your outdoor adventures safely.',
      42.49,
      34,
      [categories[2]]
    ),
    productCreate(
      6,
      'Paw Print Cuddler Dog Bed',
      'Provide your dog with a place to find optimal comfort in this Paw Print Value Cuddler Dog Bed.',
      14.99,
      21,
      [categories[3]]
    ),
    productCreate(
      7,
      'Faux Fur Donut Pet Bed',
      "Your pet won't be able to resist a deep rest in the new Donut Bed.",
      44.99,
      18,
      [categories[3]]
    ),
  ]);
}
