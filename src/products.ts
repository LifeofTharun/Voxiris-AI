/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "./types";

/**
 * Feature vector indices representing style attributes:
 * 0: Category index (0.1 = Outerwear, 0.5 = Shirt, 0.9 = Pant/Trouser)
 * 1: Tone/Color Hue (0.2 = Bright/Red, 0.5 = BlueHue, 0.8 = Warm/Green/Earth tones)
 * 2: Formality level (0.1 = Relaxed/Streetwear, 0.5 = Casual, 0.9 = Formal)
 * 3: Texture/Fabric weight (0.2 = Light/Linen, 0.5 = Cotton, 0.8 = Thick/Jeans/Wool)
 * 4: Price tier indicator (0.2 = Budget, 0.5 = Moderate, 0.8 = Premium)
 */
export const PRODUCT_DATABASE: Product[] = [
  {
    id: "prod_1",
    name: "Emerald Green Linen Casual Shirt",
    category: "Shirt",
    color: "Green",
    style: "Casual",
    fabric: "Linen",
    price: 1450,
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80",
    tags: ["Green", "Casual", "Linen", "Shirt", "Lightweight"],
    embeddings: [0.5, 0.8, 0.5, 0.2, 0.3]
  },
  {
    id: "prod_2",
    name: "Deep Olive Corduroy Trousers",
    category: "Trousers",
    color: "Green",
    style: "Casual",
    fabric: "Corduroy",
    price: 1899,
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&auto=format&fit=crop&q=80",
    tags: ["Green", "Olive", "Trousers", "Pants", "Corduroy", "Warm"],
    embeddings: [0.9, 0.85, 0.4, 0.7, 0.4]
  },
  {
    id: "prod_3",
    name: "Tan Leather Oxford Dress Shoes",
    category: "Shoes",
    color: "Tan",
    style: "Formal",
    fabric: "Leather",
    price: 2490,
    imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&auto=format&fit=crop&q=80",
    tags: ["Shoes", "Tan", "Brown", "Formal", "Leather", "Elegant"],
    embeddings: [0.3, 0.7, 0.9, 0.8, 0.6]
  },
  {
    id: "prod_4",
    name: "Charcoal Grey Slim Fit Chinos",
    category: "Trousers",
    color: "Grey",
    style: "Smart Casual",
    fabric: "Cotton",
    price: 1599,
    imageUrl: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=400&auto=format&fit=crop&q=80",
    tags: ["Grey", "Trousers", "Pants", "Casual", "Cotton", "Slim-fit"],
    embeddings: [0.9, 0.3, 0.6, 0.5, 0.4]
  },
  {
    id: "prod_5",
    name: "Crimson Red Graphic Street Hoodie",
    category: "Hoodie",
    color: "Red",
    style: "Streetwear",
    fabric: "Fleece",
    price: 1250,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&auto=format&fit=crop&q=80",
    tags: ["Red", "Hoodie", "Sweatshirt", "Streetwear", "Warm"],
    embeddings: [0.1, 0.2, 0.1, 0.6, 0.3]
  },
  {
    id: "prod_6",
    name: "Midnight Black Denim Jacket",
    category: "Jacket",
    color: "Black",
    style: "Casual",
    fabric: "Denim",
    price: 1999,
    imageUrl: "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=400&auto=format&fit=crop&q=80",
    tags: ["Black", "Outerwear", "Jacket", "Denim", "Casual", "Rugged"],
    embeddings: [0.15, 0.1, 0.4, 0.8, 0.5]
  },
  {
    id: "prod_7",
    name: "Sky Blue Restrained Linen Trousers",
    category: "Trousers",
    color: "Blue",
    style: "Casual",
    fabric: "Linen",
    price: 1699,
    imageUrl: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400&auto=format&fit=crop&q=80",
    tags: ["Blue", "Lightweight", "Trousers", "Linen", "Summer", "Casual"],
    embeddings: [0.9, 0.5, 0.4, 0.2, 0.4]
  },
  {
    id: "prod_8",
    name: "Slate Grey Cozy Sweatshirt",
    category: "Sweatshirt",
    color: "Grey",
    style: "Casual",
    fabric: "Cotton",
    price: 999,
    imageUrl: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=400&auto=format&fit=crop&q=80",
    tags: ["Grey", "Sweatshirt", "Casual", "Cotton", "Budget"],
    embeddings: [0.1, 0.3, 0.2, 0.5, 0.2]
  },
  {
    id: "prod_9",
    name: "Sand Beige Tailored Wool Blazer",
    category: "Blazer",
    color: "Beige",
    style: "Formal",
    fabric: "Wool",
    price: 3999,
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80",
    tags: ["Beige", "Formal", "Blazer", "Wool", "Premium", "Intellectual"],
    embeddings: [0.2, 0.75, 0.85, 0.7, 0.8]
  },
  {
    id: "prod_10",
    name: "Off-White Knitted Cable Sweater",
    category: "Sweater",
    color: "Off-White",
    style: "Cozy",
    fabric: "Wool",
    price: 1799,
    imageUrl: "https://assets.unsplash.com/photo-1621072156002-e2fcc103e86e?w=400&auto=format&fit=crop&q=80",
    tags: ["Off-White", "Cream", "Sweater", "Textured", "Cozy", "Wool"],
    embeddings: [0.1, 0.7, 0.3, 0.75, 0.4]
  }
];
