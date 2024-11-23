import React, { useState } from "react";

const reviews = [
    {
        username: "HoaDepTrai",
        rating: 5,
        comment: "",
        date: "2024-11-08 07:19",
        option: "Hồng",
        isHelpful: false,
    },
    {
        username: "QuyDeHoa",
        rating: 5,
        comment: "",
        date: "2024-11-09 16:27",
        option: "Xanh",
        isHelpful: false,
    },
];

const CommentDetail: React.FC = () => {

    const [rating, setRating] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Rating: ${rating}\nFeedback: ${feedback}`);
    };
    const [filter, setFilter] = useState<number | null>(null);

    const handleFilter = (stars: number | null) => {
        setFilter(stars);
    };

    const filteredReviews = filter
        ? reviews.filter((review) => review.rating === filter)
        : reviews;

    return (
        <div className="bg-white rounded shadow-sm">
            <div className="border p-4">
                <h1 className="font-medium text-xl">Đánh giá sản phẩm</h1>
                {/* Star Rating */}
                <div className="stars flex justify-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <React.Fragment key={star}>
                            <input
                                id={`star-${star}`}
                                type="radio"
                                name="star"
                                value={star}
                                className="hidden peer"
                                onChange={() => setRating(star)}
                            />
                            <label
                                htmlFor={`star-${star}`}
                                className={`cursor-pointer text-3xl transition-transform duration-200 hover:scale-125 ${rating && rating >= star
                                    ? "text-yellow-400 shadow-yellow-400"
                                    : "text-gray-500"
                                    }`}
                            >
                                ★
                            </label>
                        </React.Fragment>
                    ))}
                </div>

                {/* Feedback Input */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Đánh giá của bạn tại đây..."
                        className="w-full p-2 border border-[#ccc] rounded resize-none focus:ring focus:ring-[#ea8025]"
                        rows={4}
                    ></textarea>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!rating}
                            className="flex justify-center items-center w-24 bg-[#ea8025] text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-500 "
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>

            {/* Tổng đánh giá */}
            <div className="border mt-2 p-4">
                <div className="flex items-center space-x-4 mb-6">
                    <div>
                        <p className="text-3xl font-bold text-red-500">5 trên 5</p>
                        <div className="flex text-red-500 text-xl">
                            {Array.from({ length: 5 }, (_, i) => (
                                <span key={i}>★</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap space-x-2">
                        <button
                            onClick={() => handleFilter(null)}
                            className={`px-3 py-1 border ${filter === null ? "bg-red-500 text-white" : "bg-white"
                                }`}
                        >
                            Tất Cả
                        </button>
                        {[5, 4, 3, 2, 1].map((stars) => (
                            <button
                                key={stars}
                                onClick={() => handleFilter(stars)}
                                className={`px-3 py-1 border ${filter === stars ? "bg-red-500 text-white" : "bg-white"
                                    }`}
                            >
                                {stars} Sao ({reviews.filter((r) => r.rating === stars).length})
                            </button>
                        ))}
                        <button className="px-3 py-1 border bg-white">Có Bình Luận (0)</button>
                        <button className="px-3 py-1 border bg-white">
                            Có Hình Ảnh / Video (0)
                        </button>
                    </div>
                </div>

                {/* Danh sách đánh giá */}
                <div className="space-y-6">
                    {filteredReviews.map((review, index) => (
                        <div key={index} className="flex space-x-4 items-start border-b pb-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                            <div className="flex-1">
                                <p className="font-bold">{review.username}</p>
                                <div className="flex text-[#ea8025] text-sm">
                                    {Array.from({ length: review.rating }, (_, i) => (
                                        <span key={i}>★</span>
                                    ))}
                                </div>
                                <p className="text-gray-500 text-sm">{review.date} | Phân loại hàng: {review.option}</p>
                                <p className="mt-2 text-sm">{review.comment}</p>
                                <button className="text-gray-500 text-sm mt-2 flex items-center">
                                    👍 Hữu ích?
                                </button>
                            </div>
                        </div>
                    ))}
                </div>


                {/* Phân trang */}
                <div className="flex justify-center mt-6">
                    <button className="px-3 py-1 border">❮</button>
                    <button className="px-3 py-1 border bg-red-500 text-white">1</button>
                    <button className="px-3 py-1 border">❯</button>
                </div>
            </div>
        </div>

    );
};


export default CommentDetail;
