import Newsletter from "../../components/shop/newsLetter";
import ProductCollection from "../../components/shop/productCollection";
import ShopImage from "../../components/shop/shopImage";

const Shop = ()=>{
    return(
        <>
        <h1 className="visually-hidden">Shop Elaichi Ghar Cardamom</h1>
        <ShopImage/>
        <ProductCollection/>
        <Newsletter/>
        </>
    )
}

export default Shop;
