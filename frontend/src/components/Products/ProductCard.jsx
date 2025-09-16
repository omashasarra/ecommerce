import Button from "../Shared/Button";
import { useCart } from "../../store/cart.jsx";
import { useToast } from "../../shared/toast.jsx"; 

export const ProductCard = ({ data = [] }) => {
  const cart = useCart();
  const { notify } = useToast(); 

  return (
    <div className="mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 place-items-center">
        {data.map((item, i) => {
          const key = item.id || item._id || i;
          const img = item.img || item.imageURL || "";
          const title = item.title || "";
          const price = typeof item.price === "number" ? item.price : Number(item.price || 0);
          const stock = Number(item.stock ?? 0);

          const handleAdd = () => {
            if (stock <= 0) {
              notify("This item is out of stock", "error");
              return;
            }
            const existing = cart.items.find((x) => x.id === key);
            if (existing && existing.qty >= stock) {
              notify("You reached the available stock", "error");
              return;
            }
            cart.add({ id: key, title, price, img, stock }, 1);
            notify("Added to cart ✅", "success");
          };

          return (
            <div
              data-aos="fade-up"
              data-aos-delay={item.aosDelay || "0"}
              className="group"
              key={key}
            >
              <div className="relative">
                <img
                  src={img}
                  alt={title}
                  className="h-[180px] w-[260px] object-cover rounded-md"
                />
                {/* hover button */}
                <div
                  className="hidden group-hover:flex absolute top-1/2
                           -translate-y-1/2 left-1/2 -translate-x-1/2 h-full w-full
                           text-center group-hover:backdrop-blur-sm justify-center
                           items-center duration-200"
                >
                  <Button
                    text={"Add to cart"}
                    bgColor={"bg-primary"}
                    textColor={"text-white"}
                    handler={handleAdd}
                  />
                </div>
              </div>
              <div className="leading-7">
                <h2 className="font-semibold">{title}</h2>
                <h2 className="font-bold">
                  {price.toLocaleString(undefined, { style: "currency", currency: "USD" })}
                </h2>
                {stock <= 0 && (
                  <p className="text-xs text-amber-600">Out of stock</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
