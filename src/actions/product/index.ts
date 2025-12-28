// Export types
export type { CreateProductInput, UpdateProductInput } from "@/lib/db/schema";

// Export actions
export { getProducts, getProductById } from "./get-products";
export { createProductAction } from "./create-product/create";
export { updateProductAction } from "./update-product/update";
export { deleteProductAction } from "./delete-product/delete";

