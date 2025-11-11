import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import '../styles/purchase.css';
import { productAPI } from '../services/api';

const Purchase = () => {
    const [products, setProducts] = useState([]);
    const [buyQuantity, setBuyQuantity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await productAPI.getProducts();
                setProducts(data);
                setBuyQuantity(new Array(data.length).fill(''));
            } catch (err) {
                setError('Failed to load products');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convert empty strings to 0 for processing
        const processedQuantities = buyQuantity.map(qty => qty === '' ? 0 : parseInt(qty) || 0);
        navigate('/purchase/paymentEntry', {
            state: {
                buyQuantity: processedQuantities,
                products
            }
        });
    };

    const updateQuantity = (index, value) => {
        const newQuantity = [...buyQuantity];
        newQuantity[index] = value === '' ? '' : Math.max(0, parseInt(value) || 0);
        setBuyQuantity(newQuantity);
    };

    if (loading) {
        return (
            <div className="purchase">
                <div className="purchase-header">
                    <h1>Loading Products...</h1>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="purchase">
                <div className="purchase-header">
                    <h1>Error Loading Products</h1>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="purchase">
            <div className="purchase-header">
                <h1>Enter Product Quantities</h1>
            </div>
            <form onSubmit={handleSubmit}> 
                {products.map((product, index) => (
                    <div key={product.id} className="form-row">
                        <label>{product.name}</label>
                        <div className="product-meta">In stock: {product.availableQuantity ?? 0}</div>
                        <input
                            type="number"
                            min="0"
                            value={buyQuantity[index] || ''}
                            onChange={(e) => updateQuantity(index, e.target.value)}
                            placeholder="0"
                        />
                        <br/>
                    </div>
                ))}
                <button className='button' type="submit">Continue to Payment</button>
            </form>
        </div>
    );
};

export default Purchase;