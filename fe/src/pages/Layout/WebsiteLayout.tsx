import React from "react";
import Header from "../../components/Header.";
import Footer from "../../components/Footer";
import { Outlet } from "react-router-dom";

const WebsiteLayout: React.FC = () => {
    return (
        <>
            <div className=" w-full">
                <header className="home">
                    <Header />
                </header>
                <main>
                    <Outlet />
                </main>
                <footer>
                    <Footer />
                </footer>
            </div>
        </>
    )
};

export default WebsiteLayout;