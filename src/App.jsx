
import React, { useState, useEffect, useCallback } from 'react';

// --- Global Constants & Dummy Data ---

const ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  SERVICE_PROVIDER: 'SERVICE_PROVIDER',
};

const STATUS_MAP = {
  CREATED: 'Created',
  ACCEPTED: 'Accepted',
  IRONING: 'Ironing in Progress',
  READY: 'Ready for Delivery/Pickup',
  DELIVERED: 'Delivered',
  PICKED_UP: 'Picked Up',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  PENDING_PAYMENT: 'Pending Payment',
  SCHEDULED: 'Scheduled',
  UPDATED: 'Updated',
  ALL: 'All Statuses'
};

const DELIVERY_OPTIONS = {
  Doorstep: 'Doorstep Delivery',
  'Customer Pickup': 'Customer Pickup',
};

const USERS = [
  { id: 'usr-001', name: 'Admin User', email: 'admin@ironeclipse.com', role: ROLES.ADMIN, avatar: '👤' },
  { id: 'usr-002', name: 'Customer One', email: 'customer1@ironeclipse.com', role: ROLES.CUSTOMER, avatar: '👩' },
  { id: 'usr-003', name: 'Customer Two', email: 'customer2@ironeclipse.com', role: ROLES.CUSTOMER, avatar: '👨' },
  { id: 'usr-004', name: 'Iron Partner A', email: 'partnerA@ironeclipse.com', role: ROLES.SERVICE_PROVIDER, partnerId: 'prt-001', avatar: '⚙️' },
  { id: 'usr-005', name: 'Iron Partner B', email: 'partnerB@ironeclipse.com', role: ROLES.SERVICE_PROVIDER, partnerId: 'prt-002', avatar: '🛠️' },
];

const INITIAL_PARTNERS = [
  { id: 'prt-001', name: 'Sparkle Irons', contactEmail: 'contact@sparkle.com', status: 'ACTIVE', location: 'Downtown', capacity: 100 },
  { id: 'prt-002', name: 'Quick Press', contactEmail: 'contact@quickpress.com', status: 'ACTIVE', location: 'Uptown', capacity: 80 },
  { id: 'prt-003', name: 'Crisp & Clean', contactEmail: 'contact@crispclean.com', status: 'INACTIVE', location: 'Midtown', capacity: 120 },
];

const INITIAL_RATES = [
  { id: 'rate-001', clothType: 'Shirt', pricePerPiece: 2.50, lastUpdatedBy: 'Admin User', lastUpdatedAt: '2023-10-20T10:00:00Z' },
  { id: 'rate-002', clothType: 'Pant', pricePerPiece: 3.00, lastUpdatedBy: 'Admin User', lastUpdatedAt: '2023-10-20T10:00:00Z' },
  { id: 'rate-003', clothType: 'Saree', pricePerPiece: 5.00, lastUpdatedBy: 'Admin User', lastUpdatedAt: '2023-10-20T10:00:00Z' },
  { id: 'rate-004', clothType: 'Bed Linen', pricePerPiece: 7.00, lastUpdatedBy: 'Admin User', lastUpdatedAt: '2023-10-20T10:00:00Z' },
];

const INITIAL_ORDERS = [
  {
    id: 'ord-001', customerId: 'usr-002', customerName: 'Customer One', providerId: 'prt-001', providerName: 'Sparkle Irons',
    items: [{ type: 'Shirt', quantity: 5, price: 2.50 }, { type: 'Pant', quantity: 3, price: 3.00 }],
    status: 'READY',
    deliveryOption: 'Doorstep', deliveryAddress: '123 Main St, City',
    totalAmount: 21.50, createdAt: '2023-10-25T10:00:00Z', acceptedAt: '2023-10-25T11:00:00Z', ironingAt: '2023-10-25T13:00:00Z', readyAt: '2023-10-26T10:00:00Z',
    timeline: [
      { status: 'CREATED', timestamp: '2023-10-25T10:00:00Z', by: 'Customer One', remarks: 'Order placed' },
      { status: 'ACCEPTED', timestamp: '2023-10-25T11:00:00Z', by: 'Sparkle Irons', remarks: 'Order accepted by provider' },
      { status: 'IRONING', timestamp: '2023-10-25T13:00:00Z', by: 'Sparkle Irons', remarks: 'Ironing in progress' },
      { status: 'READY', timestamp: '2023-10-26T10:00:00Z', by: 'Sparkle Irons', remarks: 'Order ready for delivery' },
    ],
    auditLog: [{ action: 'Order Placed', timestamp: '2023-10-25T10:00:00Z', user: 'Customer One', deliveryOption: 'Doorstep' }],
  },
  {
    id: 'ord-002', customerId: 'usr-003', customerName: 'Customer Two', providerId: 'prt-002', providerName: 'Quick Press',
    items: [{ type: 'Saree', quantity: 2, price: 5.00 }, { type: 'Shirt', quantity: 2, price: 2.50 }],
    status: 'ACCEPTED',
    deliveryOption: 'Customer Pickup', pickupLocation: 'Quick Press Store',
    totalAmount: 15.00, createdAt: '2023-10-26T11:30:00Z', acceptedAt: '2023-10-26T12:00:00Z',
    timeline: [
      { status: 'CREATED', timestamp: '2023-10-26T11:30:00Z', by: 'Customer Two', remarks: 'Order placed' },
      { status: 'ACCEPTED', timestamp: '2023-10-26T12:00:00Z', by: 'Quick Press', remarks: 'Order accepted by provider' },
    ],
    auditLog: [{ action: 'Order Placed', timestamp: '2023-10-26T11:30:00Z', user: 'Customer Two', deliveryOption: 'Customer Pickup' }],
  },
  {
    id: 'ord-003', customerId: 'usr-002', customerName: 'Customer One', providerId: 'prt-001', providerName: 'Sparkle Irons',
    items: [{ type: 'Bed Linen', quantity: 1, price: 7.00 }, { type: 'Pant', quantity: 4, price: 3.00 }],
    status: 'DELIVERED',
    deliveryOption: 'Doorstep', deliveryAddress: '123 Main St, City',
    totalAmount: 19.00, createdAt: '2023-10-20T09:00:00Z', acceptedAt: '2023-10-20T09:30:00Z', ironingAt: '2023-10-20T11:00:00Z', readyAt: '2023-10-21T09:00:00Z', deliveredAt: '2023-10-21T14:00:00Z',
    timeline: [
      { status: 'CREATED', timestamp: '2023-10-20T09:00:00Z', by: 'Customer One', remarks: 'Order placed' },
      { status: 'ACCEPTED', timestamp: '2023-10-20T09:30:00Z', by: 'Sparkle Irons', remarks: 'Order accepted by provider' },
      { status: 'IRONING', timestamp: '2023-10-20T11:00:00Z', by: 'Sparkle Irons', remarks: 'Ironing in progress' },
      { status: 'READY', timestamp: '2023-10-21T09:00:00Z', by: 'Sparkle Irons', remarks: 'Order ready for delivery' },
      { status: 'DELIVERED', timestamp: '2023-10-21T14:00:00Z', by: 'Delivery Staff', remarks: 'Delivered to customer' },
    ],
    auditLog: [{ action: 'Order Placed', timestamp: '2023-10-20T09:00:00Z', user: 'Customer One', deliveryOption: 'Doorstep' }],
  },
  {
    id: 'ord-004', customerId: 'usr-003', customerName: 'Customer Two', providerId: 'prt-002', providerName: 'Quick Press',
    items: [{ type: 'Shirt', quantity: 7, price: 2.50 }],
    status: 'IRONING',
    deliveryOption: 'Customer Pickup', pickupLocation: 'Quick Press Store',
    totalAmount: 17.50, createdAt: '2023-10-27T08:00:00Z', acceptedAt: '2023-10-27T08:30:00Z', ironingAt: '2023-10-27T09:30:00Z',
    timeline: [
      { status: 'CREATED', timestamp: '2023-10-27T08:00:00Z', by: 'Customer Two', remarks: 'Order placed' },
      { status: 'ACCEPTED', timestamp: '2023-10-27T08:30:00Z', by: 'Quick Press', remarks: 'Order accepted by provider' },
      { status: 'IRONING', timestamp: '2023-10-27T09:30:00Z', by: 'Quick Press', remarks: 'Ironing in progress' },
    ],
    auditLog: [{ action: 'Order Placed', timestamp: '2023-10-27T08:00:00Z', user: 'Customer Two', deliveryOption: 'Customer Pickup' }],
  },
  {
    id: 'ord-005', customerId: 'usr-002', customerName: 'Customer One', providerId: 'prt-001', providerName: 'Sparkle Irons',
    items: [{ type: 'Pant', quantity: 2, price: 3.00 }, { type: 'Shirt', quantity: 2, price: 2.50 }],
    status: 'CREATED',
    deliveryOption: 'Doorstep', deliveryAddress: '123 Main St, City',
    totalAmount: 11.00, createdAt: '2023-10-28T14:00:00Z',
    timeline: [
      { status: 'CREATED', timestamp: '2023-10-28T14:00:00Z', by: 'Customer One', remarks: 'Order placed' },
    ],
    auditLog: [{ action: 'Order Placed', timestamp: '2023-10-28T14:00:00Z', user: 'Customer One', deliveryOption: 'Doorstep' }],
  },
  {
    id: 'ord-006', customerId: 'usr-003', customerName: 'Customer Two', providerId: 'prt-002', providerName: 'Quick Press',
    items: [{ type: 'Bed Linen', quantity: 2, price: 7.00 }],
    status: 'PICKED_UP',
    deliveryOption: 'Customer Pickup', pickupLocation: 'Quick Press Store',
    totalAmount: 14.00, createdAt: '2023-10-18T10:00:00Z', acceptedAt: '2023-10-18T10:30:00Z', ironingAt: '2023-10-18T12:00:00Z', readyAt: '2023-10-19T09:00:00Z', pickedUpAt: '2023-10-19T11:00:00Z',
    timeline: [
      { status: 'CREATED', timestamp: '2023-10-18T10:00:00Z', by: 'Customer Two', remarks: 'Order placed' },
      { status: 'ACCEPTED', timestamp: '2023-10-18T10:30:00Z', by: 'Quick Press', remarks: 'Order accepted by provider' },
      { status: 'IRONING', timestamp: '2023-10-18T12:00:00Z', by: 'Quick Press', remarks: 'Ironing in progress' },
      { status: 'READY', timestamp: '2023-10-19T09:00:00Z', by: 'Quick Press', remarks: 'Order ready for pickup' },
      { status: 'PICKED_UP', timestamp: '2023-10-19T11:00:00Z', by: 'Customer Two', remarks: 'Customer picked up order' },
    ],
    auditLog: [{ action: 'Order Placed', timestamp: '2023-10-18T10:00:00Z', user: 'Customer Two', deliveryOption: 'Customer Pickup' }],
  },
];

