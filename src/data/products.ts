import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'classic-vanilla-cupcake',
    name: 'Classic Vanilla Cupcake',
    category: 'Cupcakes',
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=800',
    alt: 'Classic vanilla cupcakes with pink frosting',
    price: 4.50,
    stockQuantity: 50,
    description: 'Our signature vanilla cupcake topped with our classic vanilla buttercream. A timeless favorite that melts in your mouth.',
    dietaryTags: ['Nut-Free']
  },
  {
    id: 'chocolate-buttercream-cupcake',
    name: 'Chocolate Buttercream Cupcake',
    category: 'Cupcakes',
    image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800',
    alt: 'Topseller cupcakes variety box',
    price: 4.75,
    stockQuantity: 30,
    description: 'Rich chocolate cake topped with our decadent chocolate buttercream frosting. Perfect for chocolate lovers.',
    dietaryTags: ['Nut-Free']
  },
  {
    id: 'double-fudge-brownie',
    name: 'Double Fudge Brownie',
    category: 'Brownies & Bars',
    image: 'https://images.unsplash.com/photo-1461008312963-30bb3fdb6b7c?auto=format&fit=crop&q=80&w=800',
    alt: 'Rich chocolate brownies stacked high',
    price: 5.00,
    stockQuantity: 25,
    description: 'A dense, fudgy brownie packed with chocolate chips. Guaranteed to satisfy your sweet tooth.',
    dietaryTags: ['Nut-Free']
  },
  {
    id: 'blondie-bar',
    name: 'Blondie Bar',
    category: 'Brownies & Bars',
    image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=800',
    alt: 'Decadent dark chocolate brownies and bars',
    price: 4.50,
    stockQuantity: 40,
    description: 'A chewy, buttery blonde brownie loaded with chocolate chips and walnuts.',
    dietaryTags: []
  },
  {
    id: 'confetti-birthday-cake',
    name: 'Confetti Birthday Cake',
    category: 'Cakes',
    image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&q=80&w=800',
    alt: 'Birthday cake with colorful sprinkles',
    price: 45.00,
    stockQuantity: 10,
    description: 'Our classic vanilla cake baked with colorful confetti sprinkles, topped with vanilla buttercream and more sprinkles.',
    dietaryTags: ['Nut-Free']
  },
  {
    id: 'classic-vanilla-cake',
    name: 'Classic Vanilla Cake',
    category: 'Cakes',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=800',
    alt: 'Large layer cake with elegant icing',
    price: 40.00,
    stockQuantity: 15,
    description: 'Three layers of buttery vanilla cake filled and frosted with our signature vanilla buttercream.',
    dietaryTags: ['Nut-Free']
  },
  {
    id: 'bakers-choice-sampler',
    name: 'Baker\'s Choice Sampler',
    category: 'Sampler Packs',
    image: 'https://images.unsplash.com/photo-1586788680434-30d324671ff6?auto=format&fit=crop&q=80&w=800',
    alt: 'Assorted dessert sampler pack box',
    price: 25.00,
    stockQuantity: 20,
    description: 'A curated selection of our most popular treats, including cupcakes, brownies, and cookies.',
    dietaryTags: []
  },
  {
    id: 'classic-banana-pudding',
    name: 'Classic Banana Pudding',
    category: 'Banana Pudding',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800',
    alt: 'Signature banana pudding in a cup',
    price: 6.50,
    stockQuantity: 100,
    description: 'Our world-famous banana pudding made with layers of vanilla wafers, fresh bananas, and creamy vanilla pudding.',
    dietaryTags: ['Nut-Free']
  }
];
