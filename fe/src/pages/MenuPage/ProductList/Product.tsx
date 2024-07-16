
const ProductList: React.FC = () => {
    const products: any[] = [
        { id: 1, name: "Book 1", description: "Book 1 description" },
        { id: 2, name: "Toy 1", description: "Toy 1 description" },
      ];
      
    return (
        <div className="product-list">
            {products.map((product) => (
                <div key={product.id}>
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>
                </div>
            ))}
        </div>
    )
};

export default ProductList;