"use client";

interface Props {
  data: any;
  onChange: (field: string, value: any) => void;
}

export default function Step1ContactIdentity({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Contact & Identity Details</h2>
        <p className="text-sm text-gray-500 mt-1">Start by entering the GST number to autofill details.</p>
      </div>

      {/* GST Number */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
          <input
            type="text"
            value={data.gstNumber || ""}
            onChange={(e) => onChange("gstNumber", e.target.value.toUpperCase())}
            placeholder="e.g. 29ABCDE1234F1Z5"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <button className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            Fetch
          </button>
        </div>
      </div>

      {/* Trade Name & Legal Name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trade Name / Vendor Name</label>
          <input
            type="text"
            value={data.tradeName || ""}
            onChange={(e) => onChange("tradeName", e.target.value)}
            placeholder="Trade name"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name of Business</label>
          <input
            type="text"
            value={data.legalName || ""}
            onChange={(e) => onChange("legalName", e.target.value)}
            placeholder="Legal name"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* PAN & Date of Registration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PAN</label>
          <input
            type="text"
            value={data.pan || ""}
            onChange={(e) => onChange("pan", e.target.value.toUpperCase())}
            placeholder="e.g. ABCDE1234F"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Registration</label>
          <input
            type="date"
            value={data.dateOfRegistration || ""}
            onChange={(e) => onChange("dateOfRegistration", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* PAN Linked with Aadhaar */}
      <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
        <input
          type="checkbox"
          id="panLinkedAadhaar"
          checked={data.panLinkedAadhaar || false}
          onChange={(e) => onChange("panLinkedAadhaar", e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <label htmlFor="panLinkedAadhaar" className="text-sm text-gray-700">
          PAN Linked with Aadhaar
        </label>
      </div>

      {/* Registered Address */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Registered Address</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input
              type="text"
              value={data.addressLine1 || ""}
              onChange={(e) => onChange("addressLine1", e.target.value)}
              placeholder="Street address"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={data.addressLine2 || ""}
              onChange={(e) => onChange("addressLine2", e.target.value)}
              placeholder="Apartment, suite, etc."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={data.city || ""}
                onChange={(e) => onChange("city", e.target.value)}
                placeholder="City"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={data.state || ""}
                onChange={(e) => onChange("state", e.target.value)}
                placeholder="State"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                value={data.pincode || ""}
                onChange={(e) => onChange("pincode", e.target.value)}
                placeholder="Pincode"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
            <input
              type="text"
              value={data.contactPerson || ""}
              onChange={(e) => onChange("contactPerson", e.target.value)}
              placeholder="Full name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email / Email ID</label>
            <input
              type="email"
              value={data.contactEmail || ""}
              onChange={(e) => onChange("contactEmail", e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone / Mobile No</label>
            <input
              type="tel"
              value={data.contactPhone || ""}
              onChange={(e) => onChange("contactPhone", e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name (Optional)</label>
            <input
              type="text"
              value={data.departmentName || ""}
              onChange={(e) => onChange("departmentName", e.target.value)}
              placeholder="e.g. Finance"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
