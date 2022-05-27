import { DBField, writeDB } from "../dbController"
import { Cart, Resolver } from "./types"

const setJSON = (data: Cart) => writeDB(DBField.CART, data)

const cartResolver: Resolver = {
  Query: {
    cart: ( parent, args, { db }) => {
      return db.cart
    },
  },
  //어떤 동작을 하는지 파악 (동작과 관련한 것을 가져와서 데이터 베이스에서 처리 )
  Mutation: {
    addCart: async ( parent, { id }, { db }) => {
      if (!id) throw Error('상품id가 없다!')
      const targetProduct = db.products.find(item => item.id == id)
      if(!targetProduct) { 
        throw new Error('상품이 없습니다') 
      }

      // 원래 객체였던 것을 배열로 조정
      const existCartIndex = db.cart.findIndex(item => item.id == id)
      if (existCartIndex > -1 ) {
        const newCartItem = {
          id,
          amount: db.cart[existCartIndex].amount + 1,
        }
        db.cart.splice(existCartIndex, 1, newCartItem)
        setJSON(db.cart)
        return newCartItem
      }
      const newItem = {
        id,
        amount: 1,
      }
      db.cart.push(newItem)
      setJSON(db.cart)
      return newItem
    },
    //데이터 업데이트
    updateCart: ( parent, { id, amount }, { db }) => {
      const existCartIndex = db.cart.findIndex(item => item.id == id)

      if(existCartIndex < 0) { 
        throw new Error ('없는 데이터입니다')
      }
      db.cart.splice(existCartIndex, 1)
      setJSON(db.cart)
      return id
    },

    deleteCart: ( parent, { id }, { db }) => {
      const existCartIndex = db.cart.findIndex(item => item.id == id)

      if(existCartIndex < 0) { 
        throw new Error ('없는 데이터입니다')
      }
      //지워버리고 덮어씌움
      db.cart.splice(existCartIndex, 1)
      setJSON(db.cart)
      return id
    },
    // 아이디에 해당하는 아이템을 지우기 위해서 그 대상을 지워야함
    executePay: ( parent, { ids }, { db }) => {
      const newCartData = db.cart.filter(cartItem => !ids.includes(cartItem.id))
      db.cart = newCartData
      setJSON(db.cart)
      return ids
    },
  },
  CartItem: {
    product: ( cartItem, args, { db }) => 
    db.products.find((product: any) => product.id === cartItem.id),
  },
}

export default cartResolver; 