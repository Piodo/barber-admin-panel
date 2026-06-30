import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc
} from 'firebase/firestore';

const dashboardContainerStyle = {
  backgroundColor: '#1C1D1D',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Arial, sans-serif',
  color: 'white',
};

const headerStyle = {
  backgroundColor: '#000',
  padding: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #333',
};

const logoutButtonStyle = {
  backgroundColor: '#BD9245',
  color: 'black',
  border: 'none',
  padding: '8px 15px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const navStyle = {
  backgroundColor: '#222',
  padding: '10px 20px',
  display: 'flex',
  gap: '10px',
  overflowX: 'auto',
  borderBottom: '1px solid #333',
};

const tabButtonStyle = (isActive) => ({
  backgroundColor: isActive ? '#BD9245' : 'transparent',
  color: isActive ? 'black' : 'white',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '4px',
  cursor: 'pointer',
  minWidth: '100px',
  flexShrink: '0',
});

const mainContentStyle = {
  flex: '1',
  padding: '20px',
  overflowY: 'auto',
};

const sectionStyle = {
  backgroundColor: '#2C2C2C',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
};

const sectionTitleStyle = {
  color: '#BD9245',
  borderBottom: '1px solid #555',
  paddingBottom: '10px',
  marginBottom: '15px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const buttonStyle = {
  backgroundColor: '#BD9245',
  color: 'black',
  border: 'none',
  padding: '8px 15px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginRight: '10px',
};

const dangerButtonStyle = {
  backgroundColor: '#dc3545',
  color: 'white',
  border: 'none',
  padding: '8px 15px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const formStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '15px',
  marginBottom: '20px',
  backgroundColor: '#333',
  padding: '20px',
  borderRadius: '8px',
};

const inputStyle = {
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #555',
  backgroundColor: '#444',
  color: 'white',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: '#333',
  borderRadius: '8px',
  overflow: 'hidden',
};

const thStyle = {
  backgroundColor: '#BD9245',
  color: 'black',
  padding: '12px',
  textAlign: 'left',
  fontWeight: 'bold',
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid #555',
  color: 'white',
};

const modalStyle = {
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundColor: 'rgba(0,0,0,0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: '#2C2C2C',
  padding: '30px',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '500px',
  color: 'white',
};

const notificationStyle = (type) => ({
  position: 'fixed',
  top: '20px',
  right: '20px',
  padding: '15px 20px',
  borderRadius: '4px',
  color: 'white',
  backgroundColor: type === 'error' ? '#dc3545' : '#28a745',
  zIndex: 1001,
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
});

const lowStockBadgeStyle = {
  backgroundColor: '#dc3545',
  color: 'white',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
  marginLeft: '10px',
};

