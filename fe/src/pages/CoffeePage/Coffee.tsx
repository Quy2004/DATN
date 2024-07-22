import { Link } from "react-router-dom"

const CoffeePage = () => {
    return (
        <div className='containerAll mx-auto'>
            <div className="mb-12">
                <h1 className="pt-16 text-2xl font-semibold  mb-3 mt-10 ">Cà Phê</h1>
                <p className="border-b-orange-400 mx-auto w-12 border-b-[4px]"></p>
            </div>
            <div className="row grid grid-cols-4 gap-5 gap-y-10 text-left mb-12">
                <div className="item ">
                    <div className="product_img">
                        <img src="/src/assets/images/CF_sua_da.webp" alt="" />
                    </div>
                    <Link to="#">
                        <h3>Cà Phê Sữa Đá</h3>
                    </Link>
                    <p>200$ </p>
                </div>
                <div className="item ">
                    <div className="product_img">
                        <img src="/src/assets/images/CF_sua_da.webp" alt="" />
                    </div>
                    <Link to="#">
                        <h3>Cà Phê Sữa Đá</h3>
                    </Link>
                    <p>200$ </p>
                </div>
                <div className="item ">
                    <div className="product_img">
                        <img src="/src/assets/images/CF_sua_da.webp" alt="" />
                    </div>
                    <Link to="#">
                        <h3>Cà Phê Sữa Đá</h3>
                    </Link>
                    <p>200$ </p>
                </div>
                <div className="item ">
                    <div className="product_img">
                        <img src="/src/assets/images/CF_sua_da.webp" alt="" />
                    </div>
                    <Link to="#">
                        <h3>Cà Phê Sữa Đá</h3>
                    </Link>
                    <p>200$ </p>
                </div>
            </div>
        </div>
    )
}
export default CoffeePage