import { Link, Outlet } from "react-router-dom"
import "./ChuyenNha.css"
import { useState } from "react";

const ChuyenNhaPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Tất cả');

    const tabs = [
        { name: 'Tất cả', link: '' },
        { name: 'Coffeeholic', link: 'coffeeholic' },
        { name: 'Teaholic', link: 'teaholic' },
        { name: 'Blog', link: 'blog' }
    ];
    return (
        <>
            <div className="mb-12">
                <div className="header_homes w-max mx-auto"  >
                    <h1 className="pt-16 text-2xl font-semibold  mb-3 mt-10 text-center ">Chuyện Nhà</h1>
                    <p className="border-b-orange-400 mx-auto w-8 border-b-[4px]"></p>
                    <p className="text-sm w-[53%] mx-auto text-center mt-3 leading-loose"> The Coffee House sẽ là nơi mọi người xích lại gần nhau,
                        đề cao giá trị kết nối con người và sẻ chia thân tình bên những tách cà phê,
                        ly trà đượm hương,
                        truyền cảm hứng về lối sống hiện đại.</p>
                </div>
                <div className="tabs *:border-box my-6 ">
                    <ul className="flex justify-center *:text-lg *:font-semibold gap-5">
                        {tabs.map(tab => (
                            <li
                                key={tab.name}
                                className={`${activeTab === tab.name ? 'bg-amber-100 text-orange-500' : 'border-2'} rounded-3xl py-1.5 *:hover:text-orange-500`}
                                onClick={() => setActiveTab(tab.name)}
                            >
                                <Link to={tab.link} className={`px-8 py-[10px] ${activeTab === tab.name ? 'text-orange-500' : ''}`}>
                                    {tab.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div>
                {/* <AllHomes /> */}
                <Outlet />
            </div>
        </>
    )
}

export default ChuyenNhaPage