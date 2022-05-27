import { ForwardedRef, forwardRef, SyntheticEvent } from "react";
import { useMutation } from "react-query";
import { CartType, DELETE_CART, UPDATE_CART } from "../../graphql/cart";
import { getClient, graphqlFetcher, QueryKeys } from "../../queryClient";
import ItemData from "./itemData";
// 카트 수량 조절 (쿼리 클라이언트로 수량 조절) 초기에는 mutation / query 값이 불러오지만 수량 값만 변경시에는 mutation만 불러옴

const CartItem = (
  { id, product: { imageUrl, price, title }, amount }: CartType, 
  ref: ForwardedRef<HTMLInputElement>) => {
  const queryClient = getClient();
  const { mutate: updateCart } = useMutation(
    ({ id, amount }: { id: string; amount: number }) => graphqlFetcher(UPDATE_CART, { id, amount }),
    {
      onMutate: async ({ id, amount }) => {
        await queryClient.cancelQueries(QueryKeys.CART)
        const { cart: prevCart } = queryClient.getQueryData< {cart:CartType[]} >(
          QueryKeys.CART,
          ) || { cart: [] }
        if (!prevCart) return null

        const targetIndex = prevCart.findIndex(cartItem => cartItem.id === id)
        if (targetIndex == undefined || targetIndex < 0) return prevCart
      
        const newCart = [...prevCart]
        newCart.splice(targetIndex, 1, { ...newCart[targetIndex], amount })  
        queryClient.setQueriesData(QueryKeys.CART, { cart: newCart })
        return prevCart
    },
    onSuccess: ({ updateCart }) => { 
      // Item 하나에 대한 데이터  
      const { cart: prevCart } = queryClient.getQueryData<{cart:CartType[]}>(QueryKeys.CART) || { cart: [] }
      const targetIndex = prevCart?.findIndex(cartItem => cartItem.id === updateCart.id)
      if (!prevCart || targetIndex === undefined || targetIndex < 0) return

      const newCart = [...prevCart]
      newCart.splice(targetIndex, 1, updateCart) 
      queryClient.setQueriesData(QueryKeys.CART, { cart: newCart }) //Cart 전체에 대한 데이터 
      },
    },
  )
  // cart data를 get하는 뷰가 10개다 => 1개 업데이트로 전부 반영됨. (이거에 비해서 리덕스는 복잡함)

  const { mutate: deleteCart } = useMutation(({ id }: { id: string }) => 
    graphqlFetcher(DELETE_CART, { id }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QueryKeys.CART)
      }
    }
  )
// 수량 변경 기능 (1이하는 안되게)
  const handleUpdateAmount = (e: SyntheticEvent) => {
    const amount = Number((e.target as HTMLInputElement).value)
    if (amount < 1) return
    updateCart({ id, amount })
  }
// 삭제 기능
  const handleDeleteItem = () => {
    deleteCart({ id })
  }

  return (
    <li className="cart-item">
      <input className="cart-item__checkbox" type="checkbox" name="select-item" ref={ref} data-id={id}/>
      <ItemData imageUrl={imageUrl} price={price} title={title} />
      <input 
        className="cart-item__amount" 
        type="number" 
        value={amount}
        min={1}
        onChange={handleUpdateAmount}
      />
      <button  className="cart-item__button" type="button" onClick={handleDeleteItem}>삭제</button>
    </li>
  )
}

export default forwardRef(CartItem);