// --- Helper Components ---
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={notificationStyle(type)}>
      {message}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, color: '#BD9245' }}>{title}</h3>
        {children}
        <button onClick={onClose} style={{ ...buttonStyle, marginTop: '20px' }}>
          Close
        </button>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [barbers, setBarbers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);

  // Form states
  const [showBarberForm, setShowBarberForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [editingInventory, setEditingInventory] = useState(null);

  // Form data
  const [barberForm, setBarberForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    status: 'active'
  });

  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    category: '',
    quantity: '',
    minStock: '',
    price: '',
    supplier: ''
  });

  // Add this helper function to fix the date issue
  const getAppointmentDate = (appointment) => {
    if (typeof appointment.date === 'string') {
      return new Date(appointment.date);
    } else if (appointment.date && typeof appointment.date.toDate === 'function') {
      return appointment.date.toDate();
    } else {
      return new Date(); // fallback
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch Barbers
        const barbersCol = collection(db, 'barbers');
        const barbersSnapshot = await getDocs(barbersCol);
        const barbersList = barbersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBarbers(barbersList);

        // Fetch Inventory
        const inventoryCol = collection(db, 'inventory');
        const inventorySnapshot = await getDocs(inventoryCol);
        const inventoryList = inventorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInventory(inventoryList);

        // Fetch Appointments
        const appointmentsCol = collection(db, 'appointments');
        const appointmentsSnapshot = await getDocs(appointmentsCol);
        const appointmentsList = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAppointments(appointmentsList);

        setError(null);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Failed to load data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Monitor low stock items
  useEffect(() => {
    const lowStock = inventory.filter(item => 
      parseInt(item.quantity) <= parseInt(item.minStock || 5)
    );
    setLowStockItems(lowStock);
  }, [inventory]);

  // CRUD Operations for Barbers
  const handleBarberSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBarber) {
        await updateDoc(doc(db, 'barbers', editingBarber.id), barberForm);
        setBarbers(barbers.map(b => b.id === editingBarber.id ? { ...b, ...barberForm } : b));
        showNotification('Barber updated successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'barbers'), barberForm);
        setBarbers([...barbers, { id: docRef.id, ...barberForm }]);
        showNotification('Barber added successfully!');
      }
      
      setBarberForm({ name: '', email: '', phone: '', specialization: '', status: 'active' });
      setShowBarberForm(false);
      setEditingBarber(null);
    } catch (err) {
      showNotification('Error saving barber: ' + err.message, 'error');
    }
  };

  const handleBarberDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this barber?')) {
      try {
        await deleteDoc(doc(db, 'barbers', id));
        setBarbers(barbers.filter(b => b.id !== id));
        showNotification('Barber deleted successfully!');
      } catch (err) {
        showNotification('Error deleting barber: ' + err.message, 'error');
      }
    }
  };

  const handleBarberEdit = (barber) => {
    setEditingBarber(barber);
    setBarberForm({
      name: barber.name,
      email: barber.email,
      phone: barber.phone || '',
      specialization: barber.specialization || '',
      status: barber.status || 'active'
    });
    setShowBarberForm(true);
  };

  // CRUD Operations for Inventory
  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    try {
      const inventoryData = {
        ...inventoryForm,
        quantity: parseInt(inventoryForm.quantity),
        minStock: parseInt(inventoryForm.minStock),
        price: parseFloat(inventoryForm.price)
      };

      if (editingInventory) {
        await updateDoc(doc(db, 'inventory', editingInventory.id), inventoryData);
        setInventory(inventory.map(i => i.id === editingInventory.id ? { ...i, ...inventoryData } : i));
        showNotification('Inventory item updated successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'inventory'), inventoryData);
        setInventory([...inventory, { id: docRef.id, ...inventoryData }]);
        showNotification('Inventory item added successfully!');
      }
      
      setInventoryForm({ name: '', category: '', quantity: '', minStock: '', price: '', supplier: '' });
      setShowInventoryForm(false);
      setEditingInventory(null);
    } catch (err) {
      showNotification('Error saving inventory item: ' + err.message, 'error');
    }
  };

  const handleInventoryDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await deleteDoc(doc(db, 'inventory', id));
        setInventory(inventory.filter(i => i.id !== id));
        showNotification('Inventory item deleted successfully!');
      } catch (err) {
        showNotification('Error deleting inventory item: ' + err.message, 'error');
      }
    }
  };

  const handleInventoryEdit = (item) => {
    setEditingInventory(item);
    setInventoryForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      minStock: item.minStock.toString(),
      price: item.price.toString(),
      supplier: item.supplier || ''
    });
    setShowInventoryForm(true);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '100px', color: 'white' }}>Loading...</div>;
  }

  return (
    <div style={dashboardContainerStyle}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ color: '#BD9245', margin: '0', marginRight: '20px' }}>Admin Panel</h1>
          {lowStockItems.length > 0 && (
            <div style={lowStockBadgeStyle}>
              {lowStockItems.length} Low Stock Alert{lowStockItems.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <button onClick={onLogout} style={logoutButtonStyle}>Logout</button>
      </header>

      <nav style={navStyle}>
        <button style={tabButtonStyle(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button style={tabButtonStyle(activeTab === 'barbers')} onClick={() => setActiveTab('barbers')}>Barbers</button>
        <button style={tabButtonStyle(activeTab === 'appointments')} onClick={() => setActiveTab('appointments')}>Appointments</button>
        <button style={tabButtonStyle(activeTab === 'inventory')} onClick={() => setActiveTab('inventory')}>Inventory</button>
        <button style={tabButtonStyle(activeTab === 'pos')} onClick={() => setActiveTab('pos')}>POS</button>
      </nav>

      <main style={mainContentStyle}>
        {error && <p style={{ textAlign: 'center', color: 'red' }}>Error: {error}</p>}

        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ color: '#BD9245', marginBottom: '20px' }}>Dashboard Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={sectionStyle}>
                <h3 style={{ color: '#BD9245', margin: '0 0 10px 0' }}>Total Barbers</h3>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{barbers.length}</div>
              </div>
              <div style={sectionStyle}>
                <h3 style={{ color: '#BD9245', margin: '0 0 10px 0' }}>Total Appointments</h3>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{appointments.length}</div>
              </div>
              <div style={sectionStyle}>
                <h3 style={{ color: '#BD9245', margin: '0 0 10px 0' }}>Inventory Items</h3>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{inventory.length}</div>
              </div>
              <div style={sectionStyle}>
                <h3 style={{ color: '#BD9245', margin: '0 0 10px 0' }}>Low Stock Items</h3>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: lowStockItems.length > 0 ? '#dc3545' : 'white' }}>
                  {lowStockItems.length}
                </div>
              </div>
            </div>

            {lowStockItems.length > 0 && (
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>⚠️ Low Stock Alerts</h3>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Item Name</th>
                      <th style={thStyle}>Current Stock</th>
                      <th style={thStyle}>Min Stock</th>
                      <th style={thStyle}>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map(item => (
                      <tr key={item.id}>
                        <td style={tdStyle}>{item.name}</td>
                        <td style={{ ...tdStyle, color: '#dc3545', fontWeight: 'bold' }}>{item.quantity}</td>
                        <td style={tdStyle}>{item.minStock}</td>
                        <td style={tdStyle}>{item.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'barbers' && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>
              Barbers Management
              <button 
                onClick={() => setShowBarberForm(true)} 
                style={buttonStyle}
              >
                Add New Barber
              </button>
            </h3>
            
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Specialization</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {barbers.map(barber => (
                  <tr key={barber.id}>
                    <td style={tdStyle}>{barber.name}</td>
                    <td style={tdStyle}>{barber.email}</td>
                    <td style={tdStyle}>{barber.phone || 'N/A'}</td>
                    <td style={tdStyle}>{barber.specialization || 'General'}</td>
                    <td style={tdStyle}>
                      <span style={{
                        backgroundColor: barber.status === 'active' ? '#28a745' : '#dc3545',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {barber.status || 'active'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button 
                        onClick={() => handleBarberEdit(barber)}
                        style={{ ...buttonStyle, marginRight: '8px' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleBarberDelete(barber.id)}
                        style={dangerButtonStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>
              Inventory Management
              <button 
                onClick={() => setShowInventoryForm(true)} 
                style={buttonStyle}
              >
                Add New Item
              </button>
            </h3>
            
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Quantity</th>
                  <th style={thStyle}>Min Stock</th>
                  <th style={thStyle}>Price</th>
                  <th style={thStyle}>Supplier</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{item.name}</td>
                    <td style={tdStyle}>{item.category}</td>
                    <td style={{
                      ...tdStyle,
                      color: item.quantity <= item.minStock ? '#dc3545' : 'white',
                      fontWeight: item.quantity <= item.minStock ? 'bold' : 'normal'
                    }}>
                      {item.quantity}
                    </td>
                    <td style={tdStyle}>{item.minStock}</td>
                    <td style={tdStyle}>${item.price?.toFixed(2)}</td>
                    <td style={tdStyle}>{item.supplier || 'N/A'}</td>
                    <td style={tdStyle}>
                      <span style={{
                        backgroundColor: item.quantity <= item.minStock ? '#dc3545' : '#28a745',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {item.quantity <= item.minStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button 
                        onClick={() => handleInventoryEdit(item)}
                        style={{ ...buttonStyle, marginRight: '8px' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleInventoryDelete(item.id)}
                        style={dangerButtonStyle}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Appointments</h3>
            {appointments.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Customer</th>
                    <th style={thStyle}>Barber</th>
                    <th style={thStyle}>Service</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Time</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(app => (
                    <tr key={app.id}>
                      <td style={tdStyle}>{app.fullName || app.customerName || 'N/A'}</td>
                      <td style={tdStyle}>{app.barberName || 'N/A'}</td>
                      <td style={tdStyle}>{app.service}</td>
                      <td style={tdStyle}>{app.date ? getAppointmentDate(app).toLocaleDateString() : 'N/A'}</td>
                      <td style={tdStyle}>{app.time}</td>
                      <td style={tdStyle}>
                        <span style={{
                          backgroundColor: app.status === 'confirmed' ? '#28a745' : 
                                         app.status === 'pending' ? '#ffc107' : '#dc3545',
                          color: app.status === 'pending' ? 'black' : 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#aaa' }}>No appointments found.</p>
            )}
          </div>
        )}

        {activeTab === 'pos' && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Point of Sale</h3>
            <p style={{ color: '#aaa' }}>POS system coming soon...</p>
          </div>
        )}
      </main>

      {/* Barber Form Modal */}
      <Modal
        isOpen={showBarberForm}
        onClose={() => {
          setShowBarberForm(false);
          setEditingBarber(null);
          setBarberForm({ name: '', email: '', phone: '', specialization: '', status: 'active' });
        }}
        title={editingBarber ? 'Edit Barber' : 'Add New Barber'}
      >
        <form onSubmit={handleBarberSubmit}>
          <div style={formStyle}>
            <input
              type="text"
              placeholder="Name"
              value={barberForm.name}
              onChange={(e) => setBarberForm({ ...barberForm, name: e.target.value })}
              style={inputStyle}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={barberForm.email}
              onChange={(e) => setBarberForm({ ...barberForm, email: e.target.value })}
              style={inputStyle}
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={barberForm.phone}
              onChange={(e) => setBarberForm({ ...barberForm, phone: e.target.value })}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Specialization"
              value={barberForm.specialization}
              onChange={(e) => setBarberForm({ ...barberForm, specialization: e.target.value })}
              style={inputStyle}
            />
            <select
              value={barberForm.status}
              onChange={(e) => setBarberForm({ ...barberForm, status: e.target.value })}
              style={inputStyle}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button type="submit" style={buttonStyle}>
            {editingBarber ? 'Update Barber' : 'Add Barber'}
          </button>
        </form>
      </Modal>

      {/* Inventory Form Modal */}
      <Modal
        isOpen={showInventoryForm}
        onClose={() => {
          setShowInventoryForm(false);
          setEditingInventory(null);
          setInventoryForm({ name: '', category: '', quantity: '', minStock: '', price: '', supplier: '' });
        }}
        title={editingInventory ? 'Edit Inventory Item' : 'Add New Inventory Item'}
      >
        <form onSubmit={handleInventorySubmit}>
          <div style={formStyle}>
            <input
              type="text"
              placeholder="Item Name"
              value={inventoryForm.name}
              onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
              style={inputStyle}
              required
            />
            <select
              value={inventoryForm.category}
              onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value })}
              style={inputStyle}
              required
            >
              <option value="">Select Category</option>
              <option value="Hair Products">Hair Products</option>
              <option value="Tools">Tools</option>
              <option value="Supplies">Supplies</option>
              <option value="Equipment">Equipment</option>
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={inventoryForm.quantity}
              onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
              style={inputStyle}
              required
            />
            <input
              type="number"
              placeholder="Minimum Stock Level"
              value={inventoryForm.minStock}
              onChange={(e) => setInventoryForm({ ...inventoryForm, minStock: e.target.value })}
              style={inputStyle}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={inventoryForm.price}
              onChange={(e) => setInventoryForm({ ...inventoryForm, price: e.target.value })}
              style={inputStyle}
              required
            />
            <input
              type="text"
              placeholder="Supplier"
              value={inventoryForm.supplier}
              onChange={(e) => setInventoryForm({ ...inventoryForm, supplier: e.target.value })}
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            {editingInventory ? 'Update Item' : 'Add Item'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;