import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/shared/PageHeader';
import { FormInput, FormSelect, FormTextarea } from '../components/shared/FormFields';
import { ImageUpload, type ImageMetadata } from '../components/shared/ImageUpload';
import { adminProductService, type AdminProduct, type ProductVariant } from '../services/productService';
import { adminCategoryService } from '../services/categoryService';
import { adminSubCategoryService, type AdminSubCategory } from '../services/subCategoryService';
import { Plus, Trash2, Layers, Palette, ShieldCheck, DollarSign, Package, FileText, Globe, GitBranch, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

type TabType = 'Basic' | 'Media' | 'Pricing' | 'Inventory' | 'Variants' | 'Attributes' | 'SEO' | 'Visibility';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const [activeTab, setActiveTab] = useState<TabType>('Basic');
  const [loading, setLoading] = useState(isEditing ? true : false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<AdminProduct>>({
    name: '',
    slug: '',
    sku: '',
    category: '',
    subCategory: '',
    description: '',
    price: 0,
    compareAtPrice: 0,
    discount: 0,
    stock: 0,
    availability: 'In Stock',
    handmadeTime: '',
    brand: 'ElleStyle',
    countryOfOrigin: 'India',
    material: '',
    weight: '',
    dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
    variants: [],
    colors: [],
    attributes: [],
    status: 'active',
    visibility: 'public',
    featured: false,
    tags: [],
    searchKeywords: [],
  });

  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  
  // Dropdown options
  const [categoriesList, setCategoriesList] = useState<import('../services/categoryService').AdminCategory[]>([]);
  const [subCategoriesList, setSubCategoriesList] = useState<AdminSubCategory[]>([]);

  // Builder states
  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#000000');
  const [attrKey, setAttrKey] = useState('');
  const [attrLabel, setAttrLabel] = useState('');
  const [attrValue, setAttrValue] = useState('');
  const [attrType, setAttrType] = useState<'String' | 'Number' | 'Boolean' | 'Date'>('String');

  useEffect(() => {
    adminCategoryService.getCategories().then(setCategoriesList).catch(console.error);
    if (isEditing && id) {
      fetchProduct(id);
    }
  }, [id, isEditing]);

  const fetchProduct = async (pId: string) => {
    try {
      setLoading(true);
      const data = await adminProductService.getProductById(pId);
      const categoryId = typeof data.category === 'object' && data.category ? data.category._id : data.category || '';
      const subCatId = typeof data.subCategory === 'object' && data.subCategory ? data.subCategory._id : data.subCategory || '';

      setFormData({
        ...data,
        category: categoryId,
        subCategory: subCatId,
        dimensions: data.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
        variants: data.variants || [],
        colors: data.colors || [],
        attributes: data.attributes || [],
        tags: data.tags || [],
        searchKeywords: data.searchKeywords || [],
      });
      if (data.images) setImages(data.images);
      if (categoryId) loadSubCategories(categoryId as string);
    } catch (error) {
      toast.error('Error loading product details');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const loadSubCategories = async (catId: string) => {
    try {
      const subs = await adminSubCategoryService.getSubCategories({ category: catId, active: true });
      setSubCategoriesList(subs);
    } catch (e) {
      console.error('Error loading subcategories', e);
    }
  };

  const handleCategoryChange = (catId: string) => {
    setFormData((prev) => ({ ...prev, category: catId, subCategory: '' }));
    if (catId) {
      loadSubCategories(catId);
    } else {
      setSubCategoriesList([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    if (type === 'number') parsedValue = parseFloat(value) || 0;
    else if (type === 'checkbox') parsedValue = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
      ...(name === 'name' && !isEditing ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') } : {}),
      ...(name === 'stock' && prev.availability !== 'Pre-Order' ? { availability: parsedValue > 0 ? 'In Stock' : 'Out of Stock' } : {}),
    }));
  };

  const handleDimensionChange = (field: 'length' | 'width' | 'height', value: number) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: { ...(prev.dimensions || { unit: 'cm' }), [field]: value },
    }));
  };

  // Color Swatch Management
  const addColorSwatch = () => {
    if (!colorName.trim() || !colorHex) return toast.error('Please specify both color name and hex code');
    setFormData((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), { name: colorName.trim(), hex: colorHex }],
    }));
    setColorName('');
  };

  const removeColorSwatch = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors?.filter((_, i) => i !== index),
    }));
  };

  // Custom Attribute Management
  const addCustomAttribute = () => {
    if (!attrKey || !attrLabel || !attrValue) return toast.error('Please complete Attribute Key, Label, and Value');
    setFormData((prev) => ({
      ...prev,
      attributes: [...(prev.attributes || []), { key: attrKey.trim().toLowerCase(), label: attrLabel.trim(), value: attrValue, type: attrType }],
    }));
    setAttrKey('');
    setAttrLabel('');
    setAttrValue('');
  };

  const removeCustomAttribute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes?.filter((_, i) => i !== index),
    }));
  };

  // Inline Variant Management (VASAAF Style)
  const addInlineVariant = () => {
    const nextIndex = (formData.variants?.length || 0) + 1;
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          name: `Variant ${nextIndex}`,
          colorName: '',
          colorHex: '#03989E',
          price: undefined,
          stock: undefined,
          sku: '',
          material: '',
          images: [],
          image: '',
          isAvailable: true,
          isActive: true,
        },
      ],
    }));
    toast.success(`Added Variant ${nextIndex}`);
  };

  const updateVariantField = (variantIdx: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...(prev.variants || [])];
      updated[variantIdx] = { ...updated[variantIdx], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const handleInlineVariantImageUpload = async (variantIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const toastId = toast.loading('Uploading media for variant...');
    try {
      const uploadedImages: { secure_url: string; public_id?: string; isPrimary?: boolean }[] = [];
      for (let i = 0; i < files.length; i++) {
        const data = new FormData();
        data.append('category', 'ProductVariants');
        data.append('productSlug', (formData.slug || 'option') + `-var-${variantIdx}-${Date.now()}-${i}`);
        data.append('images', files[i]);

        const res = await fetch('/api/v1/upload', {
          method: 'POST',
          body: data,
        });

        if (!res.ok) throw new Error('Failed to upload image');
        const result = await res.json();
        if (result.data && result.data[0]) {
          uploadedImages.push({
            secure_url: result.data[0].secure_url,
            public_id: result.data[0].public_id,
            isPrimary: false,
          });
        }
      }

      setFormData((prev) => {
        const updated = [...(prev.variants || [])];
        const currentImages = [...(updated[variantIdx].images || [])];
        const allImages = [...currentImages, ...uploadedImages];
        if (allImages.length > 0 && !allImages.some((img) => img.isPrimary)) {
          allImages[0].isPrimary = true;
        }
        const primaryImage = allImages.find((img) => img.isPrimary)?.secure_url || allImages[0]?.secure_url || '';
        updated[variantIdx] = {
          ...updated[variantIdx],
          images: allImages,
          image: primaryImage,
        };
        return { ...prev, variants: updated };
      });

      toast.success('Images uploaded successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload images', { id: toastId });
    }
  };

  const removeVariantImage = (variantIdx: number, imageIdx: number) => {
    setFormData((prev) => {
      const updated = [...(prev.variants || [])];
      const currentImages = updated[variantIdx].images?.filter((_, idx) => idx !== imageIdx) || [];
      if (currentImages.length > 0 && !currentImages.some((img) => img.isPrimary)) {
        currentImages[0].isPrimary = true;
      }
      const primaryImage = currentImages.find((img) => img.isPrimary)?.secure_url || currentImages[0]?.secure_url || '';
      updated[variantIdx] = {
        ...updated[variantIdx],
        images: currentImages,
        image: primaryImage,
      };
      return { ...prev, variants: updated };
    });
  };

  const setVariantPrimaryImage = (variantIdx: number, imageIdx: number) => {
    setFormData((prev) => {
      const updated = [...(prev.variants || [])];
      const currentImages = updated[variantIdx].images?.map((img, idx) => ({
        ...img,
        isPrimary: idx === imageIdx,
      })) || [];
      const primaryImage = currentImages.find((img) => img.isPrimary)?.secure_url || currentImages[0]?.secure_url || '';
      updated[variantIdx] = {
        ...updated[variantIdx],
        images: currentImages,
        image: primaryImage,
      };
      return { ...prev, variants: updated };
    });
  };

  const toggleInlineVariantAvailability = (variantIdx: number) => {
    setFormData((prev) => {
      const updated = [...(prev.variants || [])];
      const nextStatus = updated[variantIdx].isAvailable !== false ? false : true;
      updated[variantIdx] = { ...updated[variantIdx], isAvailable: nextStatus, isActive: nextStatus };
      return { ...prev, variants: updated };
    });
  };

  const removeInlineVariant = (variantIdx: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants?.filter((_, idx) => idx !== variantIdx),
    }));
    toast.success('Variant removed');
  };

  const uploadNewImages = async (category: string, slug: string): Promise<ImageMetadata[]> => {
    const newFiles = images.filter((img) => img.file);
    if (newFiles.length === 0) return images;

    const data = new FormData();
    data.append('category', category);
    data.append('productSlug', slug);
    newFiles.forEach((img) => {
      if (img.file) data.append('images', img.file);
    });

    const res = await fetch('/api/v1/upload', { method: 'POST', body: data });
    if (!res.ok) throw new Error('Failed to upload media images');
    const result = await res.json();
    const uploadedMeta: any[] = result.data;

    let uploadIndex = 0;
    return images.map((img) => {
      if (img.file) {
        const meta = uploadedMeta[uploadIndex++];
        return { ...img, file: undefined, public_id: meta.public_id, secure_url: meta.secure_url, previewUrl: meta.secure_url };
      }
      return img;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.slug) {
      toast.error('Required fields missing in Basic tab (Name, Category, Slug)');
      setActiveTab('Basic');
      return;
    }

    try {
      setSaving(true);
      const categoryObj = categoriesList.find((c) => c._id === formData.category);
      const categoryName = categoryObj ? categoryObj.name : 'unnamed-category';
      const finalImages = await uploadNewImages(categoryName, formData.slug as string);

      const payload: Partial<AdminProduct> = {
        ...formData,
        images: finalImages,
        schemaVersion: 2,
      };

      if (isEditing && id) {
        await adminProductService.updateProduct(id, payload);
        toast.success('Product updated successfully');
      } else {
        await adminProductService.createProduct(payload);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'Basic', label: 'Basic', icon: <FileText className="w-4 h-4" /> },
    { key: 'Media', label: 'Media', icon: <Palette className="w-4 h-4" /> },
    { key: 'Pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'Inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
    { key: 'Variants', label: 'Variants', icon: <GitBranch className="w-4 h-4" /> },
    { key: 'Attributes', label: 'Attributes', icon: <Layers className="w-4 h-4" /> },
    { key: 'SEO', label: 'SEO', icon: <Globe className="w-4 h-4" /> },
    { key: 'Visibility', label: 'Visibility', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  if (loading) return <div className="p-12 text-center text-gray-500">Loading product architecture...</div>;

  return (
    <div className="pb-16 max-w-5xl mx-auto">
      <PageHeader title={isEditing ? `Edit Product: ${formData.name}` : 'Create Enterprise Product'} />

      {/* Tab Navigation Bar */}
      <div className="flex border-b border-gray-200 mt-6 overflow-x-auto bg-white rounded-t-lg px-2 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === t.key
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-t-0 border-gray-200 rounded-b-lg p-6">
        {/* TAB 1: BASIC */}
        {activeTab === 'Basic' && (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Basic Product Information & Relational Hierarchy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput label="Product Name *" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Macramé Wall Hanging" />
              <FormInput label="URL Slug *" name="slug" value={formData.slug || ''} onChange={handleChange} placeholder="macrame-wall-hanging" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category *</label>
                <select
                  value={typeof formData.category === 'object' ? (formData.category as any)._id : formData.category || ''}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white"
                  required
                >
                  <option value="">Select Category</option>
                  {categoriesList.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SubCategory (Relational ObjectId)</label>
                <select
                  name="subCategory"
                  value={typeof formData.subCategory === 'object' ? (formData.subCategory as any)._id : formData.subCategory || ''}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white disabled:bg-gray-100"
                  disabled={!formData.category}
                >
                  <option value="">No SubCategory / Global Category Item</option>
                  {subCategoriesList.map((sc) => (
                    <option key={sc._id} value={sc._id}>{sc.name}</option>
                  ))}
                </select>
              </div>

              <FormInput label="SKU Identifier" name="sku" value={formData.sku || ''} onChange={handleChange} placeholder="ELLE-MAC-001" />
              <FormInput label="Brand / Creator" name="brand" value={formData.brand || 'ElleStyle'} onChange={handleChange} />
            </div>

            <FormTextarea label="Product Description" name="description" value={formData.description || ''} onChange={handleChange} rows={5} placeholder="Detailed product craftsmanship story..." />
          </div>
        )}

        {/* TAB 2: MEDIA */}
        {activeTab === 'Media' && (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Product Media & Cloudinary Assets</h3>
            <ImageUpload images={images} onImagesChange={setImages} maxImages={10} />
            <p className="text-xs text-gray-500">First image will act as the primary product catalog thumbnail.</p>
          </div>
        )}

        {/* TAB 3: PRICING */}
        {activeTab === 'Pricing' && (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Pricing & Discount Architecture</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <FormInput label="Selling Price (₹) *" name="price" type="number" value={String(formData.price || 0)} onChange={handleChange} />
              <FormInput label="Compare-at Price / MRP (₹)" name="compareAtPrice" type="number" value={String(formData.compareAtPrice || 0)} onChange={handleChange} />
              <FormInput label="Discount Percentage (%)" name="discount" type="number" value={String(formData.discount || 0)} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* TAB 4: INVENTORY */}
        {activeTab === 'Inventory' && (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Stock Inventory & Fulfillment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <FormInput label="Stock Quantity" name="stock" type="number" value={String(formData.stock || 0)} onChange={handleChange} />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
                <select name="availability" value={formData.availability || 'In Stock'} onChange={handleChange} className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white">
                  <option value="In Stock">In Stock</option>
                  <option value="Pre-Order">Pre-Order</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <FormInput label="Handmade Time / Crafting Duration" name="handmadeTime" value={formData.handmadeTime || ''} onChange={handleChange} placeholder="e.g. 5-7 Business Days" />
            </div>
            <FormInput label="Country of Origin" name="countryOfOrigin" value={formData.countryOfOrigin || 'India'} onChange={handleChange} />
          </div>
        )}

        {/* TAB 5: VARIANTS (VASAAF-Style Inline Architecture) */}
        {activeTab === 'Variants' && (
          <div className="space-y-6 text-gray-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xl font-bold text-gray-900">Variants</h3>
              <span className="text-xs text-gray-500 font-normal">Configure colors, sizes, and multi-image collections directly per variant</span>
            </div>

            <div className="space-y-8 divide-y divide-gray-200">
              {(!formData.variants || formData.variants.length === 0) ? (
                <div className="py-12 text-center">
                  <GitBranch className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">No variants configured yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Click "+ Add Variant" below to add distinct options and multi-image galleries.</p>
                </div>
              ) : (
                formData.variants.map((v, index) => {
                  const variantImages = v.images && v.images.length > 0 ? v.images : (v.image ? [{ secure_url: v.image, isPrimary: true }] : []);
                  const mainPreview = variantImages.find(img => img.isPrimary)?.secure_url || variantImages[0]?.secure_url || v.image || '';

                  return (
                    <div key={index} className="pt-6 first:pt-0 pb-2">
                      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                        
                        {/* Avatar & Title */}
                        <div className="flex flex-col items-center gap-1.5 flex-shrink-0 w-28">
                          <div className="w-14 h-14 rounded-full border-2 border-black overflow-hidden bg-gray-50 flex items-center justify-center shadow-xs">
                            {mainPreview ? (
                              <img src={mainPreview} alt={`Variant ${index + 1}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                <ImageIcon className="w-6 h-6 opacity-40" />
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={v.name || ''}
                            onChange={(e) => updateVariantField(index, 'name', e.target.value)}
                            className="text-xs font-semibold text-gray-800 bg-transparent text-center border-b border-dashed border-gray-300 hover:border-gray-500 focus:border-black focus:border-solid px-1 py-0.5 w-full focus:outline-none transition"
                            placeholder={`Variant ${index + 1}`}
                            title="Click to rename variant (e.g. Royal Blue / Gold Polish)"
                          />
                        </div>

                        {/* ElleStyle Variant Properties (Inline Configuration directly in listing) */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Price Override (₹)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder={`Base (${formData.price || 0})`}
                              value={v.price || ''}
                              onChange={(e) => updateVariantField(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full h-9 border border-gray-300 rounded-lg px-2.5 text-xs focus:border-[#03989E] focus:outline-none bg-white shadow-2xs text-gray-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Stock Quantity</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="10"
                              value={v.stock !== undefined ? v.stock : ''}
                              onChange={(e) => updateVariantField(index, 'stock', parseInt(e.target.value) || 0)}
                              className="w-full h-9 border border-gray-300 rounded-lg px-2.5 text-xs focus:border-[#03989E] focus:outline-none bg-white shadow-2xs text-gray-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Color Swatch</label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="Color Name"
                                value={v.colorName || ''}
                                onChange={(e) => updateVariantField(index, 'colorName', e.target.value)}
                                className="w-full h-9 border border-gray-300 rounded-lg px-2 text-xs focus:border-[#03989E] focus:outline-none bg-white shadow-2xs text-gray-800 flex-1"
                              />
                              <input
                                type="color"
                                value={v.colorHex || '#03989E'}
                                onChange={(e) => updateVariantField(index, 'colorHex', e.target.value)}
                                className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5 bg-white shadow-2xs flex-shrink-0"
                                title="Pick Swatch Color Hex"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">SKU Identifier</label>
                            <input
                              type="text"
                              placeholder="ELLE-VAR-001"
                              value={v.sku || ''}
                              onChange={(e) => updateVariantField(index, 'sku', e.target.value)}
                              className="w-full h-9 border border-gray-300 rounded-lg px-2.5 text-xs focus:border-[#03989E] focus:outline-none bg-white shadow-2xs text-gray-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Material / Finish</label>
                            <input
                              type="text"
                              placeholder="e.g. 18k Gold Plated"
                              value={v.material || ''}
                              onChange={(e) => updateVariantField(index, 'material', e.target.value)}
                              className="w-full h-9 border border-gray-300 rounded-lg px-2.5 text-xs focus:border-[#03989E] focus:outline-none bg-white shadow-2xs text-gray-800"
                            />
                          </div>
                        </div>

                        {/* Status and Remove buttons */}
                        <div className="flex flex-row xl:flex-col items-end gap-2 self-start xl:self-auto ml-auto">
                          <button
                            type="button"
                            onClick={() => toggleInlineVariantAvailability(index)}
                            className={`w-28 py-1.5 px-3 rounded text-xs font-medium border transition text-center ${
                              v.isAvailable !== false && v.isActive !== false
                                ? 'bg-white border-[#03989E] text-[#03989E] shadow-2xs font-semibold'
                                : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {v.isAvailable !== false && v.isActive !== false ? 'Availabled' : 'Disabled'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeInlineVariant(index)}
                            className="w-28 py-1.5 px-3 rounded text-xs font-medium bg-white border border-red-300 text-red-500 hover:bg-red-50 transition text-center shadow-2xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Images / Media Uploader for this variant */}
                      <div className="mt-6">
                        <div className="text-xs font-medium text-gray-500 mb-2.5">
                          Images/Videos for this variant
                        </div>
                        
                        <label className="inline-flex items-center px-4 py-2 bg-[#f4f4f4] border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 cursor-pointer hover:bg-gray-200 active:bg-gray-300 transition shadow-2xs mb-3">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleInlineVariantImageUpload(index, e)}
                            className="hidden"
                          />
                          <Upload className="w-3.5 h-3.5 mr-1.5 opacity-70" /> Choose Files
                        </label>

                        {variantImages.length === 0 ? (
                          <div className="text-xs text-gray-400 italic pt-1 border-t border-dashed border-gray-100 mt-2">
                            No media uploaded for this variant.
                          </div>
                        ) : (
                          <div className="flex items-center flex-wrap gap-3 mt-1">
                            {variantImages.map((img, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="w-24 h-28 rounded-xl border border-gray-200 overflow-hidden relative group bg-gray-50 shadow-xs flex flex-col"
                              >
                                <img
                                  src={img.secure_url}
                                  alt={`V-${index}-img-${imgIdx}`}
                                  className="w-full h-22 object-cover aspect-[3/4] flex-1 cursor-pointer"
                                  onClick={() => setVariantPrimaryImage(index, imgIdx)}
                                  title="Click to set as Primary Variant Image"
                                />
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
                                  <button
                                    type="button"
                                    onClick={() => removeVariantImage(index, imgIdx)}
                                    className="p-1 bg-white/90 hover:bg-red-50 text-red-500 rounded-md shadow-sm transition border border-gray-200"
                                    title="Delete this image"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                {img.isPrimary && (
                                  <div className="bg-black text-white text-[10px] font-bold px-2 py-0.5 absolute bottom-1 left-1 rounded-md shadow-sm">
                                    Primary
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Add Variant Button */}
            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={addInlineVariant}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-800 hover:border-[#03989E] hover:text-[#03989E] font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> + Add Variant
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: ATTRIBUTES (Enterprise Dynamic Architecture) */}
        {activeTab === 'Attributes' && (
          <div className="space-y-8">
            <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Enterprise Product Attribute Architecture</h3>
            
            {/* Core Physical Properties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border">
              <FormInput label="Material Specification (Filterable)" name="material" value={formData.material || ''} onChange={handleChange} placeholder="e.g. 100% Pure Cotton Cord, Natural Wood" />
              <FormInput label="Approximate Weight" name="weight" value={formData.weight || ''} onChange={handleChange} placeholder="e.g. 450g" />
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (L × W × H in cm)</label>
                <div className="flex gap-4">
                  <input type="number" placeholder="Length" value={formData.dimensions?.length || 0} onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)} className="w-1/3 h-10 border rounded px-3 text-sm" />
                  <input type="number" placeholder="Width" value={formData.dimensions?.width || 0} onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)} className="w-1/3 h-10 border rounded px-3 text-sm" />
                  <input type="number" placeholder="Height" value={formData.dimensions?.height || 0} onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)} className="w-1/3 h-10 border rounded px-3 text-sm" />
                </div>
              </div>
            </div>

            {/* Color Swatch Architecture */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <h4 className="text-sm font-bold text-gray-800">Color Swatch Filter Options</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.colors && formData.colors.length > 0 ? (
                  formData.colors.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-full text-xs font-medium">
                      <span className="w-4 h-4 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: col.hex }}></span>
                      <span>{col.name}</span>
                      <button type="button" onClick={() => removeColorSwatch(idx)} className="text-red-500 hover:text-red-700 ml-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">No color swatches configured for this product.</span>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <input type="text" placeholder="Color Name (e.g. Mustard Gold)" value={colorName} onChange={(e) => setColorName(e.target.value)} className="flex-1 h-9 border rounded-md px-3 text-xs" />
                <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="w-12 h-9 border rounded-md cursor-pointer p-0.5" />
                <button type="button" onClick={addColorSwatch} className="flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-800">
                  <Plus className="w-3.5 h-3.5" /> Add Color
                </button>
              </div>
            </div>

            {/* Dynamic Custom Metadata-Driven Attributes */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Dynamic Custom Attributes (Metadata Driven)</h4>
                  <p className="text-xs text-gray-500">Enable future filters like Pattern, Technique, Occasion without schema rewrites.</p>
                </div>
              </div>

              {formData.attributes && formData.attributes.length > 0 && (
                <div className="border rounded-md overflow-hidden text-xs">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">Key</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">Label</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">Value</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {formData.attributes.map((attr, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 font-mono text-gray-600">{attr.key}</td>
                          <td className="px-3 py-2 font-semibold">{attr.label}</td>
                          <td className="px-3 py-2 text-gray-800">{String(attr.value)}</td>
                          <td className="px-3 py-2 text-right">
                            <button type="button" onClick={() => removeCustomAttribute(idx)} className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                <input type="text" placeholder="Key (e.g. pattern, occasion)" value={attrKey} onChange={(e) => setAttrKey(e.target.value)} className="h-9 border rounded-md px-3 text-xs font-mono" />
                <input type="text" placeholder="Label (e.g. Boho Pattern)" value={attrLabel} onChange={(e) => setAttrLabel(e.target.value)} className="h-9 border rounded-md px-3 text-xs" />
                <input type="text" placeholder="Value (e.g. Geometric Knots)" value={attrValue} onChange={(e) => setAttrValue(e.target.value)} className="h-9 border rounded-md px-3 text-xs" />
                <button type="button" onClick={addCustomAttribute} className="flex items-center justify-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-emerald-700">
                  <Plus className="w-3.5 h-3.5" /> Add Attribute
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SEO */}
        {activeTab === 'SEO' && (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Search Keywords & Product Tags</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Tags (Press Enter to attach)</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    e.preventDefault();
                    if (!formData.tags?.includes(tagInput.trim())) {
                      setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
                    }
                    setTagInput('');
                  }
                }}
                placeholder="boho, gift, handmade, chic"
                className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm mb-2"
              />
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((t) => (
                  <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    #{t} <button type="button" onClick={() => setFormData((prev) => ({ ...prev, tags: prev.tags?.filter((x) => x !== t) }))} className="ml-1.5 text-red-500 hover:text-red-700 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Search Keywords (Press Enter)</label>
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && keywordInput.trim()) {
                    e.preventDefault();
                    if (!formData.searchKeywords?.includes(keywordInput.trim())) {
                      setFormData((prev) => ({ ...prev, searchKeywords: [...(prev.searchKeywords || []), keywordInput.trim()] }));
                    }
                    setKeywordInput('');
                  }
                }}
                placeholder="synonyms, misspellings, seasonal terms..."
                className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm mb-2"
              />
              <div className="flex flex-wrap gap-2">
                {formData.searchKeywords?.map((kw) => (
                  <span key={kw} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {kw} <button type="button" onClick={() => setFormData((prev) => ({ ...prev, searchKeywords: prev.searchKeywords?.filter((x) => x !== kw) }))} className="ml-1.5 text-red-500 hover:text-red-700 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: VISIBILITY */}
        {activeTab === 'Visibility' && (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900 border-b pb-2">Storefront Visibility & Promotion Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catalog Status</label>
                <select name="status" value={formData.status || 'active'} onChange={handleChange} className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white">
                  <option value="active">Active (Available for purchase)</option>
                  <option value="inactive">Inactive (Disabled)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search & Category Visibility</label>
                <select name="visibility" value={formData.visibility || 'public'} onChange={handleChange} className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white">
                  <option value="public">Public (Normal routing & search)</option>
                  <option value="hidden">Hidden (Direct URL link only)</option>
                </select>
              </div>

              <label className="sm:col-span-2 flex items-center space-x-3 cursor-pointer p-4 border rounded-md hover:bg-gray-50">
                <input type="checkbox" name="featured" checked={formData.featured || false} onChange={handleChange} className="h-5 w-5 text-purple-600 rounded border-gray-300" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">Featured Product ⭐</div>
                  <div className="text-xs text-gray-500">Prioritize appearing in Homepage Featured collection and Carousel highlights.</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Form Footer Action Buttons */}
        <div className="flex justify-between items-center pt-6 mt-8 border-t border-gray-200">
          <span className="text-xs text-gray-400 font-mono">Schema Architecture v{formData.schemaVersion || 2}</span>
          <div className="flex space-x-4">
            <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-2.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-8 py-2.5 bg-primary text-white rounded-md shadow-sm text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : isEditing ? 'Save Product Changes' : 'Create Enterprise Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
