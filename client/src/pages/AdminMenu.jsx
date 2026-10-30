import { useEffect, useRef, useState } from 'react';
import Modal from 'bootstrap/js/dist/modal';
import usePage from '../hooks/usePage';
import usePolling from '../hooks/usePolling';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/adminmenu.css';

const categoryEmoji = { Meals: '🍛', Snacks: '🍟', Drinks: '🧃', Desserts: '🍰' };
const CATEGORY_OPTIONS = ['Meals', 'Snacks', 'Drinks', 'Desserts'];
const mutedStyle = { color: 'var(--muted)' };

export default function AdminMenu() {
  usePage('pg-adminmenu', 'Canteen admin — manage menu');

  // status: 'loading' | 'ready' | 'error'
  const [menu, setMenu] = useState({ status: 'loading', items: [] });

  // Add modal
  const [addForm, setAddForm] = useState({ name: '', category: 'Meals', price: '', desc: '' });
  const addImageRef = useRef(null);
  const addModalEl = useRef(null);
  const addModal = useRef(null);

  // Edit modal
  const [editForm, setEditForm] = useState({ id: '', name: '', category: 'Meals', price: '', desc: '' });
  const editImageRef = useRef(null);
  const editModalEl = useRef(null);
  const editModal = useRef(null);

  useEffect(() => {
    addModal.current = new Modal(addModalEl.current);
    editModal.current = new Modal(editModalEl.current);
    return () => {
      addModal.current.dispose();
      editModal.current.dispose();
    };
  }, []);

  async function loadMenu() {
    try {
      const res = await fetch('/api/menu/all');
      if (!res.ok) throw new Error('Server error');
      const items = await res.json();
      setMenu({ status: 'ready', items });
    } catch (err) {
      console.error(err);
      setMenu({ status: 'error', items: [] });
    }
  }

  usePolling(loadMenu, 0);

  async function toggleAvailability(item, checked) {
    setMenu((m) => ({ ...m, items: m.items.map((i) => (i.item_id === item.item_id ? { ...i, is_available: checked } : i)) }));
    await fetch(`/api/menu/${item.item_id}/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_available: checked })
    });
  }

  function openEdit(item) {
    setEditForm({
      id: item.item_id,
      name: item.item_name,
      category: item.category,
      price: item.price,
      desc: item.description || ''
    });
    if (editImageRef.current) editImageRef.current.value = '';
    editModal.current.show();
  }

  async function deleteItem(item) {
    if (!window.confirm('Remove this item from the menu?')) return;
    await fetch(`/api/menu/${item.item_id}`, { method: 'DELETE' });
    loadMenu();
  }

  async function addItem() {
    const { name, category, price, desc } = addForm;
    const imageFile = addImageRef.current.files[0];

    if (!name || !price) {
      alert('Item name and price are required.');
      return;
    }

    const formData = new FormData();
    formData.append('item_name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('description', desc);
    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        body: formData // walang Content-Type header — awtomatikong itatakda ng browser (multipart/form-data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Could not save the item.');
      }
      addModal.current.hide();
      setAddForm((f) => ({ ...f, name: '', price: '', desc: '' }));
      addImageRef.current.value = '';
      loadMenu();
    } catch (err) {
      alert(err.message || 'Could not save the item.');
    }
  }

  async function updateItem() {
    const { id, name, category, price, desc } = editForm;
    const imageFile = editImageRef.current.files[0];

    if (!name || !price) {
      alert('Item name and price are required.');
      return;
    }

    const formData = new FormData();
    formData.append('item_name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('description', desc);
    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'PUT',
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Could not update the item.');
      }
      editModal.current.hide();
      loadMenu();
    } catch (err) {
      alert(err.message || 'Could not update the item.');
    }
  }

  let rows;
  if (menu.status === 'loading') {
    rows = <tr><td colSpan="5" className="text-center py-4" style={mutedStyle}>Loading menu...</td></tr>;
  } else if (menu.status === 'error') {
    rows = <tr><td colSpan="5" className="text-center py-4" style={mutedStyle}>Could not load the menu. Make sure the server is running.</td></tr>;
  } else if (menu.items.length === 0) {
    rows = <tr><td colSpan="5" className="text-center py-4" style={mutedStyle}>No menu items yet. Add one using "+ Add item".</td></tr>;
  } else {
    rows = menu.items.map((item) => (
      <tr key={item.item_id} data-id={item.item_id}>
        <td>
          {item.image_url ? (
            <img src={item.image_url} alt="" className="item-thumb me-2" style={{ objectFit: 'cover' }} />
          ) : (
            <span className="item-thumb me-2">{categoryEmoji[item.category] || '🍽️'}</span>
          )}
          {item.item_name}
        </td>
        <td><span className="badge cat-pill">{item.category}</span></td>
        <td>{`₱${item.price}`}</td>
        <td>
          <div className="form-check form-switch">
            <input
              className="form-check-input avail-toggle"
              type="checkbox"
              checked={!!item.is_available}
              onChange={(e) => toggleAvailability(item, e.target.checked)}
            />
          </div>
        </td>
        <td>
          <button className="btn btn-sm btn-outline-secondary edit-btn me-1" onClick={() => openEdit(item)}>Edit</button>{' '}
          <button className="btn btn-sm btn-outline-teal delete-btn" onClick={() => deleteItem(item)}>Delete</button>
        </td>
      </tr>
    ));
  }

  return (
    <>
      <div className="d-flex">
        <AdminSidebar active="menu" logoutTo="/admin/login" />

        <div className="flex-grow-1 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="font-display mb-0">Manage menu</h2>
            <button className="btn btn-teal" onClick={() => addModal.current.show()}>+ Add item</button>
          </div>

          <div className="card-dark p-3">
            <table className="table table-dark-custom mb-0">
              <thead>
                <tr><th>Item</th><th>Category</th><th>Price</th><th>Available</th><th></th></tr>
              </thead>
              <tbody id="menuTableBody">{rows}</tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Add item modal ── */}
      <div className="modal fade" id="addModal" tabIndex="-1" ref={addModalEl}>
        <div className="modal-dialog">
          <div className="modal-content modal-content-dark">
            <div className="modal-header" style={{ borderColor: 'var(--border)' }}>
              <h5 className="modal-title font-display">Add menu item</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="itemName" className="form-label form-label-dark">Item name</label>
                <input id="itemName" type="text" className="form-control form-control-dark" placeholder="e.g. Pork Sisig Meal"
                  value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
              </div>
              <div className="mb-3">
                <label htmlFor="itemCat" className="form-label form-label-dark">Category</label>
                <select id="itemCat" className="form-select form-select-dark"
                  value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}>
                  {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="itemPrice" className="form-label form-label-dark">Price (₱)</label>
                <input id="itemPrice" type="number" className="form-control form-control-dark" placeholder="e.g. 65"
                  value={addForm.price} onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} />
              </div>
              <div className="mb-2">
                <label htmlFor="itemDesc" className="form-label form-label-dark">Description (optional)</label>
                <input id="itemDesc" type="text" className="form-control form-control-dark" placeholder="Short description"
                  value={addForm.desc} onChange={(e) => setAddForm({ ...addForm, desc: e.target.value })} />
              </div>
              <div className="mb-2">
                <label htmlFor="itemImage" className="form-label form-label-dark">Photo (optional)</label>
                <input id="itemImage" type="file" accept="image/*" className="form-control form-control-dark" ref={addImageRef} />
              </div>
            </div>
            <div className="modal-footer" style={{ borderColor: 'var(--border)' }}>
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-teal" id="saveItemBtn" onClick={addItem}>Save item</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit item modal ── */}
      <div className="modal fade" id="editModal" tabIndex="-1" ref={editModalEl}>
        <div className="modal-dialog">
          <div className="modal-content modal-content-dark">
            <div className="modal-header" style={{ borderColor: 'var(--border)' }}>
              <h5 className="modal-title font-display">Edit menu item</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <input type="hidden" id="editItemId" value={editForm.id} readOnly />
              <div className="mb-3">
                <label htmlFor="editItemName" className="form-label form-label-dark">Item name</label>
                <input id="editItemName" type="text" className="form-control form-control-dark"
                  value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="mb-3">
                <label htmlFor="editItemCat" className="form-label form-label-dark">Category</label>
                <select id="editItemCat" className="form-select form-select-dark"
                  value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                  {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="editItemPrice" className="form-label form-label-dark">Price (₱)</label>
                <input id="editItemPrice" type="number" className="form-control form-control-dark"
                  value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
              </div>
              <div className="mb-2">
                <label htmlFor="editItemDesc" className="form-label form-label-dark">Description (optional)</label>
                <input id="editItemDesc" type="text" className="form-control form-control-dark"
                  value={editForm.desc} onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })} />
              </div>
              <div className="mb-2">
                <label htmlFor="editItemImage" className="form-label form-label-dark">Replace photo (optional)</label>
                <input id="editItemImage" type="file" accept="image/*" className="form-control form-control-dark" ref={editImageRef} />
                <div className="form-text" style={mutedStyle}>Iwan lang blangko kung ayaw mo palitan ang kasalukuyang larawan.</div>
              </div>
            </div>
            <div className="modal-footer" style={{ borderColor: 'var(--border)' }}>
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-teal" id="updateItemBtn" onClick={updateItem}>Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
