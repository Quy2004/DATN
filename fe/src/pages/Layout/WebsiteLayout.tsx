import React from "react";
import Header from "../../components/Header.";
import Footer from "../../components/Footer";
import { Outlet } from "react-router-dom";

const WebsiteLayout: React.FC = () => {
    return (
        <>
            <div className=" w-full flex flex-col min-h-screen">
                <header className="home">
                    <Header />
                </header>
                <main className="flex-1">
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