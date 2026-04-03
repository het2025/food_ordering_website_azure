const fs = require("fs");
let file = fs.readFileSync("delivery-frontend/src/pages/Profile.jsx", "utf8");

const replacement = `                      spellCheck={false}
                    />
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-200 border-dashed">
                    <h3 className="mb-4 text-lg font-bold text-gray-800">Bank Account Details</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Account Number</label>
                        <input
                          type="text"
                          name="bankDetails.accountNumber"
                          value={formData.bankDetails?.accountNumber || ""}
                          onChange={handleChange}
                          placeholder="e.g. 123456789012345678"
                          maxLength={18}
                          className="w-full px-4 py-3 text-base rounded-xl border border-gray-300 outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Account Holder Name</label>
                        <input
                          type="text"
                          name="bankDetails.accountName"
                          value={formData.bankDetails?.accountName || ""}
                          onChange={handleChange}
                          placeholder="Name as per bank records"
                          className="w-full px-4 py-3 text-base uppercase rounded-xl border border-gray-300 outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">IFSC Code</label>
                        <input
                          type="text"
                          name="bankDetails.ifscCode"
                          value={formData.bankDetails?.ifscCode || ""}
                          onChange={handleChange}
                          placeholder="e.g. HDFC0001234"
                          maxLength={11}
                          className="w-full px-4 py-3 text-base uppercase rounded-xl border border-gray-300 outline-none transition focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">`;

file = file.replace(/                      spellCheck=\{false\}\r?\n                    \/>\r?\n                  <\/div>\r?\n\r?\n                  <div className=\"flex gap-3 pt-2\">/, replacement);

fs.writeFileSync("delivery-frontend/src/pages/Profile.jsx", file);
console.log("updated Profile JSX");

