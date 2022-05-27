import fs from 'fs';
import { resolve } from 'path';

export enum DBField {
  CART = 'cart',
  PRODUCTS = 'products'
}

const basePath = resolve()

//파일 정의
const filenames = {
  [DBField.CART]: resolve(basePath,'src/db/cart.json'),
  [DBField.PRODUCTS]: resolve(basePath, 'src/db/products.json')
}
//JSON파일을 파싱해서 객체 일반 자바스크립트를 객체로 바꿔줌
export const readDB = (target: DBField) => {
  try {
    return JSON.parse(fs.readFileSync(filenames[target], 'utf-8'))
  } catch(err) {
    console.error(err)
  }
}
// DB를 다시 씀 
export const writeDB = (target: DBField, data: any) => {
  try {
    fs.writeFileSync(filenames[target], JSON.stringify(data, null, ' '))
  } catch (err) {
    console.error(err)
  }
}