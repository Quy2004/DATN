import { useState } from "react";

// const HoverButton = ({ text, tooltipText, tooltipDate }: any) => {
export const TooltipArrowButton = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <p className="text-sky-500 flex items-center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 mx-1"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
            </svg>
            <a href="#" className="hover:underline">
                Giao hàng thành công
            </a>
            <div
                className="relative ml-1"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4 mt-1 text-black"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                    />
                </svg>
                {isHovered && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 p-2 bg-[#eee] rounded shadow-xl text-center w-40 text-black z-50">
                        <p>Cập Nhật Mới Nhất</p>
                        <p>17:06 09-09-2024</p>
                        {/* Móc tam giác */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8  border-transparent border-b-[#eee]"></div>
                    </div>
                )}
            </div>
        </p>
    );
};
export const TooltipArrow = () => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <p className="text-sky-500 flex items-center">
            <div
                className="relative ml-1"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4 mt-1 text-black"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                    />
                </svg>
                {isHovered && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 p-2 bg-[#eee] rounded shadow-xl text-center w-40 text-black z-50">
                        <p>Cập Nhật Mới Nhất</p>
                        <p>17:06 09-09-2024</p>
                        {/* Móc tam giác */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 -top-2 w-0 h-0 border-l-8 border-r-8 border-b-8  border-transparent border-b-[#eee]"></div>
                    </div>
                )}
            </div>
        </p>
    );
};


