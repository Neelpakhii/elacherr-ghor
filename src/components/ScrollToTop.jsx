import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import scrollToTop from "../utils/scrollToTop.js";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        scrollToTop();
    }, [pathname]);

    return null;
};

export default ScrollToTop;
