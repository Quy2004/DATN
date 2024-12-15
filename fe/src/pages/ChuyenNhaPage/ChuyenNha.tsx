import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { CategoryPost } from "../../types/categoryPost";
import { useQuery } from "@tanstack/react-query";
import instance from "../../services/api";

const ChuyenNhaPage: React.FC = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Tất cả");

  const {
    data: categoryPost,
    isLoading: isLoadingCategory,
    isError: isErrorCategory,
    error: errorCategory,
  } = useQuery<{ data: CategoryPost[] }>({
    queryKey: ["categoryPost"],
    queryFn: async () => {
      const response = await instance.get("categoryPost");
      return response.data;
    },
  });

  const tabs = useMemo(() => {
    const baseTabs = [{ title: "Tất cả", id: "" }];
    if (Array.isArray(categoryPost?.data)) {
      return [
        ...baseTabs,
        ...categoryPost.data.map((category) => ({
          title: category.title,
          id: category._id,
        })),
      ];
    }
    return baseTabs;
  }, [categoryPost]);

  // Cập nhật activeTab khi URL thay đổi
  useEffect(() => {
    if (categoryId) {
      const currentTab = tabs.find((tab) => tab.id === categoryId);
      if (currentTab) {
        setActiveTab(currentTab.title);
      }
    } else {
      setActiveTab("Tất cả");
    }
  }, [categoryId, tabs]);

  const handleTabClick = (tab: { title: string; id: string }) => {
    setActiveTab(tab.title);
    if (tab.title === "Tất cả") {
      navigate("/chuyennha");
    } else {
      navigate(`/chuyennha/${tab.id}`);
    }
  };

  if (isLoadingCategory) return <div>Loading...</div>;
  if (isErrorCategory) {
    return <div>Error loading categories: {errorCategory.message}</div>;
  }

  return (
    <>
      <div className="container px-4 mx-auto mb-0 md:mb-12 mt-[60px] md:my-0">
        <div className="header_homes text-center ">
          <h1 className="pt-4 md:pt-16 text-xl md:text-2xl font-semibold mb-3 mt-6 md:mt-10">
            Chuyện Nhà
          </h1>
          <p className="border-b-orange-400 mx-auto w-8 border-b-[4px]"></p>
          <p className="text-xs md:text-base font-medium w-full md:w-[53%] mx-auto text-center mt-3 leading-loose">
            The Coffee House sẽ là nơi mọi người xích lại gần nhau, đề cao giá
            trị kết nối con người và sẻ chia thân tình bên những tách cà phê, ly
            trà đượm hương, truyền cảm hứng về lối sống hiện đại.
          </p>
        </div>
        <div className="tabs my-6 overflow-x-auto scrollbar-hide">
          <ul className="flex flex-nowrap w-max mx-auto text-lg  md:text-lg font-semibold gap-2 md:gap-4">
            {tabs.map((tab) => (
              <li
                key={tab.title}
                className={`${activeTab === tab.title
                  ? "bg-amber-100 text-orange-500"
                  : "border-2"
                  } rounded-3xl  py-1 md:py-1.5 hover:text-orange-500 cursor-pointer mb-2`}
                onClick={() => handleTabClick(tab)}
              >
                <span
                  className={`px-7 md:px-8 py-1 md:py-1.5 ${activeTab === tab.title ? "text-orange-500" : ""}`}
                >
                  {tab.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default ChuyenNhaPage;