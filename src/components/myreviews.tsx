// UserReviews.tsx
import React, { useEffect, useState } from "react";
import { ratingService } from "../services/api";

interface Movie {
  title: string;
}

interface Review {
  ratingId: number;
  rating: number;
  review: string;
  movieTitle: Movie;
}

export default function UserReviews({ userId }: { userId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ratingService
      .fetchUserReviews(userId)
      .then((data) => {
        setReviews(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className="space-y-4">
      {reviews.map((rev) => (
        <div key={rev.ratingId} className="border p-4 rounded shadow">
          <h3 className="text-xl font-bold">{rev.movieTitle.title}</h3>
          <div className="text-yellow-500">
            {"★".repeat(rev.rating)}
            {"☆".repeat(5 - rev.rating)}
          </div>
          <p className="mt-2">{rev.review}</p>
        </div>
      ))}
    </div>
  );
}
