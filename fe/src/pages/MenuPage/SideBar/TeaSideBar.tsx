
const TeaSideBar: React.FC = () => {
    const products: any[] = [
        { id: 1, name: "Book 1", description: "Book 1 description" }
      ];
      
    return (
        <div className="product-list">
            <h1>TEA SIDEBAR</h1>
            {products.map((product) => (
                <div key={product.id}>
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>
                </div>
            ))}
        </div>
    )
};

export default TeaSideBar;