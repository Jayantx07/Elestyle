import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Tag, Box, ExternalLink, Layers, AlertCircle } from 'lucide-react';
import { adminCategoryService, type CatalogTreeCategory, type CatalogTreeSubCategory, type CatalogTreeProduct } from '../../services/categoryService';
import { StatusBadge } from './StatusBadge';

export const CatalogTreeView: React.FC = () => {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState<CatalogTreeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set of expanded category or subcategory IDs
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminCategoryService.getCatalogTree();
      setTreeData(data);
      // By default expand all Categories so admin immediately sees structure
      const initialExpanded = new Set<string>();
      data.forEach((cat) => initialExpanded.add(`cat_${cat._id}`));
      setExpanded(initialExpanded);
    } catch (err: any) {
      console.error('Failed to load hierarchy tree:', err);
      setError(err.message || 'Error loading catalog tree');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const expandAll = () => {
    const all = new Set<string>();
    treeData.forEach((cat) => {
      all.add(`cat_${cat._id}`);
      cat.subCategories.forEach((sub) => all.add(`sub_${sub._id}`));
    });
    setExpanded(all);
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 flex items-center justify-center space-x-3 text-gray-500">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
        <span className="font-medium">Loading Enterprise Catalog Tree...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center text-red-800 space-x-3">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-sm">Failed to load hierarchy tree</h3>
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (treeData.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center text-gray-500">
        <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="font-medium text-gray-900">No Categories Found</h3>
        <p className="text-sm text-gray-500 mt-1">Create your first category to start organizing your store catalog.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50/75 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-900 text-base">Relational Catalog Hierarchy Tree</h3>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
            {treeData.length} Categories
          </span>
        </div>
        <div className="flex space-x-3 text-sm font-medium">
          <button
            onClick={expandAll}
            className="text-gray-600 hover:text-indigo-600 transition duration-150 px-2.5 py-1 rounded border border-gray-300 bg-white hover:border-indigo-300 shadow-2xs"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-gray-600 hover:text-indigo-600 transition duration-150 px-2.5 py-1 rounded border border-gray-300 bg-white hover:border-indigo-300 shadow-2xs"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2 max-h-[750px] overflow-y-auto">
        {treeData.map((category) => {
          const catId = `cat_${category._id}`;
          const isCatExpanded = expanded.has(catId);

          return (
            <div key={category._id} className="border rounded-lg overflow-hidden transition-all duration-150 hover:border-gray-300 bg-white shadow-2xs">
              {/* Category Node header */}
              <div
                onClick={() => toggleExpand(catId)}
                className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-indigo-50/40 cursor-pointer select-none border-b border-gray-100 transition duration-150"
              >
                <div className="flex items-center space-x-3">
                  {isCatExpanded ? (
                    <ChevronDown className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="p-1 rounded bg-indigo-100 text-indigo-700">
                    {isCatExpanded ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 text-sm">{category.name}</span>
                    <span className="text-xs text-gray-400 ml-2 font-mono">({category.slug})</span>
                  </div>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-700">
                    {category.totalProductCount} {category.totalProductCount === 1 ? 'Product' : 'Products'}
                  </span>
                  <span className="text-xs text-gray-400">Order: {category.displayOrder || 0}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/categories/${category._id}`);
                  }}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition duration-150"
                >
                  <span>Edit Category</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </div>

              {/* Category Child Tier: SubCategories */}
              {isCatExpanded && (
                <div className="pl-6 py-2 pr-4 bg-gray-50/30 space-y-2 border-t">
                  {category.subCategories.length === 0 && category.directProducts.length === 0 && (
                    <div className="py-3 px-4 text-xs text-gray-400 italic">No subcategories or products found in this category.</div>
                  )}

                  {category.subCategories.map((sub) => {
                    const subId = `sub_${sub._id}`;
                    const isSubExpanded = expanded.has(subId);

                    return (
                      <div key={sub._id} className="border border-gray-200 rounded-md bg-white overflow-hidden shadow-2xs">
                        {/* SubCategory Node header */}
                        <div
                          onClick={() => toggleExpand(subId)}
                          className="flex items-center justify-between p-3 hover:bg-purple-50/40 cursor-pointer select-none transition duration-150"
                        >
                          <div className="flex items-center space-x-2.5">
                            {isSubExpanded ? (
                              <ChevronDown className="w-4 h-4 text-purple-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            <div className="p-1 rounded bg-purple-100 text-purple-700">
                              <Tag className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800 text-sm">{sub.name}</span>
                              <span className="text-xs text-gray-400 ml-2 font-mono">({sub.slug})</span>
                            </div>
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-purple-50 text-purple-700 border border-purple-200">
                              {sub.productCount} {sub.productCount === 1 ? 'Item' : 'Items'}
                            </span>
                            <span className="text-xs text-gray-400">Order: {sub.displayOrder || 0}</span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/subcategories/${sub._id}`);
                            }}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded transition duration-150"
                          >
                            <span>Edit SubCategory</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </button>
                        </div>

                        {/* SubCategory Child Tier: Products */}
                        {isSubExpanded && (
                          <div className="pl-8 py-2 pr-3 bg-slate-50 border-t space-y-1.5">
                            {sub.products.length === 0 ? (
                              <div className="py-2 px-3 text-xs text-gray-400 italic">No products currently assigned to this subcategory.</div>
                            ) : (
                              sub.products.map((product) => (
                                <div
                                  key={product._id}
                                  onClick={() => navigate(`/admin/products/${product._id}`)}
                                  className="flex items-center justify-between p-2 rounded bg-white border border-gray-100 hover:border-indigo-300 hover:shadow-2xs cursor-pointer transition duration-150"
                                >
                                  <div className="flex items-center space-x-2.5">
                                    <Box className="w-4 h-4 text-emerald-600 ml-1" />
                                    <span className="text-xs font-semibold text-gray-800 hover:text-indigo-600">{product.name}</span>
                                    <span className="text-[11px] font-mono text-gray-500 font-medium">₹{product.price}</span>
                                    {product.discount ? (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                                        -{product.discount}%
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[11px] text-gray-400">Order: {product.displayOrder || 0}</span>
                                    <StatusBadge status={product.status || (product.visibility === 'public' ? 'active' : 'inactive')} />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Direct products in category without subcategory */}
                  {category.directProducts.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-dashed">
                      <div className="text-xs font-bold text-gray-500 px-2 pb-1.5 uppercase tracking-wider">
                        Unclassified Category Products ({category.directProducts.length})
                      </div>
                      <div className="space-y-1 pl-2">
                        {category.directProducts.map((product) => (
                          <div
                            key={product._id}
                            onClick={() => navigate(`/admin/products/${product._id}`)}
                            className="flex items-center justify-between p-2 rounded bg-white border border-dashed border-gray-300 hover:border-indigo-400 cursor-pointer transition duration-150"
                          >
                            <div className="flex items-center space-x-2">
                              <Box className="w-4 h-4 text-amber-600" />
                              <span className="text-xs font-medium text-gray-800">{product.name}</span>
                              <span className="text-[11px] text-gray-500 font-mono">₹{product.price}</span>
                            </div>
                            <StatusBadge status={product.status || 'active'} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
