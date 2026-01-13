import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

// STYLES DEFINITION
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
  position: 'relative',
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
  maxHeight: '80vh',
  overflowY: 'auto',
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
  padding: '8px 15px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: 'bold',
  marginLeft: '15px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  animation: 'pulse 2s infinite',
};

// New style for persistent alert banner
const alertBannerStyle = {
  backgroundColor: '#dc3545',
  color: 'white',
  padding: '15px 20px',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '16px',
  position: 'sticky',
  top: '0',
  zIndex: 999,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
};

const closeAlertButtonStyle = {
  backgroundColor: 'transparent',
  color: 'white',
  border: '1px solid white',
  padding: '5px 10px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
};

// Add CSS animation for pulsing effect
const styles = `
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}
`;

// Helper Components
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
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);
  const [showLowStockModal, setShowLowStockModal] = useState(false);

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

  // Add CSS styles for animation
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const getAppointmentDate = (appointment) => {
    if (typeof appointment.date === 'string') {
      return new Date(appointment.date);
    } else if (appointment.date && typeof appointment.date.toDate === 'function') {
      return appointment.date.toDate();
    } else {
      return new Date();
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  // ✅ REAL-TIME FIREBASE SYNC
  useEffect(() => {
    setLoading(true);

    // Real-time Barbers
    const unsubscribeBarbers = onSnapshot(collection(db, 'barbers'), (snapshot) => {
      const barbersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBarbers(barbersList);
    });

    // Real-time Inventory
    const unsubscribeInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const inventoryList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventory(inventoryList);
    });

    // Real-time Appointments
    const unsubscribeAppointments = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      const appointmentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(appointmentsList);
    });

    // Real-time Payments
    const paymentsQuery = query(collection(db, 'payments'), orderBy('paymentDate', 'desc'));
    const unsubscribePayments = onSnapshot(paymentsQuery, (snapshot) => {
      const paymentsList = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        paymentDate: doc.data().paymentDate ? doc.data().paymentDate.toDate() : null
      }));
      setPayments(paymentsList);
    });

    setLoading(false);

    // Cleanup subscriptions
    return () => {
      unsubscribeBarbers();
      unsubscribeInventory();
      unsubscribeAppointments();
      unsubscribePayments();
    };
  }, []);

  // Monitor low stock items PERMANENTLY
  useEffect(() => {
    const checkLowStock = () => {
      const lowStock = inventory.filter(item => {
        const quantity = parseInt(item.quantity) || 0;
        const minStock = parseInt(item.minStock) || 5;
        return quantity <= minStock;
      });
      setLowStockItems(lowStock);
      setShowLowStockAlert(lowStock.length > 0);
    };

    checkLowStock();
  }, [inventory]);

  // Check for critical stock (0 or negative)
  const getCriticalStockItems = () => {
    return inventory.filter(item => {
      const quantity = parseInt(item.quantity) || 0;
      return quantity <= 0;
    });
  };

  // CRUD Operations for Barbers
  const handleBarberSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBarber) {
        await updateDoc(doc(db, 'barbers', editingBarber.id), barberForm);
        showNotification('Barber updated successfully!');
      } else {
        await addDoc(collection(db, 'barbers'), barberForm);
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
        price: parseFloat(inventoryForm.price),
        updatedAt: serverTimestamp()
      };

      if (editingInventory) {
        await updateDoc(doc(db, 'inventory', editingInventory.id), inventoryData);
        showNotification('Inventory item updated successfully!');
      } else {
        await addDoc(collection(db, 'inventory'), {
          ...inventoryData,
          createdAt: serverTimestamp()
        });
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

  // Restock function
  const handleRestock = async (itemId, additionalQuantity) => {
    try {
      const itemRef = doc(db, 'inventory', itemId);
      const item = inventory.find(i => i.id === itemId);
      
      if (!item) return;
      
      const newQuantity = parseInt(item.quantity) + parseInt(additionalQuantity);
      
      await updateDoc(itemRef, {
        quantity: newQuantity,
        updatedAt: serverTimestamp()
      });
      
      showNotification(`Restocked ${item.name} by ${additionalQuantity} units!`);
      
      // Close modal if all low stock items are resolved
      const updatedLowStock = lowStockItems.filter(i => i.id !== itemId);
      if (updatedLowStock.length === 0) {
        setShowLowStockAlert(false);
      }
    } catch (err) {
      showNotification('Error restocking item: ' + err.message, 'error');
    }
  };

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    
    if (date instanceof Date) {
      return date.toLocaleDateString();
    }
    
    return 'N/A';
  };

  // Get critical stock items
  const criticalStockItems = getCriticalStockItems();

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

      {/* PERMANENT LOW STOCK ALERT BANNER - Only disappears when stock is adequate */}
      {showLowStockAlert && (
        <div style={alertBannerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <span>
              {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} {lowStockItems.length > 1 ? 'are' : 'is'} running low on stock!
              {criticalStockItems.length > 0 && (
                <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>
                  ({criticalStockItems.length} item{criticalStockItems.length > 1 ? 's' : ''} out of stock!)
                </span>
              )}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setShowLowStockModal(true)}
              style={{ ...buttonStyle, backgroundColor: 'white', color: '#dc3545', margin: 0 }}
            >
              View Details
            </button>
            <button 
              onClick={() => setShowLowStockAlert(false)}
              style={closeAlertButtonStyle}
            >
              Hide Alert
            </button>
          </div>
        </div>
      )}

      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ color: '#BD9245', margin: '0', marginRight: '20px' }}>Admin Panel</h1>
          {/* Always visible low stock badge in header */}
          {lowStockItems.length > 0 && (
            <div 
              style={lowStockBadgeStyle}
              onClick={() => setShowLowStockModal(true)}
              title="Click to view low stock items"
            >
              <span>⚠️</span>
              <span>{lowStockItems.length} Low Stock</span>
            </div>
          )}
        </div>
        <button onClick={onLogout} style={logoutButtonStyle}>Logout</button>
      </header>

      <nav style={navStyle}>
        <button 
          style={tabButtonStyle(activeTab === 'dashboard')} 
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'barbers')} 
          onClick={() => setActiveTab('barbers')}
        >
          Barbers
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'appointments')} 
          onClick={() => setActiveTab('appointments')}
        >
          Appointments
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'inventory')} 
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button 
          style={tabButtonStyle(activeTab === 'pos')} 
          onClick={() => setActiveTab('pos')}
        >
          POS
        </button>
      </nav>

      <main style={mainContentStyle}>
        {error && <p style={{ textAlign: 'center', color: 'red' }}>Error: {error}</p>}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ color: '#BD9245', marginBottom: '20px' }}>Dashboard Overview</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px', 
              marginBottom: '30px' 
            }}>
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
                <h3 style={{ color: '#BD9245', margin: '0 0 10px 0' }}>Total Revenue</h3>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  ₱{payments.reduce((sum, payment) => sum + (payment.amount || 0), 0).toFixed(2)}
                </div>
              </div>
              <div style={sectionStyle}>
                <h3 style={{ color: '#BD9245', margin: '0 0 10px 0' }}>Low Stock Items</h3>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: lowStockItems.length > 0 ? '#dc3545' : '#28a745',
                  cursor: lowStockItems.length > 0 ? 'pointer' : 'default'
                }}
                onClick={() => lowStockItems.length > 0 && setShowLowStockModal(true)}>
                  {lowStockItems.length}
                </div>
              </div>
            </div>

            {/* Quick Restock Section */}
            {lowStockItems.length > 0 && (
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>
                  ⚠️ Immediate Attention Needed
                  <button 
                    onClick={() => setShowLowStockModal(true)}
                    style={{ ...buttonStyle, backgroundColor: '#dc3545', color: 'white' }}
                  >
                    Manage All Low Stock Items
                  </button>
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: '15px' 
                }}>
                  {lowStockItems.slice(0, 4).map(item => (
                    <div key={item.id} style={{
                      backgroundColor: '#333',
                      padding: '15px',
                      borderRadius: '8px',
                      borderLeft: `5px solid ${parseInt(item.quantity) <= 0 ? '#dc3545' : '#ffc107'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ color: '#BD9245', margin: '0 0 5px 0' }}>{item.name}</h4>
                        <p style={{ margin: '0', fontSize: '14px', color: '#aaa' }}>
                          Category: {item.category}
                        </p>
                        <p style={{ margin: '5px 0', fontSize: '14px', color: '#aaa' }}>
                          Current: <span style={{ 
                            color: parseInt(item.quantity) <= 0 ? '#dc3545' : '#ffc107',
                            fontWeight: 'bold'
                          }}>{item.quantity}</span> | Minimum: {item.minStock}
                        </p>
                      </div>
                      <button
                        onClick={() => handleInventoryEdit(item)}
                        style={{ ...buttonStyle, fontSize: '12px', padding: '6px 12px' }}
                      >
                        Restock
                      </button>
                    </div>
                  ))}
                </div>
                {lowStockItems.length > 4 && (
                  <p style={{ textAlign: 'center', marginTop: '15px', color: '#ffc107' }}>
                    ...and {lowStockItems.length - 4} more items need attention
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Other tabs remain the same as before */}
        {/* BARBERS TAB */}
        {activeTab === 'barbers' && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>
              Barbers Management
              <button onClick={() => setShowBarberForm(true)} style={buttonStyle}>
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
                      <button onClick={() => handleBarberEdit(barber)} style={{ ...buttonStyle, marginRight: '8px' }}>
                        Edit
                      </button>
                      <button onClick={() => handleBarberDelete(barber.id)} style={dangerButtonStyle}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>
              Inventory Management
              <button onClick={() => setShowInventoryForm(true)} style={buttonStyle}>
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
                    <td style={tdStyle}>₱{item.price?.toFixed(2) || '0.00'}</td>
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
                      <button onClick={() => handleInventoryEdit(item)} style={{ ...buttonStyle, marginRight: '8px' }}>
                        Edit
                      </button>
                      <button onClick={() => handleInventoryDelete(item.id)} style={dangerButtonStyle}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* APPOINTMENTS TAB */}
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
                      <td style={tdStyle}>{app.customerName || 'N/A'}</td>
                      <td style={tdStyle}>{app.barberName || 'N/A'}</td>
                      <td style={tdStyle}>{app.service}</td>
                      <td style={tdStyle}>
                        {app.date ? getAppointmentDate(app).toLocaleDateString() : 'N/A'}
                      </td>
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

        {/* POS TAB */}
        {activeTab === 'pos' && (
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>
              Point of Sale - Transaction History
            </h3>
            
            {payments.length > 0 ? (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Customer Name</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Payment Status</th>
                    <th style={thStyle}>Transaction ID</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id}>
                      <td style={tdStyle}>
                        {payment.customerName || 'Walk-in Customer'}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 'bold', color: '#BD9245' }}>
                        ₱{payment.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          backgroundColor: payment.paymentStatus === 'completed' ? '#28a745' : 
                                       payment.paymentStatus === 'pending' ? '#ffc107' : '#dc3545',
                          color: payment.paymentStatus === 'pending' ? 'black' : 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {payment.paymentStatus || 'N/A'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px' }}>
                        {payment.transactionId || payment.id}
                      </td>
                      <td style={{ ...tdStyle, fontSize: '14px' }}>
                        {formatDate(payment.paymentDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#aaa', marginBottom: '20px' }}>No transactions yet</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* LOW STOCK MODAL - Shows all low stock items */}
      <Modal
        isOpen={showLowStockModal}
        onClose={() => setShowLowStockModal(false)}
        title="⚠️ Low Stock Items Management"
      >
        <div>
          <p style={{ color: '#aaa', marginBottom: '20px' }}>
            The following items are running low on stock. Please restock to maintain inventory levels.
          </p>
          
          {lowStockItems.length > 0 ? (
            <div>
              <table style={{ ...tableStyle, marginBottom: '20px' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Item Name</th>
                    <th style={thStyle}>Current</th>
                    <th style={thStyle}>Min Required</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map(item => (
                    <tr key={item.id}>
                      <td style={tdStyle}>
                        <strong>{item.name}</strong>
                        <div style={{ fontSize: '12px', color: '#aaa' }}>{item.category}</div>
                      </td>
                      <td style={{
                        ...tdStyle,
                        color: parseInt(item.quantity) <= 0 ? '#dc3545' : '#ffc107',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>
                        {item.quantity}
                      </td>
                      <td style={tdStyle}>{item.minStock}</td>
                      <td style={tdStyle}>
                        <span style={{
                          backgroundColor: parseInt(item.quantity) <= 0 ? '#dc3545' : '#ffc107',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {parseInt(item.quantity) <= 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => {
                            setShowLowStockModal(false);
                            handleInventoryEdit(item);
                          }}
                          style={{ ...buttonStyle, fontSize: '12px', padding: '6px 12px' }}
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div style={{ backgroundColor: '#333', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                <h4 style={{ color: '#BD9245', marginTop: 0 }}>Quick Restock</h4>
                <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '15px' }}>
                  Need to restock multiple items? Use the inventory tab for bulk operations.
                </p>
                <button
                  onClick={() => {
                    setShowLowStockModal(false);
                    setActiveTab('inventory');
                  }}
                  style={{ ...buttonStyle, width: '100%' }}
                >
                  Go to Inventory Management
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: '#28a745', fontSize: '18px' }}>✅ All inventory items are well stocked!</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Existing modals... */}
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