
const AllSideBar: React.FC = () => {
    const products: any[] = [
        { id: 1, name: "Book 1", description: "Book 1 description" },
        { id: 2, name: "Toy 1", description: "Toy 1 description" },
        { id: 3, name: "Toy 2", description: "Toy 2 description" },
        { id: 4, name: "Toy 3", description: "Toy 3  description" }, { id: 1, name: "Book 1", description: "Book 1 description" },
        { id: 2, name: "Toy 1", description: "Toy 1 description" },
        { id: 3, name: "Toy 2", description: "Toy 2 description" },
        { id: 4, name: "Toy 3", description: "Toy 3  description" }, { id: 1, name: "Book 1", description: "Book 1 description" },
        { id: 2, name: "Toy 1", description: "Toy 1 description" },
        { id: 3, name: "Toy 2", description: "Toy 2 description" },
        { id: 4, name: "Toy 3", description: "Toy 3  description" }, { id: 1, name: "Book 1", description: "Book 1 description" },
        { id: 2, name: "Toy 1", description: "Toy 1 description" },
        { id: 3, name: "Toy 2", description: "Toy 2 description" },
        { id: 4, name: "Toy 3", description: "Toy 3  description" }, { id: 1, name: "Book 1", description: "Book 1 description" },
        { id: 2, name: "Toy 1", description: "Toy 1 description" },
        { id: 3, name: "Toy 2", description: "Toy 2 description" },
        { id: 4, name: "Toy 3", description: "Toy 3  description" }, { id: 1, name: "Book 1", description: "Book 1 description" },
        { id: 2, name: "Toy 1", description: "Toy 1 description" },
        { id: 3, name: "Toy 2", description: "Toy 2 description" },
        { id: 4, name: "Toy 3", description: "Toy 3  description" }, { id: 1, name: "Book 1", description: "Book 1 description" },
        { id: 2, name: "Toy 1", description: "Toy 1 description" },
        { id: 3, name: "Toy 2", description: "Toy 2 description" },
        { id: 4, name: "Toy 3", description: "Toy 3  description" }, { id: 1, name: "Book 1", description: "Book 1 description" },
        { id: 2, name: "Toy 1", description: "Toy 1 description" },
        { id: 3, name: "Toy 2", description: "Toy 2 description" },
        { id: 4, name: "Toy 3", description: "Toy 3  description" }, { id: 1, name: "Book 1", description: "Book 1 description" },
        { id: 2, name: "Toy 1", description: "Toy 1 description" },
        { id: 3, name: "Toy 2", description: "Toy 2 description" },
        { id: 4, name: "Toy 3", description: "Toy 3  description" }, { id: 1, name: "Book 1", description: "Book 1 description" },
        { id: 2, name: "Toy 1", description: "Toy 1 description" },
        { id: 3, name: "Toy 2", description: "Toy 2 description" },
        { id: 4, name: "Toy 3", description: "Toy 3  description" }
      ];
      
    return (
        <div className="product-list">
            <h1>All SIDEBAR hhaha</h1>
            {products.map((product) => (
                <div key={product.id}>
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>
                </div>
            ))}
        </div>
    )
};

export default AllSideBar;