import React, { useState } from 'react';
export default function ProductModal({ product, onClose, addToCart, openSizeGuide }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const sizes = ['XS','S','M','L','XL'];
  if (!product) return null;
  const image = product.img || product.image || '';
  const handleAdd = () => { addToCart(product.id, selectedSize); onClose(); };
  return <div className="product-modal-overlay open" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="product-modal">
      <div className="product-modal-img"><img src={image} alt={product.name} /><button className="product-modal-close" onClick={onClose}>✕</button></div>
      <div className="product-modal-info"><div className="product-cat">{product.cat || product.category}</div><h2>{product.name}</h2><div className="modal-price">${product.price}</div><p className="modal-desc">{product.desc || product.description}</p>
      <div className="size-label">Select Size</div><div className="size-options">{sizes.map(sz => <button key={sz} className={`size-opt ${selectedSize === sz ? 'selected' : ''}`} onClick={() => setSelectedSize(sz)}>{sz}</button>)}</div>
      <button className="modal-size-guide" onClick={openSizeGuide}>View Size Guide →</button><div className="modal-actions" style={{marginTop:'22px'}}><button className="btn-primary" style={{width:'100%',textAlign:'center',padding:'16px'}} onClick={handleAdd}>Add to Bag</button></div></div>
    </div></div>;
}
