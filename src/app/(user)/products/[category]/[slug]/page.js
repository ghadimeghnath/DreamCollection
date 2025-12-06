import { getProductBySlug } from "@/features/product/actions";
import ProductDetail from "@/features/product/components/ProductDetail";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Not Found" };

  return {
    title: `${product.seoTitle || product.name} | Dream Collection`,
    description: product.seoDescription || product.description,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }

  return (
        <ProductDetail product={product} />
  );
}