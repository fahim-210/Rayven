import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.tsx';
import { storeService } from '../../services/storeService.ts';
import { formatCurrency } from '../../lib/utils.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Dialog } from '../../components/ui/Dialog.tsx';
import { Select } from '../../components/ui/Select.tsx';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Tag,
  Boxes,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Product, JerseySize, KitType } from '../../types/index.ts';

const ALL_SIZES: JerseySize[] = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

const PRESET_MATERIALS = [
  '100% Recycled Aeroknit Poly Jacquard (Match-Grade)',
  '220 GSM Technical Piqué Polyester Mesh',
  'Aeroready Ultra-Dry Breathable Polyester',
  'Featherweight Hydrophobic Jacquard Weave',
  'Heavyweight 240 GSM Retro Heritage Knit',
];

const PRESET_SEASONS = ['2025/26', '2024/25', '2023/24', '1998/99 Retro', '1993/94 Classic'];

const PRESET_JERSEY_TYPES = [
  'Player Version',
  'Fan Version',
  'Retro Classic',
  'Training Edition',
  'Goalkeeper Match',
];

interface SizeFormState {
  size: JerseySize;
  enabled: boolean;
  stock: number;
  sku: string;
}

export const AdminProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => storeService.getProducts());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [clubFilter, setClubFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Product Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formClub, setFormClub] = useState('Valkyrie FC');
  const [formSeason, setFormSeason] = useState('2024/25');
  const [formCategory, setFormCategory] = useState('cat_kits');
  const [formJerseyType, setFormJerseyType] = useState('Player Version');
  const [formKitType, setFormKitType] = useState<KitType>('Home');
  const [formCostPrice, setFormCostPrice] = useState('500'); // Buying Price
  const [formBasePrice, setFormBasePrice] = useState('950'); // Selling Price
  const [formComparePrice, setFormComparePrice] = useState('1200');
  const [formMaterial, setFormMaterial] = useState(PRESET_MATERIALS[0]);
  const [formAllowCustomization, setFormAllowCustomization] = useState(true);
  const [formCustomizationPrice, setFormCustomizationPrice] = useState('150');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formImages, setFormImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80',
  ]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Size configurations
  const [sizeRows, setSizeRows] = useState<SizeFormState[]>([
    { size: 'S', enabled: true, stock: 15, sku: '' },
    { size: 'M', enabled: true, stock: 25, sku: '' },
    { size: 'L', enabled: true, stock: 20, sku: '' },
    { size: 'XL', enabled: true, stock: 10, sku: '' },
    { size: '2XL', enabled: false, stock: 5, sku: '' },
    { size: '3XL', enabled: false, stock: 0, sku: '' },
  ]);

  // Size chart state
  const [sizeChartNotes, setSizeChartNotes] = useState(
    'Slim athletic player silhouette. If you prefer a relaxed lifestyle fit, choose one size up.'
  );

  const clubs = useMemo(() => storeService.getClubs(), []);
  const categories = useMemo(() => storeService.getCategories(), []);

  // Compute stock aggregates for each product
  const inventory = useMemo(() => storeService.getInventory(), [products]);

  const productStockMap = useMemo(() => {
    const map = new Map<string, { totalStock: number; sizeCounts: Record<string, number> }>();

    products.forEach((p) => {
      // Find inventory matching this product
      const productItems = inventory.filter(
        (inv) => inv.productId === p.id || p.variants.some((v) => v.id === inv.variantId || v.sku === inv.sku)
      );

      let total = 0;
      const sizeCounts: Record<string, number> = {};

      if (productItems.length > 0) {
        productItems.forEach((inv) => {
          const avail = inv.available ?? inv.availableQuantity ?? (inv.currentStock - (inv.reservedStock || 0));
          total += avail;
          sizeCounts[inv.size] = (sizeCounts[inv.size] || 0) + avail;
        });
      } else {
        // Fallback to variants stock
        p.variants.forEach((v) => {
          total += v.stockQuantity;
          sizeCounts[v.size] = v.stockQuantity;
        });
      }

      map.set(p.id, { totalStock: total, sizeCounts });
    });

    return map;
  }, [products, inventory]);

  // Overall catalog financial statistics (Buying cost vs Potential Sales)
  const catalogStats = useMemo(() => {
    let totalPieces = 0;
    let totalStockCost = 0; // Stock Value using buying cost
    let potentialSalesVal = 0; // Potential sales value using selling price

    products.forEach((p) => {
      const stockInfo = productStockMap.get(p.id);
      const stock = stockInfo?.totalStock || 0;
      const buyingPrice = p.costPrice || 500;
      const sellingPrice = p.basePrice || 950;

      totalPieces += stock;
      totalStockCost += stock * buyingPrice;
      potentialSalesVal += stock * sellingPrice;
    });

    const activeCount = products.filter((p) => p.isActive !== false).length;
    const inactiveCount = products.length - activeCount;

    return {
      totalPieces,
      totalStockCost,
      potentialSalesVal,
      activeCount,
      inactiveCount,
    };
  }, [products, productStockMap]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.clubName?.toLowerCase().includes(search.toLowerCase()) ||
        p.season?.toLowerCase().includes(search.toLowerCase());

      const matchesCat = categoryFilter === 'ALL' || p.categoryId === categoryFilter;
      const matchesClub = clubFilter === 'ALL' || p.clubName === clubFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && p.isActive !== false) ||
        (statusFilter === 'INACTIVE' && p.isActive === false);

      return matchesSearch && matchesCat && matchesClub && matchesStatus;
    });
  }, [products, search, categoryFilter, clubFilter, statusFilter]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingProductId(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormDescription('Official athletic technical kit with Aeroknit™ performance engineering and breathable mesh zoning.');
    setFormClub('Valkyrie FC');
    setFormSeason('2024/25');
    setFormCategory('cat_kits');
    setFormJerseyType('Player Version');
    setFormKitType('Home');
    setFormCostPrice('500');
    setFormBasePrice('950');
    setFormComparePrice('1200');
    setFormMaterial(PRESET_MATERIALS[0]);
    setFormAllowCustomization(true);
    setFormCustomizationPrice('150');
    setFormIsActive(true);
    setFormImages([
      'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80',
    ]);
    setImageUrlInput('');
    setSizeRows([
      { size: 'S', enabled: true, stock: 15, sku: '' },
      { size: 'M', enabled: true, stock: 25, sku: '' },
      { size: 'L', enabled: true, stock: 20, sku: '' },
      { size: 'XL', enabled: true, stock: 10, sku: '' },
      { size: '2XL', enabled: false, stock: 5, sku: '' },
      { size: '3XL', enabled: false, stock: 0, sku: '' },
    ]);
    setSizeChartNotes('Slim athletic player cut. If you prefer a relaxed lifestyle fit, choose one size up.');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setFormTitle(p.title);
    setFormSubtitle(p.subtitle || '');
    setFormDescription(p.description || '');
    setFormClub(p.clubName || 'Valkyrie FC');
    setFormSeason(p.season || '2024/25');
    setFormCategory(p.categoryId || 'cat_kits');
    setFormJerseyType(p.jerseyType || 'Player Version');
    setFormKitType(p.kitType || 'Home');
    setFormCostPrice(String(p.costPrice || 500));
    setFormBasePrice(String(p.basePrice || 950));
    setFormComparePrice(p.comparePrice ? String(p.comparePrice) : '');
    setFormMaterial(p.material || PRESET_MATERIALS[0]);
    setFormAllowCustomization(p.allowCustomization !== false);
    setFormCustomizationPrice(String(p.customizationOptions?.defaultPrice || 150));
    setFormIsActive(p.isActive !== false);
    setFormImages(p.images?.map((img) => img.url) || ['https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800']);
    setImageUrlInput('');

    // Pre-fill sizes from variants and inventory
    const existingSizes = new Set(p.variants.map((v) => v.size));
    const newRows: SizeFormState[] = ALL_SIZES.map((sz) => {
      const v = p.variants.find((item) => item.size === sz);
      const isEnabled = existingSizes.has(sz);
      return {
        size: sz,
        enabled: isEnabled,
        stock: v?.stockQuantity || 0,
        sku: v?.sku || '',
      };
    });
    setSizeRows(newRows);
    const fitNote =
      typeof p.sizeChart === 'object' && p.sizeChart !== null
        ? (p.sizeChart as any).fitDescription
        : typeof p.sizeChart === 'string'
        ? p.sizeChart
        : 'Slim athletic player cut. Size up for relaxed fit.';
    setSizeChartNotes(fitNote);
    setIsModalOpen(true);
  };

  // Toggle Active/Inactive directly in list
  const handleToggleActive = (productId: string) => {
    const result = storeService.toggleProductActive(productId, 'Alex Mercer (Admin)');
    if (result.success) {
      setProducts([...storeService.getProducts()]);
    }
  };

  // Add image URL
  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    setFormImages([...formImages, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(formImages.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    const selected = formImages[index];
    const rest = formImages.filter((_, i) => i !== index);
    setFormImages([selected, ...rest]);
  };

  // Submit form (Create or Update)
  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const buyingPrice = parseFloat(formCostPrice) || 0;
    const sellingPrice = parseFloat(formBasePrice) || 0;
    const compPrice = formComparePrice ? parseFloat(formComparePrice) : undefined;

    const enabledSizes = sizeRows
      .filter((r) => r.enabled)
      .map((r) => ({
        size: r.size,
        initialStock: Number(r.stock) || 0,
        sku: r.sku || undefined,
      }));

    if (enabledSizes.length === 0) {
      alert('Please enable at least one size for the product.');
      return;
    }

    const formattedImages = formImages.map((url, idx) => ({
      id: `img_${Date.now()}_${idx}`,
      url,
      altText: formTitle,
      isPrimary: idx === 0,
      sortOrder: idx,
    }));

    const matchedCategory = categories.find((c) => c.id === formCategory);
    const matchedClub = clubs.find((c) => c.name === formClub);

    if (editingProductId) {
      // Update existing
      storeService.updateProduct(editingProductId, {
        title: formTitle,
        subtitle: formSubtitle,
        description: formDescription,
        clubId: matchedClub?.id,
        clubName: formClub,
        season: formSeason,
        categoryId: formCategory,
        categoryName: matchedCategory?.name,
        kitType: formKitType,
        jerseyType: formJerseyType,
        costPrice: buyingPrice,
        basePrice: sellingPrice,
        comparePrice: compPrice,
        material: formMaterial,
        allowCustomization: formAllowCustomization,
        customizationOptions: {
          defaultPrice: parseFloat(formCustomizationPrice) || 150,
        },
        isActive: formIsActive,
        images: formattedImages,
        sizes: enabledSizes,
        adminName: 'Alex Mercer (Catalog Lead)',
      });
    } else {
      // Create new
      storeService.createProduct({
        title: formTitle,
        subtitle: formSubtitle,
        description: formDescription,
        clubId: matchedClub?.id,
        clubName: formClub,
        season: formSeason,
        categoryId: formCategory,
        categoryName: matchedCategory?.name,
        kitType: formKitType,
        jerseyType: formJerseyType,
        costPrice: buyingPrice,
        basePrice: sellingPrice,
        comparePrice: compPrice,
        material: formMaterial,
        allowCustomization: formAllowCustomization,
        customizationOptions: {
          defaultPrice: parseFloat(formCustomizationPrice) || 150,
        },
        isActive: formIsActive,
        images: formattedImages,
        sizes: enabledSizes,
        adminName: 'Alex Mercer (Catalog Lead)',
      });
    }

    setProducts([...storeService.getProducts()]);
    setIsModalOpen(false);
  };

  return (
    <AdminLayout
      title="Product Management"
      subtitle="Complete catalog control: pricing, active status, size-aware variants, and stock valuation."
      actions={
        <Button
          variant="gold"
          size="sm"
          onClick={handleOpenCreateModal}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          id="btn-add-product"
        >
          Create Product
        </Button>
      }
    >
      <div className="space-y-6 text-left">
        {/* KPI / Stock Valuation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#12151c] p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Products</span>
              <Boxes className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">{catalogStats.activeCount}</span>
              <span className="text-xs text-neutral-400 font-mono">/ {products.length} Total</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              {catalogStats.inactiveCount} inactive / archived
            </p>
          </div>

          <div className="bg-[#12151c] p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Available Stock</span>
              <Boxes className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {catalogStats.totalPieces.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-400 font-mono">Pieces</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">Across all sizes and clubs</p>
          </div>

          {/* Current Stock Value (Buying Cost) */}
          <div className="bg-[#12151c] p-4 rounded-xl border border-amber-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Current Stock Cost</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {formatCurrency(catalogStats.totalStockCost)}
              </span>
            </div>
            <p className="text-[11px] text-amber-300/80 mt-1">
              Calculated as Available × Buying Price (Cost)
            </p>
          </div>

          {/* Potential Sales Value */}
          <div className="bg-[#12151c] p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Potential Sales Value</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-300 font-mono">
                {formatCurrency(catalogStats.potentialSalesVal)}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Available × Selling Price (Retail)
            </p>
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="bg-[#12151c] p-4 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[240px] max-w-md">
            <Input
              isSearch
              placeholder="Search product title, SKU, club, season..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              id="input-product-search"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-400"
              id="select-category-filter"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Club Filter */}
            <select
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-400"
              id="select-club-filter"
            >
              <option value="ALL">All Clubs</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-400"
              id="select-status-filter"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>

            <span className="text-xs text-neutral-400 font-mono pl-2">
              Showing {filteredProducts.length} of {products.length}
            </span>
          </div>
        </div>

        {/* PRODUCT LIST TABLE */}
        {/* Exact user requirements: Product, Category, Buying Price, Selling Price, Stock, Stock Value, Status */}
        <div className="bg-[#12151c] rounded-xl border border-neutral-800 overflow-hidden shadow-sm" id="table-product-list">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-900/90 text-neutral-400 uppercase tracking-wider text-[10px] font-semibold border-b border-neutral-800">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Buying Price</th>
                  <th className="py-3.5 px-4">Selling Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Stock Value</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-400">
                      <Boxes className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                      No products found matching the current search & filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const stockInfo = productStockMap.get(product.id);
                    const totalStock = stockInfo?.totalStock || 0;
                    const buyingPrice = product.costPrice || 500;
                    const sellingPrice = product.basePrice || 950;
                    // Stock Value uses buying price as strictly required
                    const stockValue = totalStock * buyingPrice;
                    const isActive = product.isActive !== false;

                    const primaryImg =
                      product.images?.find((img) => img.isPrimary)?.url ||
                      product.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800';

                    const categoryName =
                      categories.find((c) => c.id === product.categoryId)?.name ||
                      product.categoryName ||
                      'Match Kits';

                    return (
                      <tr key={product.id} className="hover:bg-neutral-800/40 transition-colors">
                        {/* 1. Product */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={primaryImg}
                              alt={product.title}
                              className="w-11 h-14 object-cover rounded bg-neutral-950 border border-neutral-800 shrink-0"
                            />
                            <div className="space-y-0.5">
                              <p className="font-bold text-white leading-tight hover:text-amber-400 transition-colors">
                                {product.title}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                                <span className="text-amber-400 font-semibold">{product.sku}</span>
                                <span>•</span>
                                <span>{product.clubName || 'Valkyrie FC'}</span>
                                <span>•</span>
                                <span>{product.season || '2024/25'}</span>
                              </div>
                              <p className="text-[10px] text-neutral-400 line-clamp-1">
                                {product.jerseyType || 'Player Version'} • {product.kitType || 'Home'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. Category */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded bg-neutral-800 text-neutral-200 border border-neutral-700/60 font-medium">
                            {categoryName}
                          </span>
                        </td>

                        {/* 3. Buying Price */}
                        <td className="py-3 px-4 font-mono font-medium text-neutral-300">
                          {formatCurrency(buyingPrice)}
                        </td>

                        {/* 4. Selling Price */}
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          <div>{formatCurrency(sellingPrice)}</div>
                          {product.comparePrice && (
                            <span className="text-[10px] text-neutral-400 line-through">
                              {formatCurrency(product.comparePrice)}
                            </span>
                          )}
                        </td>

                        {/* 5. Stock */}
                        <td className="py-3 px-4">
                          <div className="space-y-1 font-mono">
                            <span
                              className={`text-sm font-bold ${
                                totalStock === 0
                                  ? 'text-rose-400'
                                  : totalStock <= 15
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {totalStock} pcs
                            </span>
                            {/* Breakdown of sizes */}
                            <div className="flex flex-wrap gap-1 text-[10px] text-neutral-400">
                              {Object.entries(stockInfo?.sizeCounts || {}).map(([sz, count]) => (
                                <span
                                  key={sz}
                                  className={`px-1 rounded bg-neutral-900 border border-neutral-800 ${
                                    count === 0 ? 'text-neutral-600' : ''
                                  }`}
                                >
                                  {sz}:{count}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* 6. Stock Value (Buying Cost * Stock) */}
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-amber-300">
                            {formatCurrency(stockValue)}
                          </div>
                          <span className="text-[10px] text-neutral-400">
                            {totalStock} × {formatCurrency(buyingPrice)}
                          </span>
                        </td>

                        {/* 7. Status (Active / Inactive) */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleActive(product.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                              isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700/50'
                            }`}
                            title="Click to toggle Active / Inactive"
                            id={`btn-toggle-active-${product.id}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? 'bg-emerald-400' : 'bg-neutral-500'
                              }`}
                            />
                            {isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* 8. Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              className="p-1.5 text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 rounded-lg border border-neutral-700/60 transition-colors"
                              title="Edit product parameters & sizes"
                              id={`btn-edit-product-${product.id}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={`/product/${product.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-neutral-400 hover:text-neutral-200 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg transition-colors"
                              title="View in storefront"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRODUCT MANAGEMENT MODAL (CREATE / EDIT PRODUCT)                          */}
        {/* Covers: create, edit, activate/deactivate, upload images, description,    */}
        {/* club, season, category, jersey type, buying price, selling price, sizes,  */}
        {/* size chart, material, enable/disable customization                        */}
        {/* ========================================================================= */}
        <Dialog
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProductId ? 'Edit Product & Size-Aware Inventory' : 'Create New Football Kit'}
          size="xl"
        >
          <form onSubmit={handleSubmitProduct} className="space-y-6 text-left" id="form-product-management">
            {/* Top Bar: Title & Active Status Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-neutral-900/60 rounded-xl border border-neutral-800">
              <div>
                <h4 className="text-sm font-bold text-white">Product Status</h4>
                <p className="text-xs text-neutral-400">
                  Active products are immediately available in the public storefront.
                </p>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded bg-neutral-950 border-neutral-700 focus:ring-amber-400"
                  id="checkbox-form-is-active"
                />
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    formIsActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  {formIsActive ? 'Active' : 'Inactive'}
                </span>
              </label>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-neutral-800 pb-2">
                1. General Product Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Product Title"
                  placeholder="e.g. Valkyrie FC 2024/25 Champions Edition Kit"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  id="input-form-title"
                />
                <Input
                  label="Subtitle / Edition Tagline"
                  placeholder="e.g. Official Match-Grade Player Jersey"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  id="input-form-subtitle"
                />
              </div>

              {/* Club, Season, Category, Jersey Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Select Club */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Partner Club</label>
                  <select
                    value={formClub}
                    onChange={(e) => setFormClub(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-amber-400"
                    id="select-form-club"
                  >
                    {clubs.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Season */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Season</label>
                  <select
                    value={formSeason}
                    onChange={(e) => setFormSeason(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-amber-400"
                    id="select-form-season"
                  >
                    {PRESET_SEASONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Category */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-amber-400"
                    id="select-form-category"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Jersey Type */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Jersey Type</label>
                  <select
                    value={formJerseyType}
                    onChange={(e) => setFormJerseyType(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-amber-400"
                    id="select-form-jersey-type"
                  >
                    {PRESET_JERSEY_TYPES.map((jt) => (
                      <option key={jt} value={jt}>
                        {jt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kit Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Kit Edition</label>
                  <select
                    value={formKitType}
                    onChange={(e) => setFormKitType(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-amber-400"
                    id="select-form-kit-type"
                  >
                    <option value="Home">Home Kit</option>
                    <option value="Away">Away Kit</option>
                    <option value="Third">Third Kit</option>
                    <option value="Special">Special Edition / Derby</option>
                    <option value="Retro">Retro Heritage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Technical Fabric & Material</label>
                  <select
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-amber-400"
                    id="select-form-material"
                  >
                    {PRESET_MATERIALS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Edit Description */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Product Description & Technical Narrative
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg p-3 outline-none focus:border-amber-400"
                  placeholder="Describe the fabric weave, fit, historical context, and badge finishing..."
                  id="textarea-form-description"
                />
              </div>
            </div>

            {/* PRICING & STOCK VALUATION SECTION */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-neutral-800 pb-2 flex items-center justify-between">
                <span>2. Pricing & Financial Margin</span>
                <span className="text-[11px] text-neutral-400 font-normal font-mono lowercase">
                  Stock valuation is strictly calculated from buying price
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Buying Price */}
                <div>
                  <label className="block text-xs font-medium text-amber-300 mb-1">
                    Buying Price (৳ BDT) *
                  </label>
                  <Input
                    type="number"
                    value={formCostPrice}
                    onChange={(e) => setFormCostPrice(e.target.value)}
                    placeholder="e.g. 500"
                    required
                    id="input-form-cost-price"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Cost per piece from manufacturer</p>
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-xs font-medium text-white mb-1">
                    Selling Price (৳ BDT) *
                  </label>
                  <Input
                    type="number"
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(e.target.value)}
                    placeholder="e.g. 950"
                    required
                    id="input-form-base-price"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Customer retail checkout price</p>
                </div>

                {/* Compare Price */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Compare-at MSRP Price (৳ BDT)
                  </label>
                  <Input
                    type="number"
                    value={formComparePrice}
                    onChange={(e) => setFormComparePrice(e.target.value)}
                    placeholder="e.g. 1200 (Optional)"
                    id="input-form-compare-price"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">Shown as strikethrough MSRP</p>
                </div>
              </div>

              {/* Real-Time Margin & Example Calculator */}
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">Projected Margin per Unit:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatCurrency((parseFloat(formBasePrice) || 0) - (parseFloat(formCostPrice) || 0))} (
                    {parseFloat(formBasePrice) > 0
                      ? Math.round(
                          (((parseFloat(formBasePrice) || 0) - (parseFloat(formCostPrice) || 0)) /
                            (parseFloat(formBasePrice) || 1)) *
                            100
                        )
                      : 0}
                    %)
                  </span>
                </div>
                <span className="text-neutral-400 font-mono text-[11px]">
                  Example: 10 pieces × {formatCurrency(parseFloat(formCostPrice) || 0)} ={' '}
                  <strong className="text-amber-300 font-bold">
                    Stock Cost {formatCurrency((parseFloat(formCostPrice) || 0) * 10)}
                  </strong>
                </span>
              </div>
            </div>

            {/* UPLOAD IMAGES SECTION */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-neutral-800 pb-2">
                3. Product Photography & Gallery
              </h4>

              <div className="flex gap-2">
                <Input
                  placeholder="Paste direct HTTPS image link (Unsplash, CDN, or Cloud Storage)..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  id="input-form-image-url"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddImage}
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                  id="btn-add-image-url"
                >
                  Add Image
                </Button>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {formImages.map((url, idx) => (
                  <div
                    key={idx}
                    className={`relative group rounded-lg overflow-hidden border bg-neutral-900 aspect-[3/4] flex flex-col ${
                      idx === 0 ? 'border-amber-400 ring-1 ring-amber-400/40' : 'border-neutral-800'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-neutral-950 uppercase tracking-wider">
                        Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-neutral-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="w-full py-1 text-[10px] rounded bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="w-full py-1 text-[10px] rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SIZES & SIZE-AWARE INVENTORY SECTION */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-neutral-800 pb-2 flex items-center justify-between">
                <span>4. Size Management & Initial Stock</span>
                <span className="text-[11px] text-neutral-400 font-mono font-normal">
                  Size-aware stock bucket initialization
                </span>
              </h4>

              <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="grid grid-cols-12 gap-2 text-[11px] text-neutral-400 uppercase font-semibold pb-1 border-b border-neutral-800">
                  <div className="col-span-3">Size</div>
                  <div className="col-span-4">Active in Catalog</div>
                  <div className="col-span-5">Initial Stock (Pieces)</div>
                </div>

                {sizeRows.map((row, idx) => (
                  <div
                    key={row.size}
                    className={`grid grid-cols-12 gap-2 items-center py-2 px-2 rounded-lg transition-colors ${
                      row.enabled ? 'bg-neutral-800/40' : 'opacity-50'
                    }`}
                  >
                    <div className="col-span-3 font-mono font-bold text-white flex items-center gap-2">
                      <span className="w-7 h-7 rounded bg-neutral-950 border border-neutral-700 flex items-center justify-center text-xs">
                        {row.size}
                      </span>
                      <span className="text-xs text-neutral-400 font-normal">
                        {row.size === 'M' ? 'Medium (Standard)' : row.size}
                      </span>
                    </div>

                    <div className="col-span-4">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                        <input
                          type="checkbox"
                          checked={row.enabled}
                          onChange={(e) => {
                            const updated = [...sizeRows];
                            updated[idx].enabled = e.target.checked;
                            setSizeRows(updated);
                          }}
                          className="w-4 h-4 text-amber-500 rounded bg-neutral-950 border-neutral-700 focus:ring-amber-400"
                        />
                        <span>{row.enabled ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    </div>

                    <div className="col-span-5 flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        disabled={!row.enabled}
                        value={row.stock}
                        onChange={(e) => {
                          const updated = [...sizeRows];
                          updated[idx].stock = parseInt(e.target.value, 10) || 0;
                          setSizeRows(updated);
                        }}
                        className="w-24 bg-neutral-950 border border-neutral-700 text-white font-mono text-xs rounded-lg p-2 outline-none focus:border-amber-400 disabled:opacity-50"
                      />
                      <span className="text-xs text-neutral-400">pcs available</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CUSTOMIZATION & SIZE CHART MANAGEMENT */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-neutral-800 pb-2">
                5. Customization & Sizing Chart Fit
              </h4>

              {/* Enable/Disable Customization */}
              <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-white">Jersey Personalization (Name & Number)</h5>
                  <p className="text-xs text-neutral-400">
                    Allow customers to print official player names or custom names.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-200">
                    <input
                      type="checkbox"
                      checked={formAllowCustomization}
                      onChange={(e) => setFormAllowCustomization(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded bg-neutral-950 border-neutral-700 focus:ring-amber-400"
                      id="checkbox-form-customization"
                    />
                    <span>Enable Customization</span>
                  </label>
                  {formAllowCustomization && (
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-neutral-400">+৳</span>
                      <input
                        type="number"
                        value={formCustomizationPrice}
                        onChange={(e) => setFormCustomizationPrice(e.target.value)}
                        className="w-20 bg-neutral-950 border border-neutral-700 text-white rounded p-1.5 text-xs outline-none"
                        placeholder="150"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Size Chart Note */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Size Guide Fit Recommendation
                </label>
                <input
                  type="text"
                  value={sizeChartNotes}
                  onChange={(e) => setSizeChartNotes(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-amber-400"
                  placeholder="e.g. Tailored match fit. Size up for regular comfort."
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" id="btn-submit-product">
                {editingProductId ? 'Save Product Changes' : 'Publish Product to Catalog'}
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AdminLayout>
  );
};
