import React, { useEffect, useRef, useState } from 'react';
import { Upload, Pill, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import adminService from '../../services/adminService';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  expiresOn: '',
  isActive: true,
};

export default function AddProductModal({ isOpen, onClose, onSave, initialProduct = null }) {
  const { user } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  const isEdit = Boolean(initialProduct?._id);

  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialProduct) {
      setFormData({
        name: initialProduct.name ?? '',
        description: initialProduct.description ?? '',
        price: String(initialProduct.price ?? ''),
        stock: String(initialProduct.stock ?? ''),
        expiresOn: initialProduct.expiresOn ?? '',
        isActive: initialProduct.isActive !== false,
      });
    } else {
      setFormData(emptyForm);
    }
    setImageFile(null);
    setPreviewUrl('');
    setFormError('');
    setIsPending(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [isOpen, initialProduct]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectImage = (candidate) => {
    if (!candidate) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(candidate.type)) {
      setFormError('Image must be JPG, JPEG, PNG, or WEBP.');
      return;
    }
    if (candidate.size > 5 * 1024 * 1024) {
      setFormError('Image must be under 5MB.');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(candidate);
    setPreviewUrl(URL.createObjectURL(candidate));
    setFormError('');
  };

  const validate = () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.expiresOn) {
      return 'Please fill name, description and expiry date.';
    }
    const price = Number(formData.price);
    if (!Number.isFinite(price) || price <= 0) {
      return 'Please enter a valid price greater than zero.';
    }
    const stock = Number(formData.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      return 'Please enter a valid stock quantity (0 or more).';
    }
    if (Number.isNaN(new Date(formData.expiresOn).getTime())) {
      return 'Please enter a valid expiry date.';
    }
    if (!isEdit && !imageFile) {
      return 'Product image is required.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const problem = validate();
    if (problem) {
      setFormError(problem);
      return;
    }
    setIsPending(true);
    setFormError('');
    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('description', formData.description.trim());
      payload.append('price', String(Number(formData.price)));
      payload.append('stock', String(Number(formData.stock)));
      payload.append('expiresOn', formData.expiresOn);
      payload.append('isActive', String(formData.isActive));
      if (imageFile) payload.append('image', imageFile);

      const saved = isEdit
        ? await adminService.updateProduct({
            token: user?.token,
            productId: initialProduct._id,
            formData: payload,
          })
        : await adminService.addProduct({ token: user?.token, formData: payload });

      if (typeof onSave === 'function') onSave(saved);
      else if (typeof onClose === 'function') onClose();
    } catch (err) {
      setFormError(
        err?.response?.data?.message || err?.message || 'Could not save the product.',
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Pharmacy Product' : 'Add New Pharmacy Product'}
      subtitle={
        isEdit
          ? 'Update inventory details for this catalog product'
          : 'Enter pharmaceutical inventory details for the MediTrust catalog'
      }
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Save to Catalog'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>

        {/* Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Product Packaging Image {isEdit ? '(optional — leave empty to keep current)' : '*'}
          </label>
          <div
            className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer space-y-1"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="New product preview"
                className="w-24 h-24 object-cover rounded-xl mx-auto"
              />
            ) : isEdit && initialProduct?.image ? (
              <img
                src={initialProduct.image}
                alt="Current product"
                className="w-24 h-24 object-cover rounded-xl mx-auto"
              />
            ) : (
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
            )}
            <p className="text-xs font-semibold text-slate-700">
              {previewUrl ? imageFile?.name : 'Click to upload product image'}
            </p>
            <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleSelectImage(e.target.files[0]);
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Amoxicillin Trihydrate"
            icon={Pill}
            required
          />
          <Input
            label="Expiry Date"
            name="expiresOn"
            type="date"
            value={formData.expiresOn}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Unit Price ($)"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            placeholder="18.50"
            required
          />
          <Input
            label="Inventory Stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            value={formData.stock}
            onChange={handleChange}
            placeholder="250"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description & Uses *
          </label>
          <textarea
            rows={2}
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief overview of drug class and primary clinical indications..."
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span className="font-semibold">Active — visible in Pharmacy catalog</span>
          </label>
        </div>

        {formError && (
          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
            <X className="w-3.5 h-3.5" />
            {formError}
          </p>
        )}

      </form>
    </Modal>
  );
}
