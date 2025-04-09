import { useParams } from "react-router-dom";
import UserReviews from "../components/myreviews";

export default function UserReviewsWrapper() {
  const { userId } = useParams<{ userId: string }>();

  return <UserReviews userId={parseInt(userId!)} />;
}
