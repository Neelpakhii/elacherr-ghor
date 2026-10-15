import { useContext } from "react";
import BagContext from "../context/bagContext.js";

const useBag = () => {
    const context = useContext(BagContext);
    if (!context) throw new Error("useBag must be used inside BagProvider.");
    return context;
};

export default useBag;
