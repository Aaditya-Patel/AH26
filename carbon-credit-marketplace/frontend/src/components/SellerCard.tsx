import { SellerMatch } from '../types';

interface SellerCardProps {
  seller: SellerMatch;
  onContact?: () => void;
}

export default function SellerCard({ seller, onContact }: SellerCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{seller.seller_name}</h3>
          <p className="text-gray-600">{seller.project_type}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">
            ₹{seller.price_per_credit.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">per credit</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-lg font-semibold">{seller.quantity} credits</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Vintage</p>
          <p className="text-lg font-semibold">{seller.vintage}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Match Score</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full"
            style={{ width: `${seller.match_score}%` }}
          ></div>
        </div>
        <p className="text-sm text-right mt-1">{seller.match_score.toFixed(0)}%</p>
      </div>

      {seller.reasons.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Why this match?</p>
          <ul className="text-sm text-gray-600 space-y-1">
            {seller.reasons.map((reason, index) => (
              <li key={index}>• {reason}</li>
            ))}
          </ul>
        </div>
      )}

      {onContact && (
        <button
          onClick={onContact}
          className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Contact Seller
        </button>
      )}
    </div>
  );
}
