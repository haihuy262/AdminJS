import { model, Schema } from 'mongoose';

export interface IProduct {
  name: string;
  price: string;
  brand: string;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: String, required: true },
  brand: { type: String, required: true },
});

const Product = model<IProduct>('Product', ProductSchema);

export default Product;
