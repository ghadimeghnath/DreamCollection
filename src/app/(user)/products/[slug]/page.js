import { getProductBySlug } from "@/features/product/actions";
import ProductDetail from "@/features/product/components/ProductDetail";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }) {
  const { slug } = await params;
  console.log(slug);
  
  const product = await getProductBySlug(slug);

//   if (!product) {
//     return notFound();
//   }

  return (
    <div className="flex justify-center items-center py-5">
        <ProductDetail product={product} />
    </div>
  );
}