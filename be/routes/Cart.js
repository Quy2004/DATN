import { addtoCart } from "../controllers/Cart";

const RouterCart = express.Router();
RouterCart.post('/cart',addtoCart)
export default RouterCart