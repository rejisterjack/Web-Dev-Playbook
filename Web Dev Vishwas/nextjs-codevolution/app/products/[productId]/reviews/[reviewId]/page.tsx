import { notFound } from "next/navigation";
import type { Metadata } from "next";

type ReviewDetailsProps = {
  params: { productId: string; reviewId: string };
};

export async function generateMetadata({
  params,
}: ReviewDetailsProps): Promise<Metadata> {
  const { productId, reviewId } = params;

  if (+productId > 1000) {
    return {
      title: "Not Found",
      description: "This product does not exist",
    };
  }

  return {
    title: `Review ${reviewId} for Product ${productId}`,
    description: `Detailed review ${reviewId} about product ${productId}.`,
    openGraph: {
      title: `Review ${reviewId} for Product ${productId}`,
      description: `Read review ${reviewId} about product ${productId}.`,
    },
  };
}

const ReviewDetails = ({ params }: ReviewDetailsProps) => {
  const { productId, reviewId } = params;

  if (+productId > 1000) return notFound();

  return (
    <div>
      ReviewDetails {reviewId} for Product {productId}
    </div>
  );
};

export default ReviewDetails;
