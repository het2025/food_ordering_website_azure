import React from 'react';
import { 
  MapPinIcon, 
  ClockIcon, 
  CurrencyRupeeIcon,
  BuildingStorefrontIcon 
} from '@heroicons/react/24/outline';

const OrderCard = ({ order, onAccept, onReject, showActions = true }) => {
  return (
    <div className="p-4 transition bg-white shadow-md rounded-xl hover:shadow-lg sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center min-w-0">
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-white rounded-full bg-primary">
            <BuildingStorefrontIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 ml-3">
            <h3 className="text-sm font-bold text-gray-800 truncate sm:text-base">{order.restaurantName}</h3>
            <p className="text-xs text-gray-500">#{order.orderNumber}</p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-2 text-right">
          <p className="text-lg font-bold text-primary sm:text-xl">₹{order.deliveryFee}</p>
          <p className="text-xs text-gray-500">Delivery Fee</p>
        </div>
      </div>

      {/* Details */}
      <div className="mb-3 space-y-2 sm:mb-4">
        {/* Pickup Location */}
        <div className="flex items-start">
          <MapPinIcon className="flex-shrink-0 h-4 w-4 text-green-600 mr-2 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Pickup</p>
            <p className="text-xs leading-snug text-gray-700 line-clamp-2">{order.restaurantLocation?.address}</p>
          </div>
        </div>

        {/* Delivery Location */}
        <div className="flex items-start">
          <MapPinIcon className="flex-shrink-0 h-4 w-4 text-red-500 mr-2 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Delivery</p>
            <p className="text-xs leading-snug text-gray-700 line-clamp-2">
              {order.deliveryAddress?.street}, {order.deliveryAddress?.area}
            </p>
          </div>
        </div>

        {/* Distance & Amount */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <ClockIcon className="w-3.5 h-3.5" />
            <span>{order.distance ? `${order.distance} km` : 'Calculating...'}</span>
          </div>
          <div className="flex items-center text-xs font-semibold text-gray-700">
            <CurrencyRupeeIcon className="w-3.5 h-3.5" />
            <span>{order.orderAmount}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-3">
          <button
            onClick={() => onReject(order._id)}
            className="flex-1 min-h-[48px] px-3 text-sm font-semibold text-red-600 rounded-xl border border-red-200 bg-red-50 transition hover:bg-red-100 active:scale-95"
          >
            Reject
          </button>
          <button
            onClick={() => onAccept(order._id)}
            className="flex-1 min-h-[48px] px-3 text-sm font-semibold text-white bg-green-600 rounded-xl transition hover:bg-green-700 active:scale-95"
          >
            Accept
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
