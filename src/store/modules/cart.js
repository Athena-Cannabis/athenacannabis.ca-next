// import { Product } from '../../models/product';
// import ProductService from '../../services/woocommerce/product';

import { CartItem } from "../../models/cartItem";

// TODO: Load cart to / from local storage

// initial state
const state = {
  cart: [],
  subtotalPrice: '',
  totalTax: '',
  totalPrice: '',
}

// getters
const getters = {

  // Get all cart items - no sorting applied
  getCartItems(state) {
    return state.cart;
  },

  // Get all cart items - no sorting applied
  getCartItemByProductId: (state, getters) => (productId) => {

    var cartItem = null;

    // Get product by matching the id
    cartItem = getters.getCartItems.find((element) => element.productId === productId);

    return cartItem ? cartItem : null;

  },

  // Get all cart items
  // Walk through the array of cart items and grab the quantity of each cart item
  getCartItemsCount(state) {

    // Set default value
    var itemsCount = 0;

    // Walk though the array of cart items and add up the quantities
    if (state.cart && state.cart.length >= 0) {
      state.cart.forEach(element => {
        itemsCount += element.quantity;
      });
    }

    return itemsCount;
  },

  // Get the cart item total
  // We take the current price of the product and
  // multiply it by the quantity in the cart
  getCartItemTotalByProductId: (state, getters, rootState, rootGetters) => (productId) => {

    console.log('product id', productId );

    var total = null;

    // Get the current price of the product
    var product = rootGetters['product/getProductByProductId'](productId);

    // Check if the product is valid
    if (product) {

      // Get the cart quantity
      var cartItem = getters.getCartItemByProductId(productId);

      // Check if cartItem is defined
      if (cartItem) {

        // Check if quanity is actually a number before we try to multiply it
        if (!isNaN(cartItem.quantity)) {
          total = product.price.currentFloat * cartItem.quantity;
        }

      }

    }

    return total;

  },

  // Get the Subtotal
  getCartPriceSubtotal(state) {
    return state.subtotalPrice;
  },

  // Get the Total Tax
  getCartPriceTotalTax(state) {
    return state.totalTax;
  },

  // Get the Total
  getCartPriceTotal(state) {
    return state.totalPrice;
  },

}

// actions
const actions = {

  // Initialise the cart in vuex by first checking to see if a cart id
  // is in the localstorage. If it is, try to fetch the cart. If both
  // don't succeed then create a new cart
  initialiseCart({ dispatch }) {


  },

  // Add a line item to the vuex cart
  // This will then trigger a mutation call to Shopify's
  // checkout api
  // Calling function should provide a variant ID and the quantity to add
  // in the form of a line item object
  addToCart({ state, commit, rootGetters }, payload) {

    // Check that payload.productId is a valid product ID from the product store
    var validProductId = rootGetters['product/getLoadedStatusOfProductId'](payload.productId);

    // Check that payload.quantity is a number
    var validProductQuantity = !isNaN(payload.quantity);

    console.log('Add to cart:' , validProductId, validProductQuantity);

    // Payload is valid
    if ( validProductId && validProductQuantity) {

      // Check that there is sufficient product stock for the item

      // Add the cart item (product and quantity) to the cart
      // Item not in the cart
      var cartItem = new CartItem({
        productId: payload.productId,
        quantity: payload.quantity,
      });

      commit('addItemToCart', cartItem);

    }
    else {
      // Throw error that the component can catch
      console.log('Could not add to cart')
    }

  },

  // Remove a line item from the vuex cart
  deleteFromCart({ state, commit }, id) {

    commit('deleteItemFromCart', id);

  },



}

// mutations
const mutations = {

  // Add a CartItem to the cart
  addItemToCart (state, cartItem ) {

    // Is the item in the cart already
    const record = state.cart.find(element => element.productId === cartItem.productId);

    if (!record) {
      // Add item to the cart
      state.cart.unshift(cartItem);
    } else {
      // Increment the quantity value
      record.quantity++;
    }

  },

  // Remove a CartItem from the cart
  deleteItemFromCart (state, productId) {

    // Find the cartItem object in the state using the productId
    var cartItemIndex = state.cart.findIndex((cartItem) => cartItem.productId === productId);

    // If the product ID is found remove it from the array
    if (cartItemIndex !== -1) {
      state.cart.splice(cartItemIndex, 1);
    }

  }


}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