const INITIAL_ACTIVITIES = [
  { id: 'act-001', userId: 'usr-002', role: ROLES.CUSTOMER, type: 'Order Placed', description: 'Order #ord-005 placed for $11.00', timestamp: '2023-10-28T14:00:00Z', status: 'CREATED' },
  { id: 'act-002', userId: 'usr-004', role: ROLES.SERVICE_PROVIDER, type: 'Order Accepted', description: 'Order #ord-002 accepted from Customer Two', timestamp: '2023-10-26T12:00:00Z', status: 'ACCEPTED' },
  { id: 'act-003', userId: 'usr-001', role: ROLES.ADMIN, type: 'Rate Update', description: 'Price for Shirt updated to $2.50', timestamp: '2023-10-20T10:00:00Z', status: 'UPDATED' },
  { id: 'act-004', userId: 'usr-004', role: ROLES.SERVICE_PROVIDER, type: 'Order Completed', description: 'Order #ord-003 marked as delivered', timestamp: '2023-10-21T14:00:00Z', status: 'DELIVERED' },
  { id: 'act-005', userId: 'usr-002', role: ROLES.CUSTOMER, type: 'Order Ready', description: 'Order #ord-001 is ready for delivery', timestamp: '2023-10-26T10:00:00Z', status: 'READY' },
  { id: 'act-006', userId: 'usr-005', role: ROLES.SERVICE_PROVIDER, type: 'Delivery Scheduled', description: 'Delivery for #ord-001 scheduled.', timestamp: '2023-10-26T10:30:00Z', status: 'SCHEDULED' },
  { id: 'act-007', userId: 'usr-001', role: ROLES.ADMIN, type: 'Partner Status Change', description: 'Partner Crisp & Clean set to INACTIVE', timestamp: '2023-10-27T10:00:00Z', status: 'UPDATED' },
];

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState({ screen: 'AUTH', params: {} });
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [rates, setRates] = useState(INITIAL_RATES);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);

  // --- Global Handlers & Helpers ---

  // Dark mode toggle based on system preference
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  const navigate = useCallback((screen, params = {}) => {
    setView({ screen, params });
  }, []);

  const login = useCallback((roleId) => {
    const user = USERS.find(u => u.id === roleId);
    if (user) {
      setCurrentUser(user);
      navigate('DASHBOARD');
      addNotification(`Welcome, ${user.name}!`, 'success');
    } else {
      addNotification('Login failed. User not found.', 'error');
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    navigate('AUTH');
    addNotification('You have been logged out.', 'info');
  }, [navigate]);

  const addNotification = useCallback((message, type = 'info') => {
    const newNotification = { id: Date.now(), message, type };
    setNotifications((prev) => [...prev, newNotification]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'CREATED': return 'var(--status-blue)';
      case 'ACCEPTED': return 'var(--status-purple)';
      case 'IRONING': return 'var(--status-yellow)';
      case 'READY': return 'var(--status-green)';
      case 'DELIVERED':
      case 'PICKED_UP': return 'var(--status-success)';
      case 'REJECTED': return 'var(--status-danger)';
      case 'PENDING_PAYMENT': return 'var(--status-orange)';
      case 'CANCELLED': return 'var(--status-dark-gray)';
      case 'SCHEDULED': return 'var(--status-purple)';
      case 'UPDATED': return 'var(--status-blue)';
      case 'ACTIVE': return 'var(--status-green)';
      case 'INACTIVE': return 'var(--status-dark-gray)';
      default: return 'var(--status-neutral)';
    }
  }, []);

  const addActivity = useCallback((userId, role, type, description, status) => {
    setActivities((prev) => [
      ...prev,
      { id: `act-${(prev.length + 1).toString().padStart(3, '0')}`, userId, role, type, description, timestamp: new Date().toISOString(), status }
    ]);
  }, []);

  const handleOrderAction = useCallback((orderId, actionType, newStatusOverride = null) => {
    setOrders(prevOrders => {
      const newOrders = prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = { ...order };
          const newStatus = newStatusOverride || (() => {
            switch (actionType) {
              case 'Accept Order': return 'ACCEPTED';
              case 'Mark Ready': return 'READY';
              case 'Mark Delivered': return 'DELIVERED';
              case 'Mark Picked': return 'PICKED_UP';
              default: return order.status; // No status change if action not defined
            }
          })();

          if (order.status === newStatus) return order; // Prevent redundant update

          const timestamp = new Date().toISOString();
          const newTimelineEvent = {
            status: newStatus,
            timestamp: timestamp,
            by: currentUser?.name || 'System',
            remarks: `${actionType} action taken`
          };

          const newAuditLogEntry = { action: actionType, timestamp: timestamp, user: currentUser?.name, deliveryOption: order?.deliveryOption };

          updatedOrder.status = newStatus;
          switch (newStatus) {
            case 'ACCEPTED': updatedOrder.acceptedAt = timestamp; break;
            case 'READY': updatedOrder.readyAt = timestamp; break;
            case 'DELIVERED': updatedOrder.deliveredAt = timestamp; break;
            case 'PICKED_UP': updatedOrder.pickedUpAt = timestamp; break;
            default: break;
          }

          addNotification(`Order ${orderId} status changed to ${STATUS_MAP[newStatus]}!`, 'success');
          addActivity(currentUser?.id, currentUser?.role, actionType, `Order #${orderId} ${actionType.toLowerCase()}`, newStatus);

          return {
            ...updatedOrder,
            timeline: [...(updatedOrder.timeline || []), newTimelineEvent],
            auditLog: [...(updatedOrder.auditLog || []), newAuditLogEntry],
          };
        }
        return order;
      });
      return newOrders;
    });
  }, [currentUser, addNotification, addActivity]);


  // --- Helper Components (defined within App's scope for direct access to state/handlers) ---

  const AuthScreen = ({ onLogin }) => (
    <div className="auth-container">
      <div className="card auth-card">
        <h2>Welcome to IronEclipse</h2>
        <div className="role-buttons">
          {USERS.map(user => (
            <button
              key={user.id}
              className="button button-primary"
              onClick={() => onLogin(user.id)}
            >
              Login as {user.role} ({user.name})
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const Breadcrumbs = ({ path }) => (
    <div className="breadcrumbs">
      {path.map((item, index) => (
        <React.Fragment key={index}>
          <span className="breadcrumb-item">
            {index < path.length - 1 ? (
              <a href="#" onClick={(e) => { e.preventDefault(); navigate(item.path, item.params); }}>{item.label}</a>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
          {index < path.length - 1 && <span className="breadcrumb-separator">/</span>}
        </React.Fragment>
      ))}
    </div>
  );

  const Header = ({ currentUser, navigate, logout, breadcrumbs }) => {
    // Role-based menu items
    const menuItems = {
      [ROLES.ADMIN]: [
        { label: 'Dashboard', screen: 'DASHBOARD' },
        { label: 'All Orders', screen: 'ADMIN_ORDERS' },
        { label: 'Partners', screen: 'PARTNERS_LIST' },
        { label: 'Rate Setup', screen: 'RATE_SETUP_FORM' },
      ],
      [ROLES.CUSTOMER]: [
        { label: 'Dashboard', screen: 'DASHBOARD' },
        { label: 'My Orders', screen: 'ORDER_LIST' },
        { label: 'Place Order', screen: 'ORDER_FORM' },
      ],
      [ROLES.SERVICE_PROVIDER]: [
        { label: 'Dashboard', screen: 'DASHBOARD' },
        { label: 'Order Queue', screen: 'ORDER_QUEUE' },
      ],
    };

    const currentMenuItems = menuItems[currentUser?.role] || [];

    return (
      <>
        <header className="app-header">
          <div className="app-logo">IronEclipse</div>
          <nav className="header-nav">
            {currentMenuItems.map(item => (
              <a
                key={item.screen}
                href="#"
                onClick={() => navigate(item.screen)}
                className={view.screen === item.screen ? 'active' : ''}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="user-controls">
            {currentUser && (
              <div className="user-info">
                <span className="user-avatar" style={{ backgroundColor: 'var(--primary-color)' }}>{currentUser.avatar}</span>
                <span>{currentUser.name} ({currentUser.role})</span>
              </div>
            )}
            <button onClick={logout} className="button button-secondary">Logout</button>
          </div>
        </header>
        {breadcrumbs?.length > 0 && <Breadcrumbs path={breadcrumbs} />}
      </>
    );
  };

  const ChartPlaceholder = ({ title }) => (
    <div className="chart-placeholder card">
      <p>{title} (Chart)</p>
    </div>
  );

  const KPICard = ({ title, value, icon, statusColor, onClick }) => (
    <div className="card kpi-card" onClick={onClick}>
      <div className="kpi-card-header">
        <h3 className="kpi-card-title">{title}</h3>
        <span className="kpi-card-icon" style={{ backgroundColor: statusColor || 'var(--status-neutral)' }}>{icon}</span>
      </div>
      <div className="kpi-card-value">{value}</div>
    </div>
  );

  const ActivityCard = ({ activity, onClick }) => (
    <div className="card activity-card" onClick={onClick}>
      <div className="activity-info">
        <strong>{activity?.type}</strong>
        <span>{activity?.description}</span>
      </div>
      <span className="status-badge" style={{ backgroundColor: getStatusColor(activity?.status) }}>
        {STATUS_MAP[activity?.status]}
      </span>
    </div>
  );

  const TaskCard = ({ task, onAction }) => (
    <div className="card task-card">
      <div className="task-info">
        <strong>{task?.title} ({task?.priority} Priority)</strong>
        <span>Due: {task?.dueDate} - {task?.description}</span>
      </div>
      {(task?.status === 'CREATED') && (
        <button className="button button-primary" onClick={() => onAction('Accept Order')}>Accept</button>
      )}
      {(task?.status === 'ACCEPTED' || task?.status === 'IRONING') && (
        <button className="button button-primary" onClick={() => onAction('Mark Ready')}>Mark Ready</button>
      )}
      <span className="status-badge" style={{ backgroundColor: getStatusColor(task?.status) }}>
        {STATUS_MAP[task?.status]}
      </span>
    </div>
  );

  const NotificationToast = ({ notification }) => (
    <div className={`notification-toast ${notification?.type}`}>
      <span className="notification-icon">
        {notification?.type === 'success' ? '✅' : notification?.type === 'error' ? '❌' : notification?.type === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <span>{notification?.message}</span>
    </div>
  );

  const WorkflowStepper = ({ timeline, currentStatus, getStatusColor }) => (
    <div className="timeline-stepper">
      {timeline?.map((event, index) => (
        <div key={index} className="timeline-item">
          <span
            className={`timeline-dot ${event?.status === currentStatus ? 'current' : ''}`}
            style={{ backgroundColor: getStatusColor(event?.status) }}
          >
            {event?.status === 'DELIVERED' || event?.status === 'PICKED_UP' ? '✅' : '●'}
          </span>
          <div className="timeline-content">
            <div className="timeline-status" style={{ color: getStatusColor(event?.status) }}>{STATUS_MAP[event?.status]}</div>
            <div className="timeline-details">
              {new Date(event?.timestamp).toLocaleString()} by {event?.by}
              <br />
              <em>{event?.remarks}</em>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const DashboardScreen = ({ currentUser, navigate, orders, activities, partners, rates, addNotification, getStatusColor }) => {
    // Filter orders relevant to the current user's role
    const userOrders = orders.filter(o =>
      (currentUser?.role === ROLES.CUSTOMER && o?.customerId === currentUser?.id) ||
      (currentUser?.role === ROLES.SERVICE_PROVIDER && o?.providerId === currentUser?.partnerId) ||
      (currentUser?.role === ROLES.ADMIN)
    );

    // KPI Calculation logic
    const customerOrdersPlaced = userOrders.length;
    const customerOrdersReady = userOrders.filter(o => o?.status === 'READY').length;

    const spOrdersReceived = userOrders.length;
    const spOrdersInProgress = userOrders.filter(o => o?.status === 'ACCEPTED' || o?.status === 'IRONING').length;
    const spOrdersCompleted = userOrders.filter(o => o?.status === 'DELIVERED' || o?.status === 'PICKED_UP').length;
    const spDeliveriesScheduled = userOrders.filter(o => o?.status === 'READY' && o?.deliveryOption === 'Doorstep').length;

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order?.totalAmount || 0), 0);
    const completedOrders = orders.filter(o => (o?.deliveredAt || o?.pickedUpAt));
    const avgTurnaroundTime = completedOrders.length > 0
      ? completedOrders.reduce((sum, o) => {
          const start = new Date(o?.createdAt);
          const end = new Date(o?.deliveredAt || o?.pickedUpAt);
          return sum + (end.getTime() - start.getTime());
        }, 0) / completedOrders.length
      : 0; // Milliseconds
    const deliveryVsPickup = orders.reduce((acc, order) => {
        const option = order?.deliveryOption || 'Unknown';
        return { ...acc, [option]: (acc[option] || 0) + 1 };
    }, {});


    const relevantActivities = activities.filter(act => {
      if (currentUser?.role === ROLES.ADMIN) return true;
      if (currentUser?.role === ROLES.CUSTOMER) return act?.userId === currentUser?.id;
      if (currentUser?.role === ROLES.SERVICE_PROVIDER) {
        const associatedOrder = orders.find(o => o.id === act?.description.match(/#(\w+)/)?.[1]);
        return (associatedOrder?.providerId === currentUser?.partnerId) || (act?.userId === currentUser?.id);
      }
      return false;
    }).sort((a,b) => new Date(b?.timestamp).getTime() - new Date(a?.timestamp).getTime()).slice(0,5);

    const upcomingTasks = orders.filter(o =>
      ((currentUser?.role === ROLES.SERVICE_PROVIDER) && (o?.providerId === currentUser?.partnerId) && (o?.status === 'ACCEPTED' || o?.status === 'IRONING')) ||
      ((currentUser?.role === ROLES.ADMIN) && (o?.status === 'CREATED' || o?.status === 'READY'))
    ).map(o => ({
      id: o?.id,
      title: `Order ${o?.id}`,
      description: `${STATUS_MAP[o?.status]} for ${o?.customerName}`,
      dueDate: new Date(new Date(o?.createdAt).getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // 2 days from creation
      status: o?.status,
      priority: (o?.status === 'CREATED' || o?.status === 'READY') ? 'High' : 'Medium'
    })).sort((a,b) => new Date(a?.dueDate).getTime() - new Date(b?.dueDate).getTime()).slice(0,5);


    return (
      <div className="dashboard-layout">
        <h2 className="dashboard-title">Welcome, {currentUser?.name}!</h2>

        <div className="kpi-grid">
          {(currentUser?.role === ROLES.CUSTOMER) && (
            <>
              <KPICard title="Orders Placed" value={customerOrdersPlaced} icon="📦" statusColor="var(--status-blue)" onClick={() => navigate('ORDER_LIST', { status: 'ALL' })} />
              <KPICard title="Orders Ready" value={customerOrdersReady} icon="✅" statusColor="var(--status-green)" onClick={() => navigate('ORDER_LIST', { status: 'READY' })} />
            </>
          )}
          {(currentUser?.role === ROLES.SERVICE_PROVIDER) && (
            <>
              <KPICard title="Orders Received" value={spOrdersReceived} icon="📥" statusColor="var(--status-blue)" onClick={() => navigate('ORDER_QUEUE', { status: 'ALL' })} />
              <KPICard title="Orders In Progress" value={spOrdersInProgress} icon="⚙️" statusColor="var(--status-yellow)" onClick={() => navigate('ORDER_QUEUE', { status: 'IRONING' })} />
              <KPICard title="Orders Completed" value={spOrdersCompleted} icon="🏆" statusColor="var(--status-success)" onClick={() => navigate('ORDER_QUEUE', { status: 'DELIVERED' })} />
              <KPICard title="Deliveries Scheduled" value={spDeliveriesScheduled} icon="🚚" statusColor="var(--status-purple)" onClick={() => navigate('ORDER_QUEUE', { status: 'READY', deliveryOption: 'Doorstep' })} />
            </>
          )}
          {(currentUser?.role === ROLES.ADMIN) && (
            <>
              <KPICard title="Total Orders" value={totalOrders} icon="📊" statusColor="var(--status-blue)" onClick={() => navigate('ADMIN_ORDERS')} />
              <KPICard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon="💰" statusColor="var(--status-green)" onClick={() => navigate('ADMIN_ORDERS')} />
              <KPICard title="Avg Turnaround Time" value={`${(avgTurnaroundTime / (1000 * 60 * 60)).toFixed(1)} hrs`} icon="⏱️" statusColor="var(--status-yellow)" onClick={() => navigate('ADMIN_ORDERS')} />
              <KPICard title="Active Partners" value={partners.filter(p => p?.status === 'ACTIVE').length} icon="🤝" statusColor="var(--status-purple)" onClick={() => navigate('PARTNERS_LIST')} />
            </>
          )}
        </div>

        <div className="dashboard-sections-grid">
          <div className="dashboard-section card">
            <h3>Charts & Visualizations</h3>
            <div className="chart-grid">
              {(currentUser?.role === ROLES.SERVICE_PROVIDER) && (
                <>
                  <ChartPlaceholder title="Orders by Status (Donut)" />
                  <ChartPlaceholder title="Daily Volume Trend (Line)" />
                  <ChartPlaceholder title="Delivery vs Pickup (Bar)" />
                </>
              )}
              {(currentUser?.role === ROLES.ADMIN) && (
                <>
                  <ChartPlaceholder title="Revenue Trend (Line)" />
                  <ChartPlaceholder title="TAT Gauge" />
                  <ChartPlaceholder title="Delivery vs Pickup (Donut)" />
                </>
              )}
              {(currentUser?.role === ROLES.CUSTOMER) && (
                <>
                  <ChartPlaceholder title="My Order Status" />
                </>
              )}
            </div>
          </div>

          <div className="dashboard-section card">
            <h3>Recent Activities</h3>
            <div className="activity-list">
              {(relevantActivities?.length > 0) ? (
                relevantActivities.map(activity => (
                  <ActivityCard key={activity?.id} activity={activity} onClick={() => {
                    const orderIdMatch = activity?.description?.match(/#(\w+)/);
                    if (orderIdMatch?.[1]) navigate('ORDER_DETAILS', { orderId: orderIdMatch[1] });
                  }} />
                ))
              ) : (
                <div className="empty-state-card">
                  <span className="empty-state-icon">📄</span>
                  <p>No recent activities.</p>
                </div>
              )}
            </div>
          </div>

          {((currentUser?.role === ROLES.SERVICE_PROVIDER) || (currentUser?.role === ROLES.ADMIN)) && (
            <div className="dashboard-section card">
              <h3>Task / Work Queue</h3>
              <div className="task-queue-list">
                {(upcomingTasks?.length > 0) ? (
                  upcomingTasks.map(task => (
                    <TaskCard key={task?.id} task={task} onAction={(action) => handleOrderAction(task?.id, action)} />
                  ))
                ) : (
                  <div className="empty-state-card">
                    <span className="empty-state-icon">✨</span>
                    <p>No tasks in your queue.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="dashboard-section card">
            <h3>Upcoming Deadlines</h3>
            <div className="deadline-list">
              {(upcomingTasks?.length > 0) ? (
                upcomingTasks.map(task => (
                  <div key={`deadline-${task?.id}`} className="card deadline-card" onClick={() => navigate('ORDER_DETAILS', { orderId: task?.id })}>
                    <div className="deadline-info">
                      <strong>{task?.title}</strong>
                      <span>Due: {task?.dueDate}</span>
                    </div>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(task?.status) }}>{STATUS_MAP[task?.status]}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state-card">
                  <span className="empty-state-icon">🗓️</span>
                  <p>No upcoming deadlines.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };


  const OrderListScreen = ({ currentUser, navigate, orders, getStatusColor, handleAction, filterParams = {} }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState(filterParams);
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    const relevantOrders = orders.filter(order => {
      if ((currentUser?.role === ROLES.CUSTOMER) && (order?.customerId !== currentUser?.id)) return false;
      if ((currentUser?.role === ROLES.SERVICE_PROVIDER) && (order?.providerId !== currentUser?.partnerId)) return false;

      const matchesSearch = (order?.id?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
                            (order?.customerName?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
                            (order?.status?.toLowerCase()?.includes(searchTerm.toLowerCase()));

      const matchesStatus = filters.status ? (order?.status === filters.status) : true;
      const matchesDelivery = filters.deliveryOption ? (order?.deliveryOption === filters.deliveryOption) : true;
      const matchesPartner = filters.partnerId ? (order?.providerId === filters.partnerId) : true; // Admin filter

      return (matchesSearch && matchesStatus && matchesDelivery && matchesPartner);
    });

    const breadcrumbs = [
      { label: 'Dashboard', path: 'DASHBOARD' },
      { label: (currentUser?.role === ROLES.SERVICE_PROVIDER) ? 'Orders Queue' : 'My Orders', path: 'ORDER_LIST' },
    ];

    return (
      <div className="screen-container">
        <Header currentUser={currentUser} navigate={navigate} logout={logout} breadcrumbs={breadcrumbs} />
        <h2 className="screen-title">{currentUser?.role === ROLES.SERVICE_PROVIDER ? 'Order Queue' : 'My Orders'}</h2>
        <div className="toolbar">
          <input
            type="text"
            placeholder="Search orders..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="button button-secondary" onClick={() => setShowFilterPanel(prev => !prev)}>Filter</button>
        </div>

        {(showFilterPanel) && (
          <div className="filter-panel card">
            <h3>Filters</h3>
            <div className="form-group">
              <label htmlFor="filter-status">Status:</label>
              <select id="filter-status" value={filters.status || ''} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}>
                <option value="">All</option>
                {Object.keys(STATUS_MAP).filter(s => s !== 'ALL').map(s => <option key={s} value={s}>{STATUS_MAP[s]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="filter-delivery">Delivery Option:</label>
              <select id="filter-delivery" value={filters.deliveryOption || ''} onChange={(e) => setFilters(prev => ({ ...prev, deliveryOption: e.target.value || undefined }))}>
                <option value="">All</option>
                {Object.keys(DELIVERY_OPTIONS).map(d => <option key={d} value={d}>{DELIVERY_OPTIONS[d]}</option>)}
              </select>
            </div>
            {(currentUser?.role === ROLES.ADMIN) && (
                <div className="form-group">
                    <label htmlFor="filter-partner">Partner:</label>
                    <select id="filter-partner" value={filters.partnerId || ''} onChange={(e) => setFilters(prev => ({ ...prev, partnerId: e.target.value || undefined }))}>
                        <option value="">All</option>
                        {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <button className="button button-primary" onClick={() => setShowFilterPanel(false)}>Apply Filters</button>
                <button className="button button-secondary" onClick={() => { setFilters({}); setShowFilterPanel(false); }}>Clear Filters</button>
            </div>
          </div>
        )}

        <div className="card-grid">
          {(relevantOrders?.length > 0) ? (
            relevantOrders.map(order => (
              <div key={order?.id} className="card order-card" onClick={() => navigate('ORDER_DETAILS', { orderId: order?.id })}>
                <div className="order-header">
                  <h3>Order #{order?.id}</h3>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(order?.status) }}>
                    {STATUS_MAP[order?.status]}
                  </span>
                </div>
                <p>Customer: {order?.customerName}</p>
                <p>Provider: {order?.providerName || 'N/A'}</p>
                <p>Total: ${order?.totalAmount?.toFixed(2)}</p>
                <p>Delivery: {DELIVERY_OPTIONS[order?.deliveryOption]}</p>
                {((currentUser?.role === ROLES.SERVICE_PROVIDER) && (order?.providerId === currentUser?.partnerId) && (order?.status === 'CREATED')) && (
                  <button className="button button-primary quick-action-button" onClick={(e) => { e.stopPropagation(); handleAction(order?.id, 'Accept Order'); }}>Accept Order</button>
                )}
                {((currentUser?.role === ROLES.SERVICE_PROVIDER) && (order?.providerId === currentUser?.partnerId) && (order?.status === 'ACCEPTED')) && (
                  <button className="button button-primary quick-action-button" onClick={(e) => { e.stopPropagation(); handleAction(order?.id, 'Mark Ready'); }}>Mark Ready</button>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state-card">
              <span className="empty-state-icon">📦</span>
              <p>No orders found matching your criteria.</p>
              {((currentUser?.role === ROLES.CUSTOMER)) && <button className="button button-primary" onClick={() => navigate('ORDER_FORM')}>Place New Order</button>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const OrderDetailsScreen = ({ currentUser, navigate, orders, orderId, getStatusColor, handleAction }) => {
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return (
        <div className="screen-container">
          <Header currentUser={currentUser} navigate={navigate} logout={logout} breadcrumbs={[{ label: 'Orders', path: 'ORDER_LIST' }, { label: 'Not Found', path: '#' }]} />
          <div className="empty-state-card">
            <span className="empty-state-icon">⚠️</span>
            <p>Order not found.</p>
            <button className="button button-secondary" onClick={() => navigate('ORDER_LIST')}>Back to Orders</button>
          </div>
        </div>
      );
    }

    const breadcrumbs = [
      { label: 'Dashboard', path: 'DASHBOARD' },
      { label: ((currentUser?.role === ROLES.SERVICE_PROVIDER) && (currentUser?.partnerId === order?.providerId)) ? 'Orders Queue' : 'Orders', path: 'ORDER_LIST' },
      { label: `Order #${order.id}`, path: 'ORDER_DETAILS', params: { orderId: order.id } },
    ];

    const isProviderAssigned = (currentUser?.role === ROLES.SERVICE_PROVIDER) && (currentUser?.partnerId === order?.providerId);
    const isAdmin = (currentUser?.role === ROLES.ADMIN);

    const orderCreationDate = new Date(order?.createdAt);
    const twoDaysAfterCreation = new Date(orderCreationDate.getTime() + (2 * 24 * 60 * 60 * 1000));
    const isSLABreached = (twoDaysAfterCreation < new Date()) && (order?.status !== 'DELIVERED') && (order?.status !== 'PICKED_UP');

    return (
      <div className="screen-container order-detail-screen">
        <Header currentUser={currentUser} navigate={navigate} logout={logout} breadcrumbs={breadcrumbs} />
        <h2 className="screen-title">Order Details: #{order.id}</h2>

        <div className="order-detail-layout">
          <div className="card order-summary-card">
            <h3>Order Info</h3>
            <p><strong>Customer:</strong> {order?.customerName}</p>
            <p><strong>Provider:</strong> {order?.providerName || 'N/A'}</p>
            <p><strong>Status:</strong> <span className="status-badge" style={{ backgroundColor: getStatusColor(order?.status) }}>{STATUS_MAP[order?.status]}</span></p>
            <p><strong>Total Amount:</strong> ${order?.totalAmount?.toFixed(2)}</p>
            <p><strong>Delivery Option:</strong> {DELIVERY_OPTIONS[order?.deliveryOption]}</p>
            {(order?.deliveryOption === 'Doorstep') && <p><strong>Address:</strong> {order?.deliveryAddress}</p>}
            {(order?.deliveryOption === 'Customer Pickup') && <p><strong>Pickup Location:</strong> {order?.pickupLocation}</p>}
            <p><strong>Items:</strong></p>
            <ul>
              {order?.items?.map((item, index) => (
                <li key={index}>{item?.quantity}x {item?.type} (${item?.price?.toFixed(2)} each)</li>
              ))}
            </ul>

            <div className="action-bar">
              {((isProviderAssigned) && (order?.status === 'CREATED')) && (
                <button className="button button-primary" onClick={() => handleAction(order?.id, 'Accept Order')}>Accept Order</button>
              )}
              {((isProviderAssigned) && (order?.status === 'ACCEPTED')) && (
                <button className="button button-primary" onClick={() => handleAction(order?.id, 'Mark Ready')}>Mark Ready</button>
              )}
              {((isProviderAssigned) && (order?.status === 'READY') && (order?.deliveryOption === 'Doorstep')) && (
                <button className="button button-primary" onClick={() => handleAction(order?.id, 'Mark Delivered')}>Mark Delivered</button>
              )}
              {((isProviderAssigned) && (order?.status === 'READY') && (order?.deliveryOption === 'Customer Pickup')) && (
                <button className="button button-primary" onClick={() => handleAction(order?.id, 'Mark Picked')}>Mark Picked Up</button>
              )}
              {((isAdmin) || (isProviderAssigned)) && (
                <button className="button button-secondary" onClick={() => navigate('ORDER_UPDATE_FORM', { orderId: order?.id })}>Edit Order (Dummy)</button>
              )}
            </div>
          </div>

          <div className="card order-workflow-card">
            <h3>Order Workflow</h3>
            <WorkflowStepper timeline={order?.timeline} currentStatus={order?.status} getStatusColor={getStatusColor} />
            {(isSLABreached) && (
                <div className="sla-badge">SLA Breach!</div>
            )}
          </div>

          <div className="card order-audit-card">
            <h3>Audit Log</h3>
            <div className="audit-log-list">
                {order?.auditLog?.map((log, index) => (
                    <div key={index} className="audit-log-item">
                        <strong>{log?.action}</strong>
                        <span>{new Date(log?.timestamp).toLocaleString()}</span>
                        <span>by {log?.user}</span>
                        {log?.deliveryOption && <span>Delivery: {log?.deliveryOption}</span>}
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OrderForm = ({ currentUser, navigate, addNotification, rates, orders, setOrders }) => {
    const [formData, setFormData] = useState({
      customerId: currentUser?.id,
      customerName: currentUser?.name,
      items: [{ type: '', quantity: 0, price: 0 }],
      deliveryOption: 'Doorstep',
      deliveryAddress: '',
      pickupLocation: '',
      totalAmount: 0,
    });
    const [activeSection, setActiveSection] = useState('Order Details');
    const [confirmation, setConfirmation] = useState(false);

    const availableClothTypes = rates.map(r => r.clothType);

    const calculateTotal = useCallback(() => {
        let total = 0;
        formData.items.forEach(item => {
            total += (item?.quantity || 0) * (item?.price || 0);
        });
        setFormData(prev => ({ ...prev, totalAmount: total }));
    }, [formData.items]);

    useEffect(() => {
        calculateTotal();
    }, [formData.items, calculateTotal]);

    const handleItemChange = (index, field, value) => {
        const newItems = formData.items.slice(); // .slice() for immutability
        if (field === 'type') {
            const selectedRate = rates.find(r => r.clothType === value);
            newItems[index] = { ...newItems[index], type: value, price: selectedRate?.pricePerPiece || 0 };
        } else {
            newItems[index] = { ...newItems[index], [field]: value };
        }
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({ ...prev, items: [...prev.items, { type: '', quantity: 0, price: 0 }] }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple validation
        const isValid = (formData.items.some(item => (item?.quantity > 0) && item?.type) &&
            ((formData.deliveryOption === 'Doorstep' && formData.deliveryAddress) ||
            (formData.deliveryOption === 'Customer Pickup' && formData.pickupLocation)));

        if (!isValid) {
            addNotification('Please fill all mandatory fields.', 'error');
            return;
        }

        const newOrderId = `ord-${(orders.length + 1).toString().padStart(3, '0')}`;
        const newOrder = {
            id: newOrderId,
            ...formData,
            createdAt: new Date().toISOString(),
            status: 'CREATED',
            providerId: partners[0]?.id, // Auto-assign to first active partner for simplicity
            providerName: partners[0]?.name,
            timeline: [{ status: 'CREATED', timestamp: new Date().toISOString(), by: currentUser?.name, remarks: 'Order placed' }],
            auditLog: [{ action: 'Order Placed', timestamp: new Date().toISOString(), user: currentUser?.name, deliveryOption: formData.deliveryOption }],
        };

        setOrders(prevOrders => [...prevOrders, newOrder]);
        setConfirmation(true);
        addNotification(`Order ${newOrderId} placed successfully!`, 'success');
        addActivity(currentUser?.id, currentUser?.role, 'Order Placed', `Order #${newOrderId} placed for $${newOrder.totalAmount.toFixed(2)}`, 'CREATED');
    };

    if (confirmation) {
        return (
            <div className="screen-container">
                <Header currentUser={currentUser} navigate={navigate} logout={logout} breadcrumbs={[{ label: 'Dashboard', path: 'DASHBOARD' }, { label: 'Order Confirmation', path: '#' }]} />
                <div className="confirmation-screen card">
                    <span className="confirmation-icon">🎉</span>
                    <h2>Order Placed Successfully!</h2>
                    <p>Your order #{orders[orders.length - 1]?.id} has been placed. We'll send you updates soon.</p>
                    <div className="confirmation-actions">
                        <button className="button button-primary" onClick={() => navigate('ORDER_LIST')}>View My Orders</button>
                        <button className="button button-secondary" onClick={() => { setConfirmation(false); navigate('ORDER_FORM'); }}>Place Another Order</button>
                    </div>
                </div>
            </div>
        );
    }

    const breadcrumbs = [
      { label: 'Dashboard', path: 'DASHBOARD' },
      { label: 'Place Order', path: 'ORDER_FORM' },
    ];

    return (
      <div className="screen-container form-screen">
        <Header currentUser={currentUser} navigate={navigate} logout={logout} breadcrumbs={breadcrumbs} />
        <h2 className="screen-title">Place New Order</h2>
        <form onSubmit={handleSubmit} className="accordion-form">
          <div className="accordion-panel">
            <h3 className="accordion-header" onClick={() => setActiveSection(prev => prev === 'Order Details' ? '' : 'Order Details')}>
              Order Details {(activeSection === 'Order Details') ? '▲' : '▼'}
            </h3>
            {(activeSection === 'Order Details') && (
              <div className="accordion-content">
                <div className="form-group">
                  <label htmlFor="customerName">Customer Name:</label>
                  <input type="text" id="customerName" value={formData?.customerName || ''} readOnly />
                </div>
                <div className="form-group">
                  <label>Items:</label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="item-input-group">
                      <select
                        value={item?.type || ''}
                        onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                        required
                      >
                        <option value="">Select Item Type</option>
                        {availableClothTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={item?.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        required
                        className={((item?.quantity || 0) <= 0) ? 'input-error' : ''}
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={item?.price?.toFixed(2) || ''}
                        readOnly
                      />
                      <button type="button" className="button-icon button-danger" onClick={() => removeItem(index)}>🗑️</button>
                    </div>
                  ))}
                  <button type="button" className="button button-secondary" onClick={addItem}>Add Item</button>
                </div>
                <div className="form-group">
                  <label>Total Amount:</label>
                  <input type="text" value={`$${formData.totalAmount.toFixed(2)}`} readOnly />
                </div>
              </div>
            )}
          </div>

          <div className="accordion-panel">
            <h3 className="accordion-header" onClick={() => setActiveSection(prev => prev === 'Delivery Options' ? '' : 'Delivery Options')}>
              Delivery Options {(activeSection === 'Delivery Options') ? '▲' : '▼'}
            </h3>
            {(activeSection === 'Delivery Options') && (
              <div className="accordion-content">
                <div className="form-group radio-group">
                  <label>
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="Doorstep"
                      checked={formData.deliveryOption === 'Doorstep'}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryOption: e.target.value, pickupLocation: '' }))}
                    /> Doorstep Delivery
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="Customer Pickup"
                      checked={formData.deliveryOption === 'Customer Pickup'}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryOption: e.target.value, deliveryAddress: '' }))}
                    /> Customer Pickup
                  </label>
                </div>

                {(formData.deliveryOption === 'Doorstep') && (
                  <div className="form-group">
                    <label htmlFor="deliveryAddress">Delivery Address:</label>
                    <input
                      type="text"
                      id="deliveryAddress"
                      value={formData.deliveryAddress || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                      required
                      className={!formData.deliveryAddress ? 'input-error' : ''}
                    />
                    {!formData.deliveryAddress && <span className="validation-message">Delivery address is required.</span>}
                  </div>
                )}

                {(formData.deliveryOption === 'Customer Pickup') && (
                  <div className="form-group">
                    <label htmlFor="pickupLocation">Pickup Location:</label>
                    <select
                        id="pickupLocation"
                        value={formData.pickupLocation || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
                        required
                        className={!formData.pickupLocation ? 'input-error' : ''}
                    >
                        <option value="">Select Pickup Location</option>
                        {partners.filter(p => p.status === 'ACTIVE').map(p => (
                            <option key={p.id} value={p.name}>{p.name} ({p.location})</option>
                        ))}
                    </select>
                    {!formData.pickupLocation && <span className="validation-message">Pickup location is required.</span>}
                  </div>
                )}
              </div>
            )}
          </div>
          <button type="submit" className="button button-primary submit-button">Place Order</button>
        </form>
      </div>
    );
  };

  const AdminOrdersScreen = ({ currentUser, navigate, orders, partners, getStatusColor, handleAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [showFilterPanel, setShowFilterPanel] = useState(false);

    const relevantOrders = orders.filter(order => {
      const matchesSearch = (order?.id?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
                            (order?.customerName?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
                            (order?.status?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
                            (order?.providerName?.toLowerCase()?.includes(searchTerm.toLowerCase()));

      const matchesStatus = filters.status ? (order?.status === filters.status) : true;
      const matchesDelivery = filters.deliveryOption ? (order?.deliveryOption === filters.deliveryOption) : true;
      const matchesPartner = filters.partnerId ? (order?.providerId === filters.partnerId) : true;

      return (matchesSearch && matchesStatus && matchesDelivery && matchesPartner);
    });

    const breadcrumbs = [
        { label: 'Dashboard', path: 'DASHBOARD' },
        { label: 'All Orders', path: 'ADMIN_ORDERS' },
    ];

    return (
        <div className="screen-container">
            <Header currentUser={currentUser} navigate={navigate} logout={logout} breadcrumbs={breadcrumbs} />
            <h2 className="screen-title">All Orders (Admin)</h2>
            <div className="toolbar">
                <input
                    type="text"
                    placeholder="Search orders..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="button button-secondary" onClick={() => setShowFilterPanel(prev => !prev)}>Filter</button>
            </div>

            {(showFilterPanel) && (
                <div className="filter-panel card">
                    <h3>Filters</h3>
                    <div className="form-group">
                        <label htmlFor="filter-status">Status:</label>
                        <select id="filter-status" value={filters.status || ''} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}>
                            <option value="">All</option>
                            {Object.keys(STATUS_MAP).filter(s => s !== 'ALL').map(s => <option key={s} value={s}>{STATUS_MAP[s]}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="filter-delivery">Delivery Option:</label>
                        <select id="filter-delivery" value={filters.deliveryOption || ''} onChange={(e) => setFilters(prev => ({ ...prev, deliveryOption: e.target.value || undefined }))}>
                            <option value="">All</option>
                            {Object.keys(DELIVERY_OPTIONS).map(d => <option key={d} value={d}>{DELIVERY_OPTIONS[d]}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="filter-partner">Partner:</label>
                        <select id="filter-partner" value={filters.partnerId || ''} onChange={(e) => setFilters(prev => ({ ...prev, partnerId: e.target.value || undefined }))}>
                            <option value="">All</option>
                            {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <button className="button button-primary" onClick={() => setShowFilterPanel(false)}>Apply Filters</button>
                        <button className="button button-secondary" onClick={() => { setFilters({}); setShowFilterPanel(false); }}>Clear Filters</button>
                    </div>
                </div>
            )}

            <div className="card-grid">
                {(relevantOrders?.length > 0) ? (
                    relevantOrders.map(order => (
                        <div key={order?.id} className="card order-card" onClick={() => navigate('ORDER_DETAILS', { orderId: order?.id })}>
                            <div className="order-header">
                                <h3>Order #{order?.id}</h3>
                                <span className="status-badge" style={{ backgroundColor: getStatusColor(order?.status) }}>
                                    {STATUS_MAP[order?.status]}
                                </span>
                            </div>
                            <p>Customer: {order?.customerName}</p>
                            <p>Provider: {order?.providerName || 'N/A'}</p>
                            <p>Total: ${order?.totalAmount?.toFixed(2)}</p>
                            <p>Delivery: {DELIVERY_OPTIONS[order?.deliveryOption]}</p>
                        </div>
                    ))
                ) : (
                    <div className="empty-state-card">
                        <span className="empty-state-icon">📦</span>
                        <p>No orders found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const PartnerListScreen = ({ currentUser, navigate, partners }) => {
    const breadcrumbs = [
        { label: 'Dashboard', path: 'DASHBOARD' },
        { label: 'Partners', path: 'PARTNERS_LIST' },
    ];

    return (
        <div className="screen-container">
            <Header currentUser={currentUser} navigate={navigate} logout={logout} breadcrumbs={breadcrumbs} />
            <h2 className="screen-title">Ironing Partners</h2>
            <div className="toolbar">
                <button className="button button-primary" onClick={() => navigate('PARTNER_SETUP_FORM')}>Add New Partner</button>
            </div>
            <div className="card-grid">
                {partners?.map(partner => (
                    <div key={partner.id} className="card partner-card" onClick={() => addNotification(`View details for ${partner?.name} (Simulated)`, 'info')}>
                        <h3>{partner?.name}</h3>
                        <p>Status: <span className="status-badge" style={{ backgroundColor: getStatusColor(partner?.status) }}>{partner?.status}</span></p>
                        <p>Location: {partner?.location}</p>
                        <p>Capacity: {partner?.capacity} orders/day</p>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const PartnerSetupForm = ({ currentUser, navigate, addNotification, partners, setPartners, addActivity }) => {
    const [formData, setFormData] = useState({
        name: '',
        contactEmail: '',
        location: '',
        capacity: 0,
        status: 'ACTIVE'
    });
    const [confirmation, setConfirmation] = useState(false);
    const [activeSection, setActiveSection] = useState('Partner Details');

    const handleSubmit = (e) => {
        e.preventDefault();
        const isValid = (formData.name && formData.contactEmail && formData.location && (formData.capacity > 0));

        if (!isValid) {
            addNotification('Please fill all mandatory fields and ensure capacity is positive.', 'error');
            return;
        }

        const newPartnerId = `prt-${(partners.length + 1).toString().padStart(3, '0')}`;
        const newPartner = {
            id: newPartnerId,
            ...formData,
        };

        setPartners(prev => [...prev, newPartner]);
        setConfirmation(true);
        addNotification(`Partner ${newPartner.name} added successfully!`, 'success');
        addActivity(currentUser?.id, currentUser?.role, 'Partner Added', `New partner ${newPartner.name} added.`, 'CREATED');
    };

    if (confirmation) {
        return (
            <div className="screen-container">
                <Header currentUser={currentUser} navigate={navigate} logout={logout} breadcrumbs={[{ label: 'Dashboard', path: 'DASHBOARD' }, { label: 'Partner Confirmation', path: '#' }]} />
                <div className="confirmation-screen card">
                    <span className="confirmation-icon">✅</span>
                    <h2>Partner Added Successfully!</h2>
                    <p>The new partner {partners[partners.length -1]?.name} has been added to the system.</p>
                    <div className="confirmation-actions">
                        <button className="button button-primary" onClick={() => navigate('PARTNERS_LIST')}>View All Partners</button>
                        <button className="button button-secondary" onClick={() => { setConfirmation(false); setFormData({ name: '', contactEmail: '', location: '', capacity: 0, status: 'ACTIVE' }); }}>Add Another Partner</button>
                    </div>
                </div>
            </div>
        );
    }

    const breadcrumbs = [
        { label: 'Dashboard', path: 'DASHBOARD' },
        { label: 'Partners', path: 'PARTNERS_LIST' },
        { label: 'Add Partner', path: 'PARTNER_SETUP_FORM' },
    ];

    return (
        <div className="screen-container form-screen">
            <Header currentUser={currentUser} navigate={navigate} logout={logout} breadcrumbs={breadcrumbs} />
            <h2 className="screen-title">Setup New Partner</h2>
            <form onSubmit={handleSubmit} className="accordion-form">
                <div className="accordion-panel">
                    <h3 className="accordion-header" onClick={() => setActiveSection(prev => prev === 'Partner Details' ? '' : 'Partner Details')}>
                        Partner Details {(activeSection === 'Partner Details') ? '▲' : '▼'}
                    </h3>
                    {(activeSection === 'Partner Details') && (
                        <div className="accordion-content">
                            <div className="form-group">
                                <label htmlFor="name">Partner Name:</label>
                                <input type="text" id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required className={!formData.name ? 'input-error' : ''} />
                                {!formData.name && <span className="validation-message">Partner name is required.</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="contactEmail">Contact Email:</label>
                                <input type="email" id="contactEmail" value={formData.contactEmail} onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))} required className={!formData.contactEmail ? 'input-error' : ''} />
                                {!formData.contactEmail && <span className="validation-message">Contact email is required.</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="location">Location:</label>
                                <input type="text" id="location" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} required className={!formData.location ? 'input-error' : ''} />
                                {!formData.location && <span className="validation-message">Location is required.</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="capacity">Capacity (orders/day):</label>
                                <input type="number" id="capacity" value={formData.capacity} onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))} min="0" required className={formData.capacity <= 0 ? 'input-error' : ''} />
                                {(formData.capacity <= 0) && <span className="validation-message">Capacity must be greater than 0.</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Status:</label>
                                <select id="status" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
                <button type="submit" className="button button-primary submit-button">Add Partner</button>
            </form>
        </div>
    );
  };

  const RateSetupForm = ({ currentUser, navigate, addNotification, rates, setRates, addActivity }) => {
    const [formData, setFormData] = useState({
      clothType: '',
      pricePerPiece: 0,
    });
    const [confirmation, setConfirmation] = useState(false);
    const [activeSection, setActiveSection] = useState('New Rate');

    const handleSubmit = (e) => {
      e.preventDefault();
      const isValid = (formData.clothType && (formData.pricePerPiece > 0));
      if (!isValid) {
          addNotification('Please fill all mandatory fields and ensure price is positive.', 'error');
          return;
      }

      const rateExists = rates.some(r => r.clothType?.toLowerCase() === formData.clothType?.toLowerCase());
      if (rateExists) {
          addNotification('Rate for this cloth type already exists. Please update the existing rate instead.', 'error');
          return;
      }

      const newRateId = `rate-${(rates.length + 1).toString().padStart(3, '0')}`;
      const newRate = {
          id: newRateId,
          ...formData,
          lastUpdatedBy: currentUser?.name,
          lastUpdatedAt: new Date().toISOString(),
      };

      setRates(prev => [...prev, newRate]);
      setConfirmation(true);
      addNotification(`Rate for ${newRate.clothType} added successfully!`, 'success');
      addActivity(currentUser?.id, currentUser?.role, 'Rate Added', `New rate for ${newRate.clothType} added.`, 'CREATED');
    };

    const handleUpdateRate = (id, newPrice) => {
      if ((newPrice <= 0) || isNaN(newPrice)) {
        addNotification('Price must be a positive number.', 'error');
        return;
      }
      setRates(prev => prev.map(rate =>
        rate.id === id
          ? { ...rate, pricePerPiece: parseFloat(newPrice), lastUpdatedBy: currentUser?.name, lastUpdatedAt: new Date().toISOString() }
          : rate
      ));
      addNotification('Rate updated successfully!', 'success');
      const updatedRate = rates.find(r => r.id === id);
      addActivity(currentUser?.id, currentUser?.role, 'Rate Updated', `Price for ${updatedRate?.clothType} updated to $${parseFloat(newPrice).toFixed(2)}.`, 'UPDATED');
    };

    if (confirmation) {
      return (
          <div className="screen-container">
              <Header currentUser={currentUser} navigate={navigate} logout={logout} breadcrumbs={[{ label: 'Dashboard', path: 'DASHBOARD' }, { label: 'Rate Confirmation', path: '#' }]} />
              <div className="confirmation-screen card">
                  <span className="confirmation-icon">💲</span>
                  <h2>Rate Added Successfully!</h2>
                  <p>A new rate for {rates[rates.length -1]?.clothType} has been added.</p>
                  <div className="confirmation-actions">
                      <button className="button button-primary" onClick={() => navigate('RATE_SETUP_FORM')}>Setup Another Rate</button>
                      <button className="button button-secondary" onClick={() => navigate('DASHBOARD')}>Back to Dashboard</button>
                  </div>
              </div>
          </div>
      );
    }

    const breadcrumbs = [
        { label: 'Dashboard', path: 'DASHBOARD' },
        { label: 'Rate Setup', path: 'RATE_SETUP_FORM' },
    ];

    return (
        <div className="screen-container form-screen">
            <Header currentUser={currentUser} navigate={navigate} logout={logout} breadcrumbs={breadcrumbs} />
            <h2 className="screen-title">Manage Ironing Rates</h2>

            <div className="card rates-list-card">
              <h3>Existing Rates</h3>
              <div className="rate-item-grid">
                {rates?.map(rate => (
                  <div key={rate.id} className="rate-item">
                    <span>{rate?.clothType}: </span>
                    <input
                      type="number"
                      value={rate?.pricePerPiece}
                      onChange={(e) => handleUpdateRate(rate?.id, e.target.value)}
                      min="0.01"
                      step="0.01"
                      className={((rate?.pricePerPiece || 0) <= 0) ? 'input-error' : ''}
                    />
                    <span> $/piece</span>
                    <span className="rate-update-info">Last Updated: {new Date(rate?.lastUpdatedAt).toLocaleDateString()} by {rate?.lastUpdatedBy}</span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="accordion-form">
                <div className="accordion-panel">
                    <h3 className="accordion-header" onClick={() => setActiveSection(prev => prev === 'New Rate' ? '' : 'New Rate')}>
                        Add New Rate {(activeSection === 'New Rate') ? '▲' : '▼'}
                    </h3>
                    {(activeSection === 'New Rate') && (
                        <div className="accordion-content">
                            <div className="form-group">
                                <label htmlFor="clothType">Cloth Type:</label>
                                <input type="text" id="clothType" value={formData.clothType} onChange={(e) => setFormData(prev => ({ ...prev, clothType: e.target.value }))} required className={!formData.clothType ? 'input-error' : ''} />
                                {!formData.clothType && <span className="validation-message">Cloth type is required.</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="pricePerPiece">Price Per Piece ($):</label>
                                <input type="number" id="pricePerPiece" value={formData.pricePerPiece} onChange={(e) => setFormData(prev => ({ ...prev, pricePerPiece: parseFloat(e.target.value) || 0 }))} min="0.01" step="0.01" required className={formData.pricePerPiece <= 0 ? 'input-error' : ''} />
                                {(formData.pricePerPiece <= 0) && <span className="validation-message">Price must be greater than 0.</span>}
                            </div>
                        </div>
                    )}
                </div>
                <button type="submit" className="button button-primary submit-button">Add Rate</button>
            </form>
        </div>
    );
  };


  // --- Screen Renderer ---

  const renderScreen = useCallback(() => {
    if (!currentUser) {
      return <AuthScreen onLogin={login} />;
    }

    switch (view.screen) {
      case 'DASHBOARD':
        return <DashboardScreen
                    currentUser={currentUser}
                    navigate={navigate}
                    orders={orders}
                    activities={activities}
                    partners={partners}
                    rates={rates}
                    addNotification={addNotification}
                    getStatusColor={getStatusColor}
                />;
      case 'ORDER_LIST':
      case 'ORDER_QUEUE':
        return <OrderListScreen
                    currentUser={currentUser}
                    navigate={navigate}
                    orders={orders}
                    getStatusColor={getStatusColor}
                    handleAction={handleOrderAction}
                    filterParams={view?.params}
                    partners={partners}
                />;
      case 'ORDER_DETAILS':
        return <OrderDetailsScreen
                    currentUser={currentUser}
                    navigate={navigate}
                    orders={orders}
                    orderId={view?.params?.orderId}
                    getStatusColor={getStatusColor}
                    handleAction={handleOrderAction}
                />;
      case 'ORDER_FORM':
        return <OrderForm
                    currentUser={currentUser}
                    navigate={navigate}
                    addNotification={addNotification}
                    rates={rates}
                    orders={orders}
                    setOrders={setOrders}
                    partners={partners}
                    addActivity={addActivity}
                />;
      case 'ADMIN_ORDERS':
        return <AdminOrdersScreen
                    currentUser={currentUser}
                    navigate={navigate}
                    orders={orders}
                    partners={partners}
                    getStatusColor={getStatusColor}
                    handleAction={handleOrderAction}
                    filterParams={view?.params}
                />;
      case 'PARTNERS_LIST':
        return <PartnerListScreen
                    currentUser={currentUser}
                    navigate={navigate}
                    partners={partners}
                />;
      case 'PARTNER_SETUP_FORM':
        return <PartnerSetupForm
                    currentUser={currentUser}
                    navigate={navigate}
                    addNotification={addNotification}
                    partners={partners}
                    setPartners={setPartners}
                    addActivity={addActivity}
                />;
      case 'RATE_SETUP_FORM':
        return <RateSetupForm
                    currentUser={currentUser}
                    navigate={navigate}
                    addNotification={addNotification}
                    rates={rates}
                    setRates={setRates}
                    addActivity={addActivity}
                />;
      default:
        return <div className="empty-state-card">
                 <span className="empty-state-icon">🚧</span>
                 <p>Screen not found or not implemented yet for <strong>{view.screen}</strong>.</p>
               </div>;
    }
  }, [currentUser, view, login, navigate, logout, orders, partners, rates, activities, handleOrderAction, addNotification, getStatusColor, setOrders, setPartners, setRates, addActivity]);

  const breadcrumbsForHeader = useCallback(() => {
      const base = [{ label: 'Dashboard', path: 'DASHBOARD' }];
      switch(view.screen) {
          case 'DASHBOARD': return [];
          case 'ORDER_LIST':
          case 'ORDER_QUEUE': return [...base, { label: (currentUser?.role === ROLES.SERVICE_PROVIDER) ? 'Order Queue' : 'My Orders', path: 'ORDER_LIST' }];
          case 'ORDER_DETAILS':
            const orderLabel = `Order #${view?.params?.orderId}`;
            return [...base, { label: (currentUser?.role === ROLES.SERVICE_PROVIDER) ? 'Order Queue' : 'My Orders', path: 'ORDER_LIST' }, { label: orderLabel, path: 'ORDER_DETAILS', params: view?.params }];
          case 'ORDER_FORM': return [...base, { label: 'Place New Order', path: 'ORDER_FORM' }];
          case 'ADMIN_ORDERS': return [...base, { label: 'All Orders', path: 'ADMIN_ORDERS' }];
          case 'PARTNERS_LIST': return [...base, { label: 'Partners', path: 'PARTNERS_LIST' }];
          case 'PARTNER_SETUP_FORM': return [...base, { label: 'Partners', path: 'PARTNERS_LIST' }, { label: 'Add Partner', path: 'PARTNER_SETUP_FORM' }];
          case 'RATE_SETUP_FORM': return [...base, { label: 'Rate Setup', path: 'RATE_SETUP_FORM' }];
          default: return [];
      }
  }, [view.screen, view.params, currentUser]);


  return (
    <div className="app-container">
      {(currentUser) && <Header currentUser={currentUser} navigate={navigate} logout={logout} breadcrumbs={breadcrumbsForHeader()} />}
      <main className="main-content">
        {renderScreen()}
      </main>
      <div className="notifications-container">
        {notifications.map(notification => (
          <NotificationToast key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
};

export default App;