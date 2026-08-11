import React from 'react';
import { AddressBook } from '@/components/organisms/AddressBook';

const CustomerAddressesPage: React.FC = () => {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-fraunces font-medium text-gray-900">Saved Addresses</h1>
        <p className="text-gray-500 mt-2">Manage your shipping and billing addresses.</p>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
        <AddressBook />
      </div>
    </div>
  );
};

export default CustomerAddressesPage;
