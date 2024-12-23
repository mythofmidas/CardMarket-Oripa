import formatPrice from "../../utils/formatPrice";

function GachaPriceLabel({ price }) {
  return (
    <div className="w-auto bg-gray-100 flex items-center justify-center h-5 text-white px-1">
      <img
        src={require("../../assets/img/icons/dollar-coin.png")}
        alt="img"
        height="15"
        width="15"
      ></img>
      <span className="text-gray-900 px-1 font-bold">{formatPrice(price)}</span>
    </div>
  );
}

export default GachaPriceLabel;
