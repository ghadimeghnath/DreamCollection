import { getProductById } from "@/features/admin/actions";
import ProductForm from "@/features/admin/components/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        return notFound();
    }

    return (
        <div className=" bg-gray-50/50 min-h-screen">
            <ProductForm initialData={product} isEditMode={true} />
        </div>
    );
